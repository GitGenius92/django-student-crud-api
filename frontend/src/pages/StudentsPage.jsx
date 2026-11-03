import { useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowDown,
  ArrowDownAZ,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  UsersRound,
} from 'lucide-react'
import DataState from '../components/DataState.jsx'
import { COURSE_COLORS } from '../data/students.js'
import StudentAvatar from '../components/StudentAvatar.jsx'
import { formatDate } from '../utils/studentUtils.js'

const PAGE_SIZE = 8

function StudentsPage() {
  const { students, deleteStudent, notify, searchQuery, setSearchQuery, isLoading, loadError, refreshStudents } = useOutletContext()
  const [courseFilter, setCourseFilter] = useState('All courses')
  const [sortBy, setSortBy] = useState('registrationDate')
  const [sortDirection, setSortDirection] = useState('desc')
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState(null)
  const courses = useMemo(
    () => [...new Set([...students.map((student) => student.course)])].sort(),
    [students],
  )

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return students
      .filter((student) => {
        const matchesQuery = !query || [student.name, student.email, student.course].some((value) => value.toLowerCase().includes(query))
        const matchesCourse = courseFilter === 'All courses' || student.course === courseFilter
        return matchesQuery && matchesCourse
      })
      .sort((first, second) => {
        const comparison = String(first[sortBy]).localeCompare(String(second[sortBy]), undefined, { numeric: true })
        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [students, searchQuery, courseFilter, sortBy, sortDirection])

  const pageCount = Math.max(1, Math.ceil(filteredStudents.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const pageStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const start = filteredStudents.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0
  const end = Math.min(currentPage * PAGE_SIZE, filteredStudents.length)

  function changeSort(column) {
    if (sortBy === column) setSortDirection((direction) => direction === 'asc' ? 'desc' : 'asc')
    else {
      setSortBy(column)
      setSortDirection(column === 'registrationDate' ? 'desc' : 'asc')
    }
  }

  async function handleDelete(student) {
    if (!window.confirm(`Delete ${student.name}? This action cannot be undone.`)) return
    setDeletingId(student.id)
    try {
      await deleteStudent(student.id)
      notify(`${student.name} was removed from your directory.`)
    } catch (error) {
      notify(error.message, 'error')
    } finally {
      setDeletingId(null)
    }
  }

  function exportCsv() {
    const header = ['ID', 'Name', 'Email', 'Age', 'Course', 'Registration date']
    const rows = filteredStudents.map((student) => [student.id, student.name, student.email, student.age, student.course, student.registrationDate])
    const csv = [header, ...rows].map((row) => row.map((field) => `"${String(field).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'northstar-students.csv'
    anchor.click()
    URL.revokeObjectURL(url)
    notify('Student directory exported.')
  }

  if (isLoading || loadError) {
    return <DataState isLoading={isLoading} error={loadError} onRetry={() => refreshStudents()} title="students" />
  }

  return (
    <div className="students-page">
      <div className="page-heading students-heading">
        <div>
          <p className="eyebrow"><span className="eyebrow-dot" /> PEOPLE &amp; ENROLLMENT</p>
          <h1>Student directory</h1>
          <p className="page-subtitle">A closer look at your students and their enrollment details.</p>
        </div>
        <div className="heading-actions">
          <button className="secondary-button" onClick={exportCsv}><Download size={16} /> Export</button>
          <Link to="/students/new" className="primary-button"><Plus size={17} /> Add student</Link>
        </div>
      </div>

      <div className="directory-summary">
        <div className="directory-summary-icon"><UsersRound size={18} /></div>
        <div><strong>{students.length} students</strong><span> across {new Set(students.map((student) => student.course)).size} courses in the directory</span></div>
        <span className="summary-divider" />
        <span className="summary-status"><span className="status-dot" /> Live from Django</span>
      </div>

      <section className="panel directory-panel">
        <div className="directory-toolbar">
          <div className="directory-toolbar-title"><div><h2>All students</h2><span>{filteredStudents.length} records</span></div></div>
          <div className="directory-filters">
            <label className="table-search">
              <Search size={16} />
              <input value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(1) }} placeholder="Search students" aria-label="Search students" />
            </label>
            <label className="filter-select">
              <SlidersHorizontal size={15} />
              <select value={courseFilter} onChange={(event) => { setCourseFilter(event.target.value); setPage(1) }} aria-label="Filter by course">
                <option>All courses</option>
                {courses.map((course) => <option key={course}>{course}</option>)}
              </select>
              <ChevronDown size={14} />
            </label>
          </div>
        </div>

        <div className="table-wrap">
          <table className="student-table">
            <thead>
              <tr>
                <th><button onClick={() => changeSort('name')}>STUDENT <ArrowDownAZ size={13} /></button></th>
                <th><button onClick={() => changeSort('age')}>AGE <ArrowDownAZ size={13} /></button></th>
                <th><button onClick={() => changeSort('course')}>COURSE <ArrowDownAZ size={13} /></button></th>
                <th><button onClick={() => changeSort('registrationDate')}>REGISTERED <ArrowDown size={13} className={sortDirection === 'asc' && sortBy === 'registrationDate' ? 'sort-arrow-up' : ''} /></button></th>
                <th>RECORD</th>
                <th><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {pageStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <Link to={`/students/${student.id}`} className="student-cell">
                      <StudentAvatar name={student.name} />
                      <span className="student-cell-copy"><strong>{student.name}</strong><small>{student.email}</small></span>
                    </Link>
                  </td>
                  <td className="table-age">{student.age} <span>yrs</span></td>
                  <td><span className="course-cell"><span className="course-dot" style={{ backgroundColor: COURSE_COLORS[student.course] ?? '#63a9df' }} />{student.course}</span></td>
                  <td className="table-date">{formatDate(student.registrationDate)}</td>
                  <td><span className="status-badge status-registered"><span />{student.status}</span></td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/students/${student.id}`} className="icon-button row-action" aria-label={`View ${student.name}`}><Eye size={16} /></Link>
                      <Link to={`/students/${student.id}/edit`} className="icon-button row-action" aria-label={`Edit ${student.name}`}><Pencil size={15} /></Link>
                      <button className="icon-button row-action row-delete" aria-label={`Delete ${student.name}`} disabled={deletingId === student.id} onClick={() => handleDelete(student)}><Trash2 size={15} /></button>
                      <button className="icon-button row-action row-more" aria-label={`More actions for ${student.name}`} onClick={() => notify(`Choose View, Edit or Delete to manage ${student.name}.`)}><MoreHorizontal size={17} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {!pageStudents.length && (
                <tr><td colSpan="6"><div className="empty-state table-empty"><span className="empty-state-icon"><Search size={20} /></span><strong>{students.length ? 'No students match those filters' : 'Your directory is ready'}</strong><span>{students.length ? 'Try another search or clear your filters.' : 'Add your first student to get started.'}</span>{students.length ? <button className="text-link" onClick={() => { setSearchQuery(''); setCourseFilter('All courses') }}>Clear filters <ChevronDown size={13} /></button> : <Link to="/students/new" className="primary-button"><Plus size={16} /> Add student</Link>}</div></td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <span>Showing <strong>{start}–{end}</strong> of <strong>{filteredStudents.length}</strong> students</span>
          <div className="pagination-controls">
            <button className="pagination-button" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous page"><ChevronLeft size={16} /></button>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map((pageNumber) => <button key={pageNumber} className={`pagination-button ${pageNumber === currentPage ? 'pagination-current' : ''}`} onClick={() => setPage(pageNumber)}>{pageNumber}</button>)}
            <button className="pagination-button" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>
      </section>
      <div className="directory-footer-note">Student records are served by the Django API.</div>
    </div>
  )
}

export default StudentsPage
