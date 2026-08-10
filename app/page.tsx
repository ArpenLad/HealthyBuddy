'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Dumbbell,
  Droplets,
  Flame,
  HeartPulse,
  Home,
  Leaf,
  Menu,
  Minus,
  Moon,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Settings,
  Sparkles,
  Sun,
  Timer,
  Trophy,
  X,
} from 'lucide-react'


type Habit = {
  id: string
  name: string
  icon: string
  color: string
  goal: number
  unit: string
  schedule: string
  enabled: boolean
}
type Logs = Record<string, number>
type DailyLogs = Record<string, Logs>

const defaultLogs: Logs = { water: 0, exercise: 0, walking: 0 }

const initialHabits: Habit[] = [
  { id: 'water', name: 'Drinking water', icon: 'droplets', color: 'aqua', goal: 8, unit: 'glasses', schedule: 'Daily', enabled: true },
  { id: 'exercise', name: 'Exercise', icon: 'dumbbell', color: 'coral', goal: 1, unit: 'set', schedule: 'Daily', enabled: true },
  { id: 'walking', name: 'Walking', icon: 'steps', color: 'mint', goal: 1, unit: 'km', schedule: 'Daily', enabled: true },
]

const iconMap: Record<string, any> = { droplets: Droplets, steps: Activity, book: BookOpen, moon: Moon, leaf: Leaf, dumbbell: Dumbbell }

function getToday() { return new Date().toISOString().slice(0, 10) }
function isDayComplete(date: string, habits: Habit[], dailyLogs: DailyLogs) {
  const logs = dailyLogs[date] || {}
  const enabled = habits.filter((habit) => habit.enabled)
  return enabled.length > 0 && enabled.every((habit) => (logs[habit.id] || 0) >= habit.goal)
}
function calculateCurrentStreak(habits: Habit[], dailyLogs: DailyLogs) {
  let streak = 0
  const date = new Date()
  while (isDayComplete(date.toISOString().slice(0, 10), habits, dailyLogs)) {
    streak += 1
    date.setDate(date.getDate() - 1)
  }
  return streak
}
function formatDate() { return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()) }

export default function Page() {
  const today = getToday()
  const [view, setView] = useState('Dashboard')
  const [habits, setHabits] = useState<Habit[]>(initialHabits)
  const [dailyLogs, setDailyLogs] = useState<DailyLogs>({ [today]: defaultLogs })
  const logs = dailyLogs[today] || {}
  const [streak, setStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [toast, setToast] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [newHabit, setNewHabit] = useState('')

  useEffect(() => {
    try {
      const resetKey = 'healthybuddy-production-reset-v5'
      if (process.env.NODE_ENV === 'production' && localStorage.getItem(resetKey) !== 'done') {
        localStorage.removeItem('healthybuddy')
        localStorage.setItem(resetKey, 'done')
        return
      }
      const saved = JSON.parse(localStorage.getItem('healthybuddy') || '{}')
      if (saved.habits) setHabits(saved.habits)
      if (saved.dailyLogs) setDailyLogs(saved.dailyLogs)
      else if (saved.logs) setDailyLogs({ [today]: saved.logs })
      if (saved.streak) setStreak(saved.streak)
      if (saved.bestStreak) setBestStreak(saved.bestStreak)
    } catch {}
  }, [])
  useEffect(() => {
    localStorage.setItem('healthybuddy', JSON.stringify({ habits, dailyLogs, streak, bestStreak }))
  }, [habits, dailyLogs, streak, bestStreak])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 2800)
    return () => clearTimeout(timer)
  }, [toast])

  const enabledHabits = habits.filter((habit) => habit.enabled)
  const completed = enabledHabits.filter((habit) => (logs[habit.id] || 0) >= habit.goal).length
  const calculatedStreak = calculateCurrentStreak(habits, dailyLogs)
  useEffect(() => {
    setStreak(calculatedStreak)
    setBestStreak((value) => Math.max(value, calculatedStreak))
  }, [calculatedStreak])
  const overall = enabledHabits.length ? Math.round((completed / enabledHabits.length) * 100) : 0
  const addAmount = (habit: Habit, amount: number) => {
    setDailyLogs((prev) => ({ ...prev, [today]: { ...(prev[today] || {}), [habit.id]: Math.max(0, (prev[today]?.[habit.id] || 0) + amount) } }))
    if ((logs[habit.id] || 0) + amount >= habit.goal) {
      setToast(`${habit.name} complete. Nice work.`)
    }
  }
  const toggleHabit = (id: string) => setHabits((items) => items.map((habit) => habit.id === id ? { ...habit, enabled: !habit.enabled } : habit))
  const deleteHabit = (id: string) => { setHabits((items) => items.filter((habit) => habit.id !== id)); setDailyLogs((items) => Object.fromEntries(Object.entries(items).map(([date, dayLogs]) => { const next = { ...dayLogs }; delete next[id]; return [date, next] }))); setToast('Habit deleted.') }
  const createHabit = () => {
    if (!newHabit.trim()) return
    const habit = { id: `custom-${Date.now()}`, name: newHabit.trim(), icon: 'leaf', color: 'mint', goal: 1, unit: 'time', schedule: 'Daily', enabled: true }
    setHabits((items) => [...items, habit]); setDailyLogs((items) => ({ ...items, [today]: { ...(items[today] || {}), [habit.id]: 0 } })); setNewHabit(''); setToast('New habit added.')
  }
  const requestNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      setToast(permission === 'granted' ? 'Reminders are turned on.' : 'You can enable reminders in browser settings.')
    } else setToast('Your browser does not support notifications yet.')
  }

  return (
    <main className="hb-shell">
      <Sidebar view={view} setView={(next: string) => { setView(next); setMobileOpen(false) }} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <section className="hb-content">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="crumb"><span>Workspace</span><ChevronRight /><strong>{view}</strong></div>
          <div className="top-actions"><button className="icon-button" onClick={() => setToast('No new updates today.')} aria-label="Notifications"><Bell /><i /></button><div className="avatar">B</div></div>
        </header>
        <div className="page-wrap">
          <div className="cover"><div className="cover-pattern" /><div className="cover-copy"><span className="eyebrow">PERSONAL WELLNESS / 2026</span><h1>Make space for<br /><em>feeling good.</em></h1><p>Small steps, steady days, a healthier you.</p></div><div className="sun-mark"><Sun /></div></div>
          {view === 'Dashboard' && <TodayView habits={enabledHabits} logs={logs} overall={overall} streak={streak} bestStreak={bestStreak} addAmount={addAmount} requestNotifications={requestNotifications} setToast={setToast} setView={setView} />}
          {view === 'Manage habits' && <ManageView habits={habits} toggleHabit={toggleHabit} setHabits={setHabits} deleteHabit={deleteHabit} setToast={setToast} />}
          {view === 'Analytics' && <AnalyticsView habits={habits} dailyLogs={dailyLogs} streak={streak} bestStreak={bestStreak} />}
        </div>
      </section>
      {toast && <div className="toast"><Check />{toast}<button onClick={() => setToast('')} aria-label="Dismiss"><X /></button></div>}
    </main>
  )
}

