# Patrón MPC con Groq AI en Next.js (App Router)

Guía para replicar la arquitectura de un chat con tool calling usando **Groq SDK** dentro de una API Route de Next.js.

---

## Estructura de carpetas

```
app/
└── api/
    └── chat/
        ├── route.ts          ← endpoint principal POST
        └── tools/
            ├── index.ts      ← exporta tools[] y toolExecutors
            ├── [tuTool1].tool.ts
            ├── [tuTool2].tool.ts
            └── [tuTool3].tool.ts
```

---

## Variables de entorno

En tu archivo `.env.local` (nunca en el código):

```env
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> **Importante:** La API key de Groq se consume **exclusivamente** desde `process.env.GROQ_API_KEY` en el servidor. Nunca la expongas al cliente ni la hardcodees. Next.js con App Router solo expone variables sin prefijo `NEXT_PUBLIC_` al lado del servidor, así que este nombre es seguro.

---

## 1. Instalación

```bash
npm install groq-sdk
```

---

## 2. `route.ts` — Endpoint principal

```typescript
import Groq from 'groq-sdk'
import { NextResponse } from 'next/server'
import { tools, toolExecutors } from './tools'

// ── Instancia del cliente Groq ──────────────────────────────────────────────
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY, // ← variable de entorno
})

// ── Modelo a usar ───────────────────────────────────────────────────────────
const MODEL = 'llama-3.3-70b-versatile' // cambia según tu caso

// ── Tipos ───────────────────────────────────────────────────────────────────
type FrontendMessage = {
  role: string
  content: string
  toolResult?: {
    name: string
    data: unknown
  }
}

// ── System prompt ───────────────────────────────────────────────────────────
// TODO: Reemplaza esto con el contexto y reglas de tu MPC
const SYSTEM_PROMPT = `
Eres un asistente especializado en [TEMA DE TU MPC].

REGLAS:
- NUNCA menciones los nombres técnicos de tus tools en las respuestas al usuario.
- [REGLA 2: cuándo usar cada tool]
- [REGLA 3: cómo responder al usuario]
- Responde siempre en texto plano, sin markdown.

ANÁLISIS POST-TOOL:
- Si el usuario expresa satisfacción → confirma y ofrece ayuda adicional.
- Si expresa insatisfacción → pregunta qué ajustar.
- Si hace una nueva solicitud → procesa con tools si aplica.
`

