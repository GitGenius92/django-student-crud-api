import { Link, useOutletContext } from 'react-router-dom'
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  GraduationCap,
  Plus,
  UsersRound,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { COURSE_COLORS } from '../data/students.js'
import DataState from '../components/DataState.jsx'
import StudentAvatar from '../components/StudentAvatar.jsx'
import StatCard from '../components/StatCard.jsx'
import { formatDate, formatShortDate, getCourseCounts, getRegistrationTrend } from '../utils/studentUtils.js'

function DashboardPage() {
  const { students, notify, currentDate, isLoading, loadError, refreshStudents } = useOutletContext()
  if (isLoading || loadError) {
    return <DataState isLoading={isLoading} error={loadError} onRetry={() => refreshStudents()} title="dashboard data" />
  }

  const courseCounts = getCourseCounts(students)
  const averageAge = students.length
    ? (students.reduce((total, student) => total + student.age, 0) / students.length).toFixed(1)
    : '—'
  const courseData = Object.entries(courseCounts)
    .map(([name, value]) => ({ name, value, color: COURSE_COLORS[name] ?? '#8293a8' }))
    .sort((first, second) => second.value - first.value)
  const registrationTrend = getRegistrationTrend(students, currentDate)
  const recentStudents = [...students]
    .sort((first, second) => second.registrationDate.localeCompare(first.registrationDate))
    .slice(0, 5)
  const recentRegistrationCount = students.filter((student) => {
    const registration = new Date(`${student.registrationDate}T00:00:00`)
    return (currentDate - registration) / 86400000 <= 30
  }).length
  const hour = currentDate.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const todayLabel = new Intl.DateTimeFormat('en', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(currentDate).toUpperCase()

  return (
    <div className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div>
        <p className="eyebrow"><span className="eyebrow-dot" /> {todayLabel}</p>
          <h1>{greeting}, Jordan <span className="wave">✳</span></h1>
          <p className="page-subtitle">Here’s what’s happening with your students today.</p>
        </div>
        <Link to="/students/new" className="primary-button"><Plus size={17} /> Add student</Link>
      </div>

      <div className="stats-grid">
        <StatCard label="Total students" value={students.length.toLocaleString()} note="from the student directory" change="All records" icon={UsersRound} tone="blue" />
        <StatCard label="Average age" value={averageAge} note="years among students" change={`${students.length} records`} icon={GraduationCap} tone="teal" />
        <StatCard label="Courses" value={Object.keys(courseCounts).length.toLocaleString()} note="represented in records" change={`${Object.keys(courseCounts).length} courses`} icon={BookOpen} tone="violet" />
        <StatCard label="New registrations" value={recentRegistrationCount.toLocaleString()} note="in the last 30 days" change="Based on join date" icon={CalendarDays} tone="amber" />
      </div>

      <div className="dashboard-main-grid">
        <section className="panel growth-panel">
          <div className="panel-heading">
            <div>
              <span className="panel-kicker">STUDENT OVERVIEW</span>
              <h2>Student growth</h2>
            </div>
            <button className="select-button" onClick={() => notify('The chart shows registrations over the last six months.')} aria-label="Showing the last six months">Last 6 months <span className="select-caret">⌄</span></button>
          </div>
          <div className="growth-summary">
            <strong>{students.length.toLocaleString()}</strong>
            <span>students on record</span>
          </div>
          <div className="chart-area">
            {students.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={registrationTrend} margin={{ top: 10, right: 7, left: -22, bottom: 0 }}>
                  <defs>
                    <linearGradient id="growthFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4a9ee2" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#4a9ee2" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#252d3a" strokeDasharray="3 5" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#7f8a9b', fontSize: 11 }} dy={12} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#7f8a9b', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#202734', border: '1px solid #303a4b', borderRadius: 10, color: '#edf2f8', fontSize: 12 }}
                    labelStyle={{ color: '#9aa7b8', marginBottom: 4 }}
                    formatter={(value) => [`${value} registrations`, 'Students']}
                  />
                  <Area type="monotone" dataKey="registrations" stroke="#57a9ed" strokeWidth={2.5} fill="url(#growthFill)" activeDot={{ r: 4, fill: '#67b9fb', stroke: '#17202d', strokeWidth: 3 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : <div className="chart-empty">Add your first student to start tracking growth.</div>}
          </div>
          <div className="chart-legend"><span className="legend-dot legend-blue" /> Registrations <span className="legend-caption">•  Monthly student sign-ups</span></div>
        </section>

        <section className="panel course-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">ACADEMIC PROGRAMS</span><h2>Course distribution</h2></div>
            <button className="icon-button panel-more" aria-label="Course distribution options" onClick={() => notify(`${courseData.length} courses represented in the current directory.`)}>•••</button>
          </div>
          <div className="course-chart-wrap">
            {courseData.length ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={courseData} dataKey="value" nameKey="name" innerRadius="68%" outerRadius="88%" paddingAngle={4} stroke="none">
                      {courseData.map((item) => <Cell key={item.name} fill={item.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#202734', border: '1px solid #303a4b', borderRadius: 10, color: '#edf2f8', fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center"><strong>{students.length}</strong><span>students</span></div>
              </>
            ) : <div className="chart-empty">Course insights will show here.</div>}
          </div>
          <div className="course-legend">
            {courseData.slice(0, 4).map((course) => (
              <div className="course-legend-item" key={course.name}>
                <span className="legend-dot" style={{ backgroundColor: course.color }} />
                <span className="course-legend-name">{course.name}</span>
                <strong>{course.value}</strong>
              </div>
            ))}
            {courseData.length > 4 && <Link to="/students" className="view-all-courses">View all courses <ArrowRight size={13} /></Link>}
            {!courseData.length && <span className="muted-copy">No course data yet</span>}
          </div>
        </section>
      </div>

      <div className="dashboard-bottom-grid">
        <section className="panel registrations-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">LATEST ENROLLMENTS</span><h2>Recent registrations</h2></div>
            <Link to="/students" className="text-link">View all <ArrowRight size={14} /></Link>
          </div>
          {recentStudents.length ? (
            <div className="recent-list">
              {recentStudents.map((student) => (
                <Link to={`/students/${student.id}`} className="recent-row" key={student.id}>
                  <StudentAvatar name={student.name} />
                  <div className="recent-student-copy"><strong>{student.name}</strong><span>{student.course}</span></div>
                  <time>{formatShortDate(student.registrationDate)}</time>
                </Link>
              ))}
            </div>
          ) : <div className="empty-state compact-empty"><span className="empty-state-icon"><UsersRound size={20} /></span><strong>No students yet</strong><span>Add a student to see recent registrations.</span><Link to="/students/new" className="text-link">Add a student <ArrowRight size={14} /></Link></div>}
        </section>

        <section className="panel activity-panel">
          <div className="panel-heading">
            <div><span className="panel-kicker">YOUR ACADEMY</span><h2>Recent activity</h2></div>
            <button className="icon-button panel-more" aria-label="Activity options" onClick={() => notify('Activity is sorted by the most recent registration.')}>•••</button>
          </div>
          <div className="activity-feed">
            {recentStudents.slice(0, 4).map((student, index) => (
              <div className="activity-item" key={student.id}>
                <div className={`activity-marker activity-marker-${index % 4}`}><GraduationCap size={14} /></div>
                <div className="activity-copy"><p><strong>{student.name}</strong> registered for <span>{student.course}</span></p><time>{formatDate(student.registrationDate)}</time></div>
              </div>
            ))}
            {!recentStudents.length && <div className="empty-state compact-empty"><span className="empty-state-icon"><CalendarDays size={20} /></span><strong>No recent activity</strong><span>Your latest student updates will appear here.</span></div>}
          </div>
          <Link to="/students" className="activity-footer">See student directory <ArrowRight size={14} /></Link>
        </section>
      </div>
      <div className="dashboard-footnote">Student records are provided by your Django API <span>·</span> Last updated just now</div>
    </div>
  )
}

export default DashboardPage
