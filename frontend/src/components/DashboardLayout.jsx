import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  BookOpen,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  Search,
  Settings,
  UsersRound,
  X,
} from 'lucide-react'

const navigation = [
  { label: 'Overview', path: '/', icon: LayoutDashboard, end: true },
  { label: 'Students', path: '/students', icon: UsersRound },
]

function DashboardLayout({
  students,
  addStudent,
  updateStudent,
  deleteStudent,
  notify,
  isLoading,
  loadError,
  refreshStudents,
  searchQuery,
  setSearchQuery,
  currentDate,
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const searchRef = useRef(null)
  const pageTitle = location.pathname.startsWith('/students')
    ? 'Students'
    : 'Overview'
  const outletContext = {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    notify,
    isLoading,
    loadError,
    refreshStudents,
    currentDate,
  }

  useEffect(() => {
    function handleSearchShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleSearchShortcut)
    return () => window.removeEventListener('keydown', handleSearchShortcut)
  }, [])

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="sidebar-backdrop"
          aria-label="Dismiss navigation overlay"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <NavLink to="/" className="brand" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><GraduationCap size={20} strokeWidth={2.2} /></span>
          <span>northstar<span className="brand-period">.</span></span>
        </NavLink>

        <button className="workspace-switcher" onClick={() => notify('Northstar Academy is your current workspace.')}>
          <span className="workspace-icon"><BookOpen size={16} /></span>
          <span className="workspace-copy"><strong>Northstar Academy</strong><small>Education workspace</small></span>
          <ChevronDown size={15} className="workspace-chevron" />
        </button>

        <p className="nav-section-label">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={label}
              to={path}
              end={end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {label === 'Students' && <span className="nav-count">{students.length}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <span className="note-spark">✳</span>
            <strong>Everything in one place</strong>
            <p>Your student community is growing. Keep track of every step.</p>
          </div>
          <button className="nav-link settings-link" onClick={() => notify('Settings are coming soon.')}>
            <Settings size={18} strokeWidth={1.8} /><span>Settings</span>
          </button>
          <div className="profile-block">
            <div className="avatar avatar-admin">JD</div>
            <div className="profile-copy"><strong>Jordan Davis</strong><small>Administrator</small></div>
            <button className="icon-button profile-menu" aria-label="Profile options" onClick={() => notify('Signed in as Jordan Davis.')}>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button mobile-menu-button" onClick={() => setMenuOpen(true)} aria-label="Open navigation">
              <Menu size={20} />
            </button>
            <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{pageTitle}</strong></div>
          </div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} aria-hidden="true" />
              <input
                ref={searchRef}
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search students"
              />
              {searchQuery && (
                <button className="search-clear" onClick={() => setSearchQuery('')} aria-label="Clear search">
                  <X size={14} />
                </button>
              )}
              <kbd>⌘ K</kbd>
            </label>
            <button
              className="icon-button refresh-button"
              onClick={refreshStudents}
              disabled={isLoading}
              aria-label="Refresh student data"
              title="Refresh student data"
            >
              <RefreshCw size={16} />
            </button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => notify('You’re all caught up — no new notifications.')}>
              <Bell size={18} />
              <span className="notification-dot" />
            </button>
            <div className="topbar-divider" />
            <button className="topbar-profile" onClick={() => notify('Signed in as Jordan Davis.')}>
              <span className="avatar avatar-admin">JD</span>
              <ChevronDown size={15} />
            </button>
          </div>
        </header>
        <section className="page-content">
          <Outlet context={{ ...outletContext, searchQuery, setSearchQuery }} />
        </section>
      </main>
      {menuOpen && (
        <button className="mobile-close-menu icon-button" onClick={() => setMenuOpen(false)} aria-label="Close navigation">
          <X size={18} />
        </button>
      )}
      <button className="quick-add-button" onClick={() => navigate('/students/new')} aria-label="Add student">
        <Plus size={20} />
      </button>
    </div>
  )
}

export default DashboardLayout
