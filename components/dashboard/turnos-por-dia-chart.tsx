"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

type TurnosPorDiaProps = {
  data: { dia: string; turnos: number }[]
}

const chartConfig = {
  turnos: {
    label: "Turnos",
    color: "var(--chart-1)",
  },
}

export function TurnosPorDiaChart({ data }: TurnosPorDiaProps) {
  const maxVal = Math.max(...data.map((d) => d.turnos), 1)

  return (
    <ChartContainer config={chartConfig} className="h-full w-full">
      <BarChart data={data} barCategoryGap="20%">
        <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/50" />
        <XAxis
          dataKey="dia"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          domain={[0, maxVal + 1]}
          width={24}
          tick={{ fontSize: 11 }}
          className="fill-muted-foreground"
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="turnos"
          fill="var(--color-turnos)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  )
}