function Sidebar({ view, setView, mobileOpen, setMobileOpen }: any) {
  const items = [{ name: 'Dashboard', icon: Home }, { name: 'Manage habits', icon: Settings }, { name: 'Analytics', icon: BarChart3 }]
  return <><aside className={`sidebar ${mobileOpen ? 'open' : ''}`}><div className="brand"><span className="brand-icon"><img src="/hb-logo.png" alt="HB" /></span><span>HealthBuddy</span><button className="icon-button close-menu" onClick={() => setMobileOpen(false)}><X /></button></div><div className="workspace-label">MY WORKSPACE</div><nav>{items.map(({ name, icon: Icon }) => <button key={name} className={view === name ? 'active' : ''} onClick={() => setView(name)}><Icon />{name}<ChevronRight /></button>)}</nav><div className="sidebar-bottom"><div className="quote"><Sparkles /><p>Consistency beats intensity.</p><span>— your future self</span></div><button className="help"><CircleHelp /> Help & feedback</button><div className="user"><div className="avatar">B</div><div><strong>Buddy</strong><small>Personal account</small></div><MoreHorizontal /></div></div></aside>{mobileOpen && <button className="scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu" />}</>
}

function TodayView({ habits, logs, overall, streak, bestStreak, addAmount, requestNotifications, setToast, setView }: any) {
  return <div className="dashboard"><div className="welcome-row"><div><p className="eyebrow coral-text">{formatDate().toUpperCase()}</p><h2>Good morning, Buddy</h2><p className="subtle">A little progress is still progress. Let&apos;s make today count.</p></div><button className="reminder-button" onClick={requestNotifications}><Bell /> Turn on reminders</button></div><div className="overview-grid"><div className="progress-card"><div><span className="card-label">TODAY&apos;S PROGRESS</span><strong>{overall}%</strong><p>{overall === 100 ? 'All habits complete.' : `${habits.length - habits.filter((h: Habit) => (logs[h.id] || 0) >= h.goal).length} habits left to go`}</p></div><ProgressRing value={overall} /></div><div className="streak-card"><div className="streak-icon"><Flame /></div><div><span className="card-label">CURRENT STREAK</span><strong>{streak} days</strong><p>Keep the momentum going.</p></div><div className="streak-dots">{[1, 2, 3, 4, 5, 6, 7].map((n) => <i key={n} className={n <= 5 ? 'filled' : ''} />)}</div></div></div><div className="section-heading"><div><h3>Today&apos;s habits</h3><p>{habits.length} routines in your daily rhythm</p></div><button className="text-button" onClick={() => setView('Manage habits')}>Manage habits <ChevronRight /></button></div><div className="habits-grid">{habits.map((habit: Habit) => <HabitCard key={habit.id} habit={habit} value={logs[habit.id] || 0} addAmount={addAmount} />)}</div></div>
}

