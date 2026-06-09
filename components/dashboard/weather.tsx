"use client"

import { useEffect, useState } from "react"
import { Sun, CloudSun, Cloud, CloudFog, CloudDrizzle, CloudRain, CloudSnow, CloudLightning, CloudAlert } from "lucide-react"
import type { LucideIcon } from "lucide-react"

interface WeatherData {
  temperature: number
  weatherCode: number
}

interface WeatherConfig {
  label: string
  Icon: LucideIcon
}

const WEATHER_CONFIG: Record<number, WeatherConfig> = {
  0: { label: "Despejado", Icon: Sun },
  1: { label: "Mayormente despejado", Icon: Sun },
  2: { label: "Parcialmente nublado", Icon: CloudSun },
  3: { label: "Nublado", Icon: Cloud },
  45: { label: "Niebla", Icon: CloudFog },
  48: { label: "Niebla helada", Icon: CloudFog },
  51: { label: "Llovizna ligera", Icon: CloudDrizzle },
  53: { label: "Llovizna moderada", Icon: CloudDrizzle },
  55: { label: "Llovizna densa", Icon: CloudDrizzle },
  56: { label: "Llovizna helada ligera", Icon: CloudDrizzle },
  57: { label: "Llovizna helada densa", Icon: CloudDrizzle },
  61: { label: "Lluvia ligera", Icon: CloudRain },
  63: { label: "Lluvia moderada", Icon: CloudRain },
  65: { label: "Lluvia intensa", Icon: CloudRain },
  66: { label: "Lluvia helada ligera", Icon: CloudRain },
  67: { label: "Lluvia helada intensa", Icon: CloudRain },
  71: { label: "Nevada ligera", Icon: CloudSnow },
  73: { label: "Nevada moderada", Icon: CloudSnow },
  75: { label: "Nevada intensa", Icon: CloudSnow },
  77: { label: "Granos de nieve", Icon: CloudSnow },
  80: { label: "Chubascos ligeros", Icon: CloudRain },
  81: { label: "Chubascos moderados", Icon: CloudRain },
  82: { label: "Chubascos violentos", Icon: CloudRain },
  85: { label: "Chubascos de nieve ligeros", Icon: CloudSnow },
  86: { label: "Chubascos de nieve intensos", Icon: CloudSnow },
  95: { label: "Tormenta eléctrica", Icon: CloudLightning },
  96: { label: "Tormenta con granizo ligero", Icon: CloudLightning },
  99: { label: "Tormenta con granizo intenso", Icon: CloudLightning },
}

function getWeatherConfig(code: number): WeatherConfig {
  return WEATHER_CONFIG[code] ?? { label: "Desconocido", Icon: CloudAlert }
}

export function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    async function fetchWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=-28.47&longitude=-65.79&current=temperature_2m,weather_code&timezone=auto",
          { signal: controller.signal },
        )
        if (!res.ok) throw new Error("Failed to fetch")
        const data = await res.json()
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
        })
        setError(false)
      } catch {
        if (!controller.signal.aborted) {
          setError(true)
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    fetchWeather()

    return () => controller.abort()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
        <div className="size-5 rounded-full bg-muted-foreground/20" />
        <span>Cargando widget de clima...</span>
      </div>
    )
  }

  if (error || !weather) {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive">
        <CloudAlert className="size-5" />
        <span>Error al cargar el clima</span>
      </div>
    )
  }

  const { Icon, label } = getWeatherConfig(weather.weatherCode)

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="flex size-8 items-center justify-center rounded-lg bg-accent">
        <Icon className="size-4 text-primary" />
      </span>
      <span className="font-medium">{weather.temperature}°</span>
      <span className="text-muted-foreground">{label}</span>
      <span className="text-muted-foreground">Catamarca</span>
    </div>
  )
}