// ── Handler POST ─────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  try {
    // Opcional: autenticación de usuario (ej. Clerk, NextAuth, etc.)
    // const { userId } = await auth()
    // if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Opcional: rate limiting por usuario
    // const limit = rateLimit(`chat:${userId}`, 20, 60 * 1000)
    // if (!limit.success) return NextResponse.json({ error: '...' }, { status: 429 })

    // Obtener contexto específico del usuario desde tu DB
    // const userContext = await getUserContext()

    const { messages } = await req.json()

    // Detectar si hay un toolResult previo para contexto dinámico
    const lastToolMsg = messages.findLast((msg: FrontendMessage) =>
      msg.role === 'assistant' && msg.toolResult
    )

    const contextPrompt = lastToolMsg
      ? `\n\nCONTEXTO: La última vez ejecutaste la tool "${lastToolMsg.toolResult.name}". Analiza si el usuario está satisfecho antes de usar otra tool.`
      : ''

    // Limpiar historial: solo mensajes con contenido real
    const cleanMessages = messages
      .filter((msg: FrontendMessage) =>
        msg.role === 'user' ||
        (msg.role === 'assistant' && msg.content && msg.content.trim().length > 0)
      )
      .map(({ role, content }: FrontendMessage) => ({ role, content }))

    // Llamada a Groq
    const response = await client.chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT + contextPrompt },
        ...cleanMessages,
      ],
      tools,
      tool_choice: 'auto',
    })

    const responseMessage = response.choices[0].message
    const toolCalls = responseMessage.tool_calls

    // Si el modelo decidió usar tools
    if (toolCalls) {
      cleanMessages.push(responseMessage)

      const toolResults: { name: string; data: unknown }[] = []

      for (const toolCall of toolCalls) {
        const args = JSON.parse(toolCall.function.arguments)
        const executor = toolExecutors[toolCall.function.name]

        // Pasa los args y cualquier contexto de usuario que necesite el executor
        const result = await executor(args /*, userContext.id */)

        toolResults.push({ name: toolCall.function.name, data: result })

        cleanMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        })
      }

      // Devuelve directamente sin segunda llamada al modelo
      // El modelo analiza la reacción del usuario en el siguiente turno
      const initialResponse = responseMessage.content || 'Aquí está el resultado. ¿Estás conforme?'

      return NextResponse.json({
        message: initialResponse,
        toolResult: toolResults[0] ?? null,
        needsUserConfirmation: true,
      })
    }

    // Respuesta normal sin tool calls
    return NextResponse.json({ message: responseMessage.content })

  } catch (error) {
    console.error('Error en /api/chat:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
```

---

## 3. Estructura de una Tool — `[tuTool].tool.ts`

Cada tool sigue este patrón exacto:

```typescript
// Importa la acción de negocio que ejecuta la tool
import { tuAccion } from '@/actions/[modulo]/[archivo]'

export const tuToolTool = {
  type: 'function' as const,
  function: {
    name: 'tuTool',                              // ← nombre que Groq invoca
    description: `Descripción clara de qué hace esta tool y cuándo el modelo debe usarla.
Sé específico: incluye casos de uso y cuándo NO usar esta tool.`,
    parameters: {
      type: 'object',
      properties: {
        // TODO: Define los parámetros que el modelo debe extraer del mensaje
        param1: {
          type: 'string',
          description: 'Qué es este parámetro',
          maxLength: 70,               // opcional
        },
        param2: {
          type: 'number',
          description: 'Qué es este parámetro',
        },
        // Agrega más según necesites
      },
      required: ['param1'],            // ← parámetros obligatorios
      additionalProperties: false,
    },
  },

  // Función que se ejecuta cuando el modelo llama a esta tool
  execute: async (args: { param1: string; param2?: number } /*, userId?: string */) => {
    return await tuAccion(args.param1, args.param2)
  },
}
```

---

## 4. `tools/index.ts` — Registro central de tools

```typescript
import { tuTool1Tool } from './[tuTool1].tool'
import { tuTool2Tool } from './[tuTool2].tool'
// agrega más imports aquí

// Array que se pasa a Groq (define el esquema de cada tool)
export const tools = [tuTool1Tool, tuTool2Tool]

// Map de ejecutores: nombre de la tool → función que la corre
// El segundo argumento (ej. userId) es opcional según tu caso
export const toolExecutors: Record<string, (args: any, userId?: string) => Promise<any>> = {
  tuTool1: (args, userId) => tuTool1Tool.execute({ ...args, userId }),
  tuTool2: (args) => tuTool2Tool.execute(args),
  // agrega más según las tools que tengas
}
```

---

## 5. Checklist para tu nueva MPC

- [ ] Crear carpeta `app/api/chat/tools/`
- [ ] Definir `GROQ_API_KEY` en `.env.local`
- [ ] Escribir el `SYSTEM_PROMPT` con las reglas de tu dominio
- [ ] Crear al menos un archivo `[nombre].tool.ts` con su `execute()`
- [ ] Registrar la tool en `tools/index.ts` (en el array `tools` y en `toolExecutors`)
- [ ] Conectar `toolExecutors` con tus acciones de negocio reales (`@/actions/...`)
- [ ] (Opcional) Agregar autenticación antes de procesar mensajes
- [ ] (Opcional) Agregar rate limiting por usuario

---

## 6. Notas clave del patrón

**Sin segunda llamada al modelo tras una tool.** El resultado se devuelve directamente al frontend con `needsUserConfirmation: true`. El modelo analiza la reacción del usuario en el siguiente turno del chat, evitando "tool loops".

**Limpieza de historial.** Solo se mandan al modelo mensajes con contenido real (ni JSONs gigantes de tools anteriores, ni mensajes vacíos). Esto previene contextos fantasma.

**Contexto dinámico.** Si había una tool ejecutada previamente, se inyecta un `contextPrompt` adicional en el system prompt para que el modelo sepa analizar si el usuario está conforme antes de llamar otra tool.

**Separación de responsabilidades.** Cada tool vive en su propio archivo `.tool.ts`, el `index.ts` solo registra y reexporta, y `route.ts` solo orquesta.