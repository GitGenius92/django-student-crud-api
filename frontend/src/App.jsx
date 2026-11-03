import { Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import {
  createStudent as createStudentRequest,
  deleteStudentRecord,
  fetchStudents,
  updateStudentRecord,
} from './api/students.js'
import DashboardLayout from './components/DashboardLayout.jsx'
import Toast from './components/Toast.jsx'

const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'))
const StudentDetailsPage = lazy(() => import('./pages/StudentDetailsPage.jsx'))
const StudentFormPage = lazy(() => import('./pages/StudentFormPage.jsx'))
const StudentsPage = lazy(() => import('./pages/StudentsPage.jsx'))

function App() {
  const [students, setStudents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [toast, setToast] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentDate] = useState(() => new Date())

  const retryStudents = useCallback(() => {
    setIsLoading(true)
    setLoadError(null)
    fetchStudents()
      .then(setStudents)
      .catch(setLoadError)
      .finally(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchStudents({ signal: controller.signal })
      .then((currentStudents) => {
        if (!controller.signal.aborted) setStudents(currentStudents)
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'CanceledError') {
          setLoadError(error)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  function notify(message, type = 'success') {
    setToast({ message, type, id: Date.now() })
  }

  async function addStudent(student) {
    const createdStudent = await createStudentRequest(student)
    setStudents((currentStudents) => [createdStudent, ...currentStudents])
    return createdStudent
  }

  async function updateStudent(id, updatedStudent) {
    const savedStudent = await updateStudentRecord(id, updatedStudent)
    setStudents((currentStudents) =>
      currentStudents.map((student) =>
        student.id === id ? savedStudent : student,
      ),
    )
    return savedStudent
  }

  async function deleteStudent(id) {
    await deleteStudentRecord(id)
    setStudents((currentStudents) =>
      currentStudents.filter((student) => student.id !== id),
    )
  }

  const outletContext = {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    notify,
    isLoading,
    loadError,
    refreshStudents: retryStudents,
    searchQuery,
    setSearchQuery,
    currentDate,
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout {...outletContext} />}>
          <Route index element={<Suspense fallback={<div className="page-loading">Preparing your workspace…</div>}><DashboardPage /></Suspense>} />
          <Route path="students" element={<Suspense fallback={<div className="page-loading">Loading students…</div>}><StudentsPage /></Suspense>} />
          <Route path="students/new" element={<Suspense fallback={<div className="page-loading">Preparing student form…</div>}><StudentFormPage /></Suspense>} />
          <Route path="students/:studentId" element={<Suspense fallback={<div className="page-loading">Loading student profile…</div>}><StudentDetailsPage /></Suspense>} />
          <Route path="students/:studentId/edit" element={<Suspense fallback={<div className="page-loading">Preparing student form…</div>}><StudentFormPage /></Suspense>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </BrowserRouter>
  )
}

export default App