function HabitCard({ habit, value, addAmount }: any) {
  const Icon = iconMap[habit.icon] || Leaf; const percentage = Math.round((value / habit.goal) * 100); const complete = value >= habit.goal
  const increment = habit.goal >= 1000 ? 500 : habit.unit === 'minutes' ? 5 : 1
  return <article className={`habit-card ${habit.color} ${complete ? 'complete' : ''}`}><div className="habit-top"><span className="habit-icon"><Icon /></span></div><div className="habit-copy"><h4>{habit.name}</h4><p>{complete ? 'Complete for today' : habit.schedule}</p></div><div className="habit-progress"><div className="bar"><span style={{ width: `${Math.min(100, percentage)}%` }} /></div><strong>{value.toLocaleString()} <small>/ {habit.goal.toLocaleString()} {habit.unit}</small></strong></div><div className="habit-controls"><button onClick={() => addAmount(habit, -increment)} disabled={value <= 0} aria-label={`Decrease ${habit.name}`}><Minus /></button><button onClick={() => addAmount(habit, increment)} aria-label={`Increase ${habit.name}`}><Plus /></button>{complete && <span className="done"><Check /> Goal reached</span>}</div></article>
}

function ProgressRing({ value }: { value: number }) { const radius = 43; const circumference = 2 * Math.PI * radius; return <div className="progress-ring"><svg viewBox="0 0 110 110"><circle className="ring-track" cx="55" cy="55" r={radius} /><circle className="ring-value" cx="55" cy="55" r={radius} strokeDasharray={circumference} strokeDashoffset={circumference - circumference * value / 100} /></svg><span>{value}%</span></div> }

function ManageView({ habits, toggleHabit, setHabits, deleteHabit, setToast }: any) {
  const blank = { name: '', goal: '1', unit: 'times', frequency: 'Daily', days: [] as string[] }
  const [draft, setDraft] = useState(blank)
  const [editingId, setEditingId] = useState<string | null>(null)
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const beginEdit = (habit: Habit) => { const parts = habit.schedule.split(' · '); setEditingId(habit.id); setDraft({ name: habit.name, goal: String(habit.goal), unit: habit.unit, frequency: parts[0] || 'Daily', days: parts[1] ? parts[1].split(', ') : [] }) }
  const reset = () => { setDraft(blank); setEditingId(null) }
  const save = () => {
    if (!draft.name.trim() || Number(draft.goal) <= 0) return setToast('Add a name and a goal greater than zero.')
    const schedule = draft.frequency === 'Weekly' && draft.days.length ? `Weekly · ${draft.days.join(', ')}` : draft.frequency
    if (editingId) setHabits((items: Habit[]) => items.map((item) => item.id === editingId ? { ...item, name: draft.name.trim(), goal: Number(draft.goal), unit: draft.unit.trim() || 'times', schedule } : item))
    else { const habit = { id: `custom-${Date.now()}`, name: draft.name.trim(), icon: 'leaf', color: 'mint', goal: Number(draft.goal), unit: draft.unit.trim() || 'times', schedule, enabled: true }; setHabits((items: Habit[]) => [...items, habit]) }
    setToast(editingId ? 'Habit updated.' : 'New habit added.'); reset()
  }
  return <div className="manage-view"><div className="section-heading"><div><p className="eyebrow coral-text">YOUR ROUTINES</p><h2>Manage habits</h2><p className="subtle">Shape your day around the things that help you feel your best.</p></div></div><div className="manage-list">{habits.map((habit: Habit) => <div className={`manage-item ${!habit.enabled ? 'disabled' : ''}`} key={habit.id}><span className={`habit-icon ${habit.color}`}>{(() => { const HabitIcon = iconMap[habit.icon] || Leaf; return <HabitIcon /> })()}</span><div className="manage-copy"><h4>{habit.name}</h4><p>Goal: {habit.goal.toLocaleString()} {habit.unit} · {habit.schedule}</p></div><button className="edit-button" onClick={() => beginEdit(habit)}><Pencil /> Edit</button><button className="delete-button" onClick={() => window.confirm(`Delete ${habit.name}?`) && deleteHabit(habit.id)} aria-label={`Delete ${habit.name}`}><X /></button><button className={`toggle ${habit.enabled ? 'on' : ''}`} onClick={() => toggleHabit(habit.id)} aria-label={`Toggle ${habit.name}`}><span /></button></div>)}</div><div className="add-habit"><div><strong>{editingId ? 'Edit habit' : 'Add a new habit'}</strong><p>Set a goal and choose when it should repeat.</p></div><div className="habit-form"><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Habit name" /><input type="number" min="1" value={draft.goal} onChange={(e) => setDraft({ ...draft, goal: e.target.value })} placeholder="Goal" /><input value={draft.unit} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} placeholder="Unit (minutes, glasses...)" /><select value={draft.frequency} onChange={(e) => setDraft({ ...draft, frequency: e.target.value })}><option>Daily</option><option>Weekly</option><option>Monthly</option></select>{draft.frequency === 'Weekly' && <div className="day-picker">{days.map((day) => <button type="button" key={day} className={draft.days.includes(day) ? 'selected' : ''} onClick={() => setDraft({ ...draft, days: draft.days.includes(day) ? draft.days.filter((item) => item !== day) : [...draft.days, day] })}>{day}</button>)}</div>}<div className="form-actions"><button className="primary-action" onClick={save}>{editingId ? 'Save changes' : 'Add habit'}</button>{editingId && <button className="cancel-action" onClick={reset}>Cancel</button>}</div></div></div></div>
}

