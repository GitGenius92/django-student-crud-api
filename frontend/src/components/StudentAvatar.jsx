import { getInitials } from '../utils/studentUtils.js'

function StudentAvatar({ name, size = 'regular' }) {
  const palettes = ['avatar-blue', 'avatar-violet', 'avatar-teal', 'avatar-rose', 'avatar-amber']
  const index = [...(name ?? '')].reduce((sum, character) => sum + character.charCodeAt(0), 0) % palettes.length

  return <span className={`avatar student-avatar ${palettes[index]} avatar-${size}`}>{getInitials(name)}</span>
}

export default StudentAvatar
