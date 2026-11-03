import axios from 'axios'

const baseURL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

const client = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
})

client.interceptors.request.use((config) => {
  if (
    typeof document !== 'undefined' &&
    ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())
  ) {
    const csrfCookie = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('csrftoken='))
    if (csrfCookie) {
      config.headers.set('X-CSRFToken', decodeURIComponent(csrfCookie.slice(10)))
    }
  }
  return config
})

function normalizeStudent(record) {
  if (
    !record ||
    (typeof record.id !== 'number' && typeof record.id !== 'string') ||
    typeof record.name !== 'string' ||
    typeof record.email !== 'string' ||
    !Number.isInteger(Number(record.age)) ||
    typeof record.course !== 'string' ||
    typeof record.created_at !== 'string'
  ) {
    throw new Error('The student API returned a record in an unexpected format.')
  }

  const date = new Date(record.created_at)
  if (Number.isNaN(date.getTime())) {
    throw new Error('The student API returned an invalid registration date.')
  }

  return {
    id: String(record.id),
    name: record.name,
    email: record.email,
    age: Number(record.age),
    course: record.course,
    registrationDate: date.toISOString().slice(0, 10),
    status: 'Registered',
  }
}

function getErrorMessage(data, status) {
  if (typeof data?.detail === 'string') return data.detail
  if (typeof data?.error === 'string') return data.error

  if (status === 400 && data && typeof data === 'object') {
    const firstError = Object.values(data).flat().find((value) => typeof value === 'string')
    if (firstError) return firstError
  }

  if (status === 401 || status === 403) {
    return 'The student API rejected this request. Check the Django authentication and CSRF configuration.'
  }
  if (status === 404) return 'The requested student record was not found.'
  if (status >= 500) return 'Django could not complete the request. Please try again.'
  return 'The student request could not be completed.'
}

function toApiError(error) {
  if (!axios.isAxiosError(error)) return error

  if (!error.response) {
    const message = error.code === 'ECONNABORTED'
      ? 'The Django API request timed out. Please try again.'
      : 'Could not connect to the Django API. Check that the backend is running and the API URL is correct.'
    return new Error(message, { cause: error })
  }

  const apiError = new Error(getErrorMessage(error.response.data, error.response.status), {
    cause: error,
  })
  apiError.status = error.response.status
  apiError.fields = Object.fromEntries(
    Object.entries(error.response.data ?? {})
      .filter(([key, value]) => key !== 'detail' && key !== 'error' && value != null)
      .map(([key, value]) => [
        key,
        Array.isArray(value) ? String(value[0] ?? '') : String(value),
      ]),
  )
  return apiError
}

async function requestStudent(path, options) {
  try {
    const response = await client.request({ url: path, ...options })
    return response.data
  } catch (error) {
    throw toApiError(error)
  }
}

export async function fetchStudents({ signal } = {}) {
  const records = await requestStudent('/students/', { method: 'GET', signal })
  if (!Array.isArray(records)) {
    throw new Error('The student API returned an unexpected response. Expected a list of students.')
  }
  return records.map(normalizeStudent)
}

export async function fetchStudentRecord(id, { signal } = {}) {
  const record = await requestStudent(`/students/${encodeURIComponent(id)}/`, {
    method: 'GET',
    signal,
  })
  return normalizeStudent(record)
}

export async function createStudent(student) {
  const record = await requestStudent('/students/', {
    method: 'POST',
    data: student,
  })
  return normalizeStudent(record)
}

export async function updateStudentRecord(id, student) {
  const record = await requestStudent(`/students/${encodeURIComponent(id)}/`, {
    method: 'PUT',
    data: student,
  })
  return normalizeStudent(record)
}

export async function deleteStudentRecord(id) {
  await requestStudent(`/students/${encodeURIComponent(id)}/`, {
    method: 'DELETE',
  })
}
