export type DayInfo = {
  date: Date
  dayNumber: number
  isCurrentMonth: boolean
  isToday: boolean
}

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
]

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

export function getMonthName(month: number) {
  return MONTHS[month]
}

export function getDayName(day: number) {
  return DAYS[day]
}

export function formatMonthYear(date: Date) {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
}

export function isToday(date: Date) {
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

export function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getMonthGrid(year: number, month: number): DayInfo[][] {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()

  const startDayOfWeek = (firstDay.getDay() + 6) % 7

  const weeks: DayInfo[][] = []
  let week: DayInfo[] = []

  const prevMonthLastDay = new Date(year, month, 0).getDate()

  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(year, month - 1, prevMonthLastDay - i)
    week.push({
      date,
      dayNumber: date.getDate(),
      isCurrentMonth: false,
      isToday: isToday(date),
    })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    week.push({
      date,
      dayNumber: d,
      isCurrentMonth: true,
      isToday: isToday(date),
    })
    if (week.length === 7) {
      weeks.push(week)
      week = []
    }
  }

  if (week.length > 0) {
    let nextDay = 1
    while (week.length < 7) {
      const date = new Date(year, month + 1, nextDay)
      week.push({
        date,
        dayNumber: nextDay,
        isCurrentMonth: false,
        isToday: isToday(date),
      })
      nextDay++
    }
    weeks.push(week)
  }

  return weeks
}

export function getWeekDays(date: Date): DayInfo[] {
  const dayOfWeek = (date.getDay() + 6) % 7
  const monday = new Date(date)
  monday.setDate(date.getDate() - dayOfWeek)

  const days: DayInfo[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      date: d,
      dayNumber: d.getDate(),
      isCurrentMonth: d.getMonth() === date.getMonth(),
      isToday: isToday(d),
    })
  }
  return days
}

export function addMonths(date: Date, n: number): Date {
  const d = new Date(date)
  d.setMonth(d.getMonth() + n)
  return d
}

export function addWeeks(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + 7 * n)
  return d
}

export function formatDateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function isSunday(date: Date): boolean {
  return date.getDay() === 0
}
