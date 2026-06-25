"use client"

import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type TurnosPorMesProps = {
  data: { mes: string; total: number }[]
}

const chartConfig = {
  total: {
    label: "Turnos",
    color: "var(--primary)",
  },
}

export function TurnosPorMesChart({ data }: TurnosPorMesProps) {
  const maxVal = Math.max(...data.map((d) => d.total), 1)

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <LineChart data={data}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="mes"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          domain={[0, maxVal + 2]}
          width={24}
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <ChartTooltip
          cursor={{ stroke: "var(--muted)", strokeWidth: 1 }}
          content={<ChartTooltipContent />}
        />
        <Line
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          strokeWidth={2}
          dot={{ fill: "var(--color-total)", r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
