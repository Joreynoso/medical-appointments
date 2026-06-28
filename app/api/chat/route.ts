import Groq from "groq-sdk"
import type { ChatCompletionMessageParam } from "groq-sdk/resources/chat/completions"
import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { tools, toolExecutors, toolValidators, destructiveToolNames } from "./tools"

const client = new Groq({ apiKey: process.env.GROQ_API_KEY })

const MODEL = "llama-3.3-70b-versatile"

function systemPrompt(): string {
  const ahora = new Date()
  const dia = ahora.toLocaleDateString("es-AR", { weekday: "long", timeZone: "UTC" })
  const fecha = ahora.toISOString().slice(0, 10)
  const hora = ahora.toISOString().slice(11, 16)
  return `Hoy es ${fecha} (${dia}). Hora UTC actual: ${hora}.

Eres un asistente especializado en gestión de turnos médicos. Ayudas a un profesional de la salud a consultar su agenda.

REGLAS:
- Usa la herramienta 'buscar_turnos' cuando el profesional pregunte por turnos (ej: "qué turnos tengo hoy", "mostrame la agenda", "quién viene mañana", "turnos de Juan", "dame los confirmados").
- Usa la herramienta 'consultar_disponibilidad' cuando pregunte por horarios libres (ej: "hay lugar mañana a las 10?", "qué slots libres hay?", "hay algún slot el viernes?").
- Usa 'listar_pacientes' cuando pregunte por el listado de pacientes (ej: "mostrame mis pacientes", "quiénes son mis pacientes", "dame el listado de pacientes").
- Usa 'crear_turno' para agendar un nuevo turno y 'cancelar_turno' para cancelar uno existente. Ambas requieren confirmación del profesional antes de ejecutarse.
- NUNCA menciones los nombres técnicos de las herramientas en tus respuestas.
- Responde SIEMPRE en formato Markdown. Usá negritas, listas y viñetas. NUNCA USES TABLAS.
- Para listar turnos: usá una lista con viñetas. Por cada turno: **Paciente** (Hora) — Estado.
- Para disponibilidad: listá los horarios libres con viñetas.
- Las fechas mostralas en formato legible: "lunes 18 de junio".
- Si no hay turnos o disponibilidad, decilo claramente.
- Si la consulta es ambigua, pedí más datos.
- Cuando una herramienta devuelva '_args' en su respuesta, usá esos valores (fecha, hora, etc.) para mantener el contexto en el siguiente intento si el usuario no repite los detalles.
- Responde siempre en español.`
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()

    // ── CONFIRM TOOL CALL (execution after user confirms) ──
    if (body.confirmToolCall) {
      const { name, args } = body.confirmToolCall
      const contextMessages: { role: string; content: string }[] = body.contextMessages ?? []

      const executor = toolExecutors[name]
      if (!executor) {
        return NextResponse.json({ error: `Tool "${name}" no encontrada.` }, { status: 400 })
      }

      let result: any
      try {
        result = await executor(args, userId)
      } catch (e: any) {
        return NextResponse.json({
          message: `❌ Error al ejecutar la operación: ${e.message || "Error desconocido"}`,
        })
      }

      let formattedMessage: string
      try {
        const formatMessages: ChatCompletionMessageParam[] = [
          { role: "system", content: systemPrompt() },
          ...contextMessages.slice(-6) as ChatCompletionMessageParam[],
          { role: "user", content: `Resultado de la operación "${name}":\n${JSON.stringify(result)}\n\nInformá al profesional del resultado en formato Markdown con viñetas. No uses tablas.` },
        ]

        const formatResponse = await client.chat.completions.create({
          model: MODEL,
          temperature: 0.2,
          messages: formatMessages,
        })
        formattedMessage = formatResponse.choices[0].message.content || "✅ Operación completada."
      } catch (e) {
        console.error("Error formateando resultado:", e)
        const labels: Record<string, string> = { crear_turno: "Turno creado", cancelar_turno: "Turno cancelado" }
        formattedMessage = `✅ ${labels[name] ?? "Operación completada"} correctamente.`
      }

      return NextResponse.json({ message: formattedMessage })
    }

    // ── REGULAR CHAT FLOW ──
    const { messages } = body

    const cleanMessages = messages
      .filter(
        (msg: any) =>
          msg.role === "user" ||
          (msg.role === "assistant" && msg.content?.trim().length > 0),
      )
      .map(({ role, content }: any) => ({ role, content }))

    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt() },
        ...cleanMessages,
      ],
      tools,
      tool_choice: "auto",
    })

    const responseMessage = response.choices[0].message
    const toolCalls = responseMessage.tool_calls

    if (!toolCalls) {
      return NextResponse.json({ message: responseMessage.content })
    }

    cleanMessages.push({ role: "assistant", content: responseMessage.content || "" })

    const isDestructive = toolCalls.some((tc) => destructiveToolNames.has(tc.function.name))

    if (isDestructive) {
      // ── DESTRUCTIVE TOOLS: validate first, ask for confirmation ──
      let allValid = true

      for (const toolCall of toolCalls) {
        const args = JSON.parse(toolCall.function.arguments)
        const validator = toolValidators[toolCall.function.name]
        if (!validator) continue

        const result = await validator(args, userId)
        cleanMessages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        })

        if (result.esValido === false) {
          allValid = false
        }
      }

      const secondResponse = await client.chat.completions.create({
        model: MODEL,
        temperature: 0.2,
        messages: [
          {
            role: "system",
            content: systemPrompt()
              + (allValid
                ? "\n\n⚠️ REGLA ESTRICTA: La herramienta devolvió una VALIDACIÓN, NO una ejecución. El turno NO fue creado/cancelado. No digas que la operación se completó, que el turno fue creado, o que ya está agendado. Tu única tarea es preguntar al profesional si desea confirmar la operación (Sí / No). No respondas por el profesional."
                : ""),
          },
          ...cleanMessages,
        ],
      })

      return NextResponse.json({
        message: secondResponse.choices[0].message.content || "",
        ...(allValid && {
          needsConfirmation: true,
          toolCall: {
            name: toolCalls[0].function.name,
            args: JSON.parse(toolCalls[0].function.arguments),
          },
        }),
      })
    }

    // ── READ-ONLY TOOLS: execute and return results ──
    for (const toolCall of toolCalls) {
      const args = JSON.parse(toolCall.function.arguments)
      const executor = toolExecutors[toolCall.function.name]
      if (!executor) continue

      const result = await executor(args, userId)

      if (result.formattedMessage) {
        return NextResponse.json({
          message: result.formattedMessage,
          toolResult: toolCalls[0]?.function?.name ?? null,
        })
      }

      cleanMessages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      })
    }

    const secondResponse = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt() },
        ...cleanMessages,
      ],
    })

    return NextResponse.json({
      message: secondResponse.choices[0].message.content || "",
      toolResult: toolCalls[0]?.function?.name ?? null,
    })
  } catch (error) {
    console.error("Error en /api/chat:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