function AnalyticsView({ habits, dailyLogs, streak, bestStreak }: any) {
  const [range, setRange] = useState(7)
  const dates = useMemo(() => Array.from({ length: range }, (_, index) => { const date = new Date(); date.setDate(date.getDate() - (range - 1 - index)); return date.toISOString().slice(0, 10) }), [range])
  const rangeLogs = dates.map((date) => dailyLogs[date] || {})
  const completedTotal = rangeLogs.reduce((total: number, logs: Logs) => total + habits.filter((habit: Habit) => (logs[habit.id] || 0) >= habit.goal).length, 0)
  const completedToday = range === 1 ? completedTotal : completedTotal
  const consistency = habits.length && range ? Math.round((completedTotal / (habits.length * range)) * 100) : 0
  const days = useMemo(() => rangeLogs.map((logs: Logs) => habits.length ? Math.round((habits.filter((habit: Habit) => (logs[habit.id] || 0) >= habit.goal).length / habits.length) * 100) : 0), [habits, rangeLogs])
  const chartPoints = useMemo(() => days.map((value, index) => { const x = days.length === 1 ? 350 : (index / (days.length - 1)) * 700; const y = 220 - (value / 100) * 190; return `${x.toFixed(1)} ${y.toFixed(1)}` }).join(' L '), [days])
  const chartLine = `M${chartPoints || '0 220'}`
  const chartFill = `${chartLine} L700 220 L0 220Z`
  return <div className="analytics-view"><div className="section-heading"><div><p className="eyebrow coral-text">LOOKING BACK</p><h2>Your progress</h2><p className="subtle">Patterns that show how small choices add up.</p></div><div className="date-filter" role="group" aria-label="Progress range">{[1, 7, 30].map((days) => <button key={days} className={`range-option ${range === days ? 'active' : ''}`} onClick={() => setRange(days)}><strong>{days}</strong><span>day{days === 1 ? '' : 's'}</span></button>)}</div></div><div className="metric-grid"><div className="metric"><span className="metric-icon coral"><Flame /></span><div><small>BEST STREAK</small><strong>{bestStreak} days</strong><p>Personal best</p></div></div><div className="metric"><span className="metric-icon mint"><Check /></span><div><small>HABITS COMPLETED</small><strong>{completedToday}</strong><p>Completed in {range} day{range === 1 ? '' : 's'}</p></div></div><div className="metric"><span className="metric-icon lavender"><Trophy /></span><div><small>CONSISTENCY</small><strong>{consistency}%</strong><p>Current consistency</p></div></div></div><div className="chart-card"><div className="chart-heading"><div><h3>{range}-day consistency</h3><p>How often you completed your habits</p></div><span className="chart-legend"><i /> Completed</span></div><div className="chart"><div className="y-axis"><span>100%</span><span>75%</span><span>50%</span><span>25%</span><span>0%</span></div><div className="chart-area"><div className="grid-lines">{[1, 2, 3, 4].map((n) => <i key={n} />)}</div><svg viewBox="0 0 700 220" preserveAspectRatio="none"><path d={chartLine} fill="none" stroke="currentColor" strokeWidth="4" /><path d={chartFill} fill="currentColor" opacity=".1" /></svg><div className="x-axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div></div><div className="badges" hidden><div><h3>Milestones</h3><p>Little wins worth celebrating.</p></div><div className="badge-row"><div className="badge"><span><Flame /></span><strong>First flame</strong><small>7 day streak</small></div><div className="badge locked"><span><Trophy /></span><strong>On a roll</strong><small>14 day streak</small></div><div className="badge"><span><HeartPulse /></span><strong>Full circle</strong><small>30 habits done</small></div></div></div></div>
}
