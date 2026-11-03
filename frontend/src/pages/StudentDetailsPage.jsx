import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Mail,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react'
import StudentAvatar from '../components/StudentAvatar.jsx'
import DataState from '../components/DataState.jsx'
import { fetchStudentRecord } from '../api/students.js'
import { formatDate } from '../utils/studentUtils.js'

function StudentDetailsPage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { deleteStudent, notify } = useOutletContext()
  const [isDeleting, setIsDeleting] = useState(false)
  const [reloadId, setReloadId] = useState(0)
  const [profileState, setProfileState] = useState({ key: '', student: null, error: null })
  const requestKey = `${studentId}:${reloadId}`

  useEffect(() => {
    const controller = new AbortController()
    fetchStudentRecord(studentId, { signal: controller.signal })
      .then((student) => {
        if (!controller.signal.aborted) setProfileState({ key: requestKey, student, error: null })
      })
      .catch((error) => {
        if (!controller.signal.aborted && error.name !== 'CanceledError') {
          setProfileState({ key: requestKey, student: null, error })
        }
      })
    return () => controller.abort()
  }, [studentId, requestKey])

  const retryProfile = useCallback(() => setReloadId((current) => current + 1), [])
  if (profileState.key !== requestKey) {
    return <DataState isLoading title="student profile" />
  }
  if (profileState.error) {
    return <DataState isLoading={false} error={profileState.error} onRetry={retryProfile} title="student profile" />
  }

  const student = profileState.student
  if (!student) {
    return (
      <div className="not-found-panel panel">
        <span className="empty-state-icon"><UserRound size={20} /></span>
        <h1>Student not found</h1>
        <p>This student may have been removed from the directory.</p>
        <Link to="/students" className="secondary-button"><ArrowLeft size={15} /> Back to students</Link>
      </div>
    )
  }

  async function handleDelete() {
    if (!window.confirm(`Delete ${student.name}? This action cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await deleteStudent(student.id)
      notify(`${student.name} was removed from your directory.`)
      navigate('/students')
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="student-details-page">
      <Link to="/students" className="back-link details-back"><ArrowLeft size={15} /> Student directory</Link>
      <section className="panel student-profile-card">
        <div className="profile-cover"><span className="profile-cover-mark">✳</span></div>
        <div className="profile-card-content">
          <div className="profile-avatar-wrap"><StudentAvatar name={student.name} size="large" /></div>
          <div className="profile-primary">
            <span className="status-badge status-registered"><span />{student.status}</span>
            <h1>{student.name}</h1>
            <span>{student.course}</span>
          </div>
          <div className="profile-actions">
            <button className="secondary-button danger-outline" disabled={isDeleting} onClick={handleDelete}><Trash2 size={15} /> {isDeleting ? 'Deleting…' : 'Delete'}</button>
            <Link to={`/students/${student.id}/edit`} className="primary-button"><Pencil size={15} /> Edit student</Link>
          </div>
        </div>
        <div className="profile-meta">
          <span><Mail size={15} /> {student.email}</span>
          <span><CalendarDays size={15} /> Joined {formatDate(student.registrationDate)}</span>
        </div>
      </section>

      <div className="detail-sections">
        <section className="panel detail-panel">
          <div className="panel-heading detail-panel-heading"><div><span className="panel-kicker">PROFILE</span><h2>Personal information</h2></div><span className="detail-heading-icon"><UserRound size={17} /></span></div>
          <div className="detail-grid">
            <div className="detail-field"><span>Full name</span><strong>{student.name}</strong></div>
            <div className="detail-field"><span>Age</span><strong>{student.age} years old</strong></div>
            <div className="detail-field detail-field-wide"><span>Email address</span><strong>{student.email}</strong></div>
          </div>
        </section>
        <section className="panel detail-panel">
          <div className="panel-heading detail-panel-heading"><div><span className="panel-kicker">ENROLLMENT</span><h2>Course information</h2></div><span className="detail-heading-icon"><Clock3 size={17} /></span></div>
          <div className="detail-grid">
            <div className="detail-field detail-field-wide"><span>Program</span><strong>{student.course}</strong></div>
            <div className="detail-field"><span>Directory record</span><strong><span className="status-badge status-registered"><span />{student.status}</span></strong></div>
            <div className="detail-field"><span>Registration date</span><strong>{formatDate(student.registrationDate)}</strong></div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default StudentDetailsPage
