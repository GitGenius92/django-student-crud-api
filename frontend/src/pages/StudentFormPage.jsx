import { useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Info, UserRound } from 'lucide-react'
import { COURSES } from '../data/students.js'
import DataState from '../components/DataState.jsx'

const EMPTY_FORM = { name: '', email: '', age: '', course: '' }

function StudentFormPage() {
  const { studentId } = useParams()
  const navigate = useNavigate()
  const { students, addStudent, updateStudent, notify, setSearchQuery, isLoading, loadError, refreshStudents } = useOutletContext()
  const existingStudent = useMemo(
    () => students.find((student) => student.id === studentId),
    [students, studentId],
  )
  const [formValues, setFormValues] = useState(null)
  const values = formValues ?? (existingStudent
    ? { name: existingStudent.name, email: existingStudent.email, age: String(existingStudent.age), course: existingStudent.course }
    : EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const isEditing = Boolean(studentId)
  const courseSuggestions = useMemo(
    () => [...new Set([...COURSES, ...students.map((student) => student.course)])].sort(),
    [students],
  )

  if (isLoading || loadError) {
    return <DataState isLoading={isLoading} error={loadError} onRetry={() => refreshStudents()} title="students" />
  }

  if (isEditing && !existingStudent) {
    return (
      <div className="not-found-panel panel">
        <span className="empty-state-icon"><UserRound size={20} /></span>
        <h1>Student not found</h1>
        <p>This student may have been removed from the directory.</p>
        <Link to="/students" className="secondary-button"><ArrowLeft size={15} /> Back to students</Link>
      </div>
    )
  }

  function updateField(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...(current ?? values), [name]: value }))
    setErrors((current) => ({ ...current, [name]: '' }))
  }

  function validate() {
    const nextErrors = {}
    const name = values.name.trim()
    const email = values.email.trim()
    const age = Number(values.age)

    if (!name) nextErrors.name = 'Enter a student name.'
    else if (name.length > 100) nextErrors.name = 'Name must be 100 characters or fewer.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) nextErrors.email = 'Enter a valid email address.'
    else if (email.length > 254) nextErrors.email = 'Email must be 254 characters or fewer.'
    if (values.age === '' || !Number.isSafeInteger(age)) nextErrors.age = 'Age must be a whole number.'
    const course = values.course.trim()
    if (!course) nextErrors.course = 'Enter a course.'
    else if (course.length > 100) nextErrors.course = 'Course must be 100 characters or fewer.'
    const emailTaken = students.some((student) =>
      student.email.toLowerCase() === email.toLowerCase() && student.id !== studentId,
    )
    if (emailTaken && !nextErrors.email) nextErrors.email = 'This email is already in your student directory.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validate()) {
      notify('Please check the highlighted fields.', 'error')
      return
    }

    const student = {
      name: values.name.trim(),
      email: values.email.trim().toLowerCase(),
      age: Number(values.age),
      course: values.course.trim(),
    }
    setIsSaving(true)
    try {
      if (isEditing) {
        await updateStudent(studentId, student)
        notify(`${student.name}’s profile has been updated.`)
      } else {
        const createdStudent = await addStudent(student)
        notify(`${createdStudent.name} has been added to your students.`)
      }
      setSearchQuery('')
      navigate('/students')
    } catch (error) {
      setErrors((current) => ({ ...current, ...error.fields }))
      notify(error.message, 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="student-form-page">
      <div className="page-heading form-heading">
        <div>
          <Link to="/students" className="back-link"><ArrowLeft size={15} /> Student directory</Link>
          <p className="eyebrow"><span className="eyebrow-dot" /> STUDENT RECORD</p>
          <h1>{isEditing ? 'Edit student' : 'Add a student'}</h1>
          <p className="page-subtitle">{isEditing ? 'Update profile and enrollment details.' : 'Create a profile and welcome someone new to Northstar.'}</p>
        </div>
      </div>

      <form className="student-form-layout" onSubmit={handleSubmit} noValidate>
        <div className="form-main-column">
          <section className="panel form-panel">
            <div className="form-section-heading">
              <span className="form-section-icon"><UserRound size={17} /></span>
              <div><h2>Personal information</h2><p>Tell us a little about this student.</p></div>
            </div>
            <div className="form-fields">
              <label className="form-field form-field-wide">
                <span>Full name <b>*</b></span>
                <input autoComplete="name" maxLength={100} name="name" value={values.name} onChange={updateField} placeholder="e.g. Alex Morgan" aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-error' : undefined} />
                {errors.name && <small className="field-error" id="name-error">{errors.name}</small>}
              </label>
              <label className="form-field form-field-wide">
                <span>Email address <b>*</b></span>
                <input type="email" autoComplete="email" maxLength={254} name="email" value={values.email} onChange={updateField} placeholder="alex.morgan@northstar.edu" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-error' : undefined} />
                {errors.email && <small className="field-error" id="email-error">{errors.email}</small>}
                <small className="field-hint">We’ll use this email for student records and updates.</small>
              </label>
              <label className="form-field">
                <span>Age <b>*</b></span>
                <div className="input-suffix-wrap"><input type="number" step="1" name="age" value={values.age} onChange={updateField} placeholder="e.g. 20" aria-invalid={Boolean(errors.age)} aria-describedby={errors.age ? 'age-error' : undefined} /><span>years</span></div>
                {errors.age && <small className="field-error" id="age-error">{errors.age}</small>}
              </label>
              <label className="form-field">
                <span>Course <b>*</b></span>
                <div className="form-select-wrap course-input-wrap"><input list="course-suggestions" maxLength={100} name="course" value={values.course} onChange={updateField} placeholder="e.g. Computer Science" aria-invalid={Boolean(errors.course)} aria-describedby={errors.course ? 'course-error' : undefined} /><datalist id="course-suggestions">{courseSuggestions.map((course) => <option key={course} value={course} />)}</datalist><ChevronDown size={16} /></div>
                {errors.course && <small className="field-error" id="course-error">{errors.course}</small>}
              </label>
            </div>
          </section>

          <div className="form-actions">
            <Link to="/students" className="secondary-button">Cancel</Link>
            <button type="submit" className="primary-button" disabled={isSaving}><Check size={16} /> {isSaving ? 'Saving…' : isEditing ? 'Save changes' : 'Add student'}</button>
          </div>
        </div>

        <aside className="form-side-column">
          <div className="panel enrollment-card">
            <span className="enrollment-card-icon"><Info size={17} /></span>
            <h3>{isEditing ? 'Profile update' : 'A note on enrollment'}</h3>
            <p>{isEditing ? 'Changes are saved to the Django API and reflected across your dashboard.' : 'Your new student will be created in the Django student directory.'}</p>
            <div className="enrollment-tip"><span>✦</span> You can edit these details any time.</div>
          </div>
          <div className="form-help"><span>Need a hand?</span><p>Student details are sent to the configured Django API.</p><button className="text-link" type="button" onClick={() => notify('For help, contact your workspace administrator.')}>Contact support <ArrowRight size={13} /></button></div>
        </aside>
      </form>
    </div>
  )
}

export default StudentFormPage
