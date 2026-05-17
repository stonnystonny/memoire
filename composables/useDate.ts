export function useDate() {
  function toISO(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }

  function today(): string {
    return toISO(new Date())
  }

  function formatDisplay(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('ru-RU', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  function formatShort(dateStr: string): string {
    const d = new Date(dateStr + 'T12:00:00')
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  }

  function monthName(year: number, month: number): string {
    return new Date(year, month, 1).toLocaleDateString('ru-RU', {
      month: 'long', year: 'numeric'
    })
  }

  function getDaysInMonth(year: number, month: number) {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []

    let startDow = firstDay.getDay() - 1
    if (startDow < 0) startDow = 6
    for (let i = 0; i < startDow; i++) {
      const d = new Date(year, month, -startDow + i + 1)
      days.push({ date: toISO(d), currentMonth: false })
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push({ date: toISO(new Date(year, month, i)), currentMonth: true })
    }

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: toISO(new Date(year, month + 1, i)), currentMonth: false })
    }

    return days
  }

  return { toISO, today, formatDisplay, formatShort, monthName, getDaysInMonth }
}
