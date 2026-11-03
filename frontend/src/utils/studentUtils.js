export function getInitials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function formatDate(date) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function formatShortDate(date) {
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
}

export function getCourseCounts(students) {
  return students.reduce((counts, student) => {
    counts[student.course] = (counts[student.course] ?? 0) + 1
    return counts
  }, {})
}

export function getRegistrationTrend(students, currentMonth) {
  return Array.from({ length: 6 }, (_, index) => {
    const monthDate = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 5 + index,
      1,
    )
    const label = new Intl.DateTimeFormat('en', { month: 'short' }).format(
      monthDate,
    )
    const count = students.filter((student) => {
      const date = new Date(`${student.registrationDate}T00:00:00`)
      return (
        date.getFullYear() === monthDate.getFullYear() &&
        date.getMonth() === monthDate.getMonth()
      )
    }).length
    return { month: label, registrations: count }
  })
}
