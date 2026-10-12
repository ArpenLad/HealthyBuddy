import { Component, useEffect, useMemo, useState } from 'react'
import { Image, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'
import { Feather } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
})

class MobileErrorBoundary extends Component<React.PropsWithChildren, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error) { console.error('[HealthyBuddy] Mobile app error:', error) }
  render() {
    if (this.state.hasError) return <SafeAreaView style={styles.safe}><View style={styles.errorScreen}><Text style={styles.errorTitle}>Something went wrong</Text><Text style={styles.muted}>Your progress is safe. Please restart this screen.</Text></View></SafeAreaView>
    return this.props.children
  }
}

type Habit = { id: string; name: string; icon: keyof typeof Feather.glyphMap; color: string; goal: number; unit: string; value: number; enabled: boolean }

const initialHabits: Habit[] = [
  { id: 'water', name: 'Drinking water', icon: 'droplet', color: '#D9F2F0', goal: 8, unit: 'glasses', value: 0, enabled: true },
  { id: 'exercise', name: 'Exercise', icon: 'activity', color: '#FCE1D8', goal: 1, unit: 'set', value: 0, enabled: true },
  { id: 'walking', name: 'Walking', icon: 'map-pin', color: '#DDEFE3', goal: 1, unit: 'km', value: 0, enabled: true },
]

const tabs = [
  { label: 'Today', icon: 'home' },
  { label: 'Habits', icon: 'settings' },
  { label: 'Insights', icon: 'bar-chart-2' },
] as const

function AppContent() {
  const [tab, setTab] = useState<(typeof tabs)[number]['label']>('Today')
  useEffect(() => {
    Notifications.requestPermissionsAsync()
    Notifications.setNotificationChannelAsync('habits', { name: 'Habit reminders', importance: Notifications.AndroidImportance.DEFAULT })
  }, [])
  const [habits, setHabits] = useState(initialHabits)
  const enabled = habits.filter((habit) => habit.enabled)
  const completed = enabled.filter((habit) => habit.value >= habit.goal).length
  const progress = enabled.length ? Math.round((completed / enabled.length) * 100) : 0

  const updateHabit = (id: string, amount: number) => setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, value: Math.max(0, habit.value + amount) } : habit))
  const toggleHabit = (id: string) => setHabits((current) => current.map((habit) => habit.id === id ? { ...habit, enabled: !habit.enabled } : habit))

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}><Image source={require('./assets/hb-logo.png')} style={styles.logo} /><Text style={styles.brand}>HealthyBuddy</Text></View>
          <Pressable style={styles.bell} accessibilityLabel="Notifications" onPress={() => Notifications.scheduleNotificationAsync({ content: { title: 'HealthyBuddy reminder', body: 'Take a small step toward feeling good today.' }, trigger: null })}><Feather name="bell" size={20} color="#24313B" /><View style={styles.dot} /></Pressable>
        </View>
        <View style={styles.hero}><Text style={styles.eyebrow}>PERSONAL WELLNESS / 2026</Text><Text style={styles.heroTitle}>Make space for{`\n`}<Text style={styles.heroAccent}>feeling good.</Text></Text><Text style={styles.heroBody}>Small steps, steady days, a healthier you.</Text></View>
        {tab === 'Today' && <Today habits={enabled} progress={progress} updateHabit={updateHabit} setTab={setTab} />}
        {tab === 'Habits' && <Habits habits={habits} toggleHabit={toggleHabit} />}
        {tab === 'Insights' && <Insights habits={habits} progress={progress} />}
      </ScrollView>
      <View style={styles.nav}>{tabs.map((item) => <Pressable key={item.label} onPress={() => setTab(item.label)} style={styles.navItem}><Feather name={item.icon} size={21} color={tab === item.label ? '#E86F51' : '#8A969D'} /><Text style={[styles.navLabel, tab === item.label && styles.navActive]}>{item.label}</Text></Pressable>)}</View>
    </SafeAreaView>
  )
}

export default function App() { return <MobileErrorBoundary><AppContent /></MobileErrorBoundary> }

function Today({ habits, progress, updateHabit, setTab }: { habits: Habit[]; progress: number; updateHabit: (id: string, amount: number) => void; setTab: (tab: 'Habits') => void }) {
  return <View><View style={styles.greeting}><Text style={styles.date}>MONDAY, OCTOBER 12</Text><Text style={styles.title}>Good morning, Buddy</Text><Text style={styles.muted}>A little progress is still progress. Let&apos;s make today count.</Text></View><View style={styles.overview}><View style={styles.progressCard}><Text style={styles.cardLabel}>TODAY&apos;S PROGRESS</Text><Text style={styles.bigNumber}>{progress}%</Text><Text style={styles.muted}>{progress === 100 ? 'All habits complete.' : `${habits.length - habits.filter((h) => h.value >= h.goal).length} habits left to go`}</Text></View><View style={styles.streakCard}><Feather name="zap" size={22} color="#E86F51" /><Text style={styles.cardLabel}>CURRENT STREAK</Text><Text style={styles.streakNumber}>0 days</Text><Text style={styles.muted}>Keep the momentum going.</Text></View></View><View style={styles.sectionRow}><View><Text style={styles.sectionTitle}>Today&apos;s habits</Text><Text style={styles.muted}>{habits.length} routines in your daily rhythm</Text></View><Pressable onPress={() => setTab('Habits')}><Text style={styles.link}>Manage</Text></Pressable></View>{habits.map((habit) => <HabitCard key={habit.id} habit={habit} updateHabit={updateHabit} />)}</View>
}

function HabitCard({ habit, updateHabit }: { habit: Habit; updateHabit: (id: string, amount: number) => void }) { const percentage = Math.min(100, Math.round((habit.value / habit.goal) * 100)); const complete = habit.value >= habit.goal; return <View style={styles.habitCard}><View style={[styles.habitIcon, { backgroundColor: habit.color }]}><Feather name={habit.icon} size={21} color="#24313B" /></View><View style={styles.habitMain}><Text style={styles.habitName}>{habit.name}</Text><Text style={styles.muted}>{complete ? 'Complete for today' : 'Daily'}</Text><View style={styles.bar}><View style={[styles.barFill, { width: `${percentage}%` }]} /></View><Text style={styles.value}>{habit.value} <Text style={styles.valueMuted}>/ {habit.goal} {habit.unit}</Text></Text></View><View style={styles.controls}><Pressable onPress={() => updateHabit(habit.id, -1)} disabled={habit.value === 0} style={styles.control}><Feather name="minus" size={16} color={habit.value === 0 ? '#C4CCCF' : '#24313B'} /></Pressable><Pressable onPress={() => updateHabit(habit.id, 1)} style={[styles.control, styles.plus]}><Feather name="plus" size={16} color="#FFFFFF" /></Pressable></View></View> }

function Habits({ habits, toggleHabit }: { habits: Habit[]; toggleHabit: (id: string) => void }) { return <View><Text style={styles.date}>YOUR ROUTINES</Text><Text style={styles.title}>Manage habits</Text><Text style={[styles.muted, { marginBottom: 18 }]}>Shape your day around the things that help you feel your best.</Text>{habits.map((habit) => <View key={habit.id} style={styles.manageRow}><View style={[styles.habitIcon, { backgroundColor: habit.color }]}><Feather name={habit.icon} size={20} color="#24313B" /></View><View style={styles.manageCopy}><Text style={styles.habitName}>{habit.name}</Text><Text style={styles.muted}>Goal: {habit.goal} {habit.unit} · Daily</Text></View><Pressable onPress={() => toggleHabit(habit.id)} style={[styles.switch, habit.enabled && styles.switchOn]}><View style={[styles.switchThumb, habit.enabled && styles.switchThumbOn]} /></Pressable></View>)}<View style={styles.addCard}><Feather name="plus-circle" size={22} color="#E86F51" /><Text style={styles.addText}>Add a new habit</Text><Text style={styles.muted}>Create custom routines from the web app or expand this screen with a native form.</Text></View></View> }

function Insights({ habits, progress }: { habits: Habit[]; progress: number }) { const consistency = useMemo(() => habits.length ? Math.round(progress * 0.7) : 0, [habits.length, progress]); return <View><Text style={styles.date}>LOOKING BACK</Text><Text style={styles.title}>Your progress</Text><Text style={[styles.muted, { marginBottom: 18 }]}>Patterns that show how small choices add up.</Text><View style={styles.metricGrid}><View style={styles.metric}><Text style={styles.cardLabel}>CONSISTENCY</Text><Text style={styles.metricValue}>{consistency}%</Text><Text style={styles.muted}>Last 7 days</Text></View><View style={styles.metric}><Text style={styles.cardLabel}>BEST STREAK</Text><Text style={styles.metricValue}>0 days</Text><Text style={styles.muted}>Your personal best</Text></View></View><View style={styles.chartCard}><Text style={styles.cardLabel}>DAILY COMPLETION</Text><View style={styles.chart}><View style={[styles.chartLine, { height: `${Math.max(8, progress)}%` }]} /></View><View style={styles.chartLabels}><Text style={styles.muted}>Mon</Text><Text style={styles.muted}>Wed</Text><Text style={styles.muted}>Fri</Text><Text style={styles.muted}>Sun</Text></View></View></View> }

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: '#F7F6F2' }, errorScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }, errorTitle: { color: '#24313B', fontSize: 24, fontWeight: '700', marginBottom: 8 }, container: { padding: 20, paddingBottom: 110 }, header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }, brandRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, logo: { width: 30, height: 30, borderRadius: 9 }, brand: { fontSize: 17, fontWeight: '700', color: '#24313B' }, bell: { width: 42, height: 42, borderRadius: 14, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }, dot: { width: 6, height: 6, borderRadius: 6, backgroundColor: '#E86F51', position: 'absolute', right: 10, top: 9 }, hero: { backgroundColor: '#D9F2F0', borderRadius: 24, padding: 22, marginBottom: 26 }, eyebrow: { fontSize: 10, fontWeight: '800', letterSpacing: 1.5, color: '#E86F51', marginBottom: 13 }, heroTitle: { fontSize: 30, lineHeight: 34, fontWeight: '700', color: '#24313B' }, heroAccent: { color: '#E86F51', fontStyle: 'italic' }, heroBody: { color: '#52626B', marginTop: 12, fontSize: 14 }, greeting: { marginBottom: 20 }, date: { color: '#E86F51', fontSize: 11, fontWeight: '800', letterSpacing: 1.4, marginBottom: 7 }, title: { color: '#24313B', fontSize: 26, fontWeight: '700', marginBottom: 6 }, muted: { color: '#7A878D', fontSize: 13, lineHeight: 19 }, overview: { flexDirection: 'row', gap: 12, marginBottom: 28 }, progressCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 16 }, streakCard: { flex: 1, backgroundColor: '#FCE1D8', borderRadius: 18, padding: 16 }, cardLabel: { color: '#8A969D', fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 8 }, bigNumber: { color: '#24313B', fontSize: 34, fontWeight: '700', marginBottom: 2 }, streakNumber: { color: '#24313B', fontSize: 22, fontWeight: '700', marginBottom: 2 }, sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 13 }, sectionTitle: { color: '#24313B', fontSize: 18, fontWeight: '700' }, link: { color: '#E86F51', fontWeight: '700' }, habitCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 15, flexDirection: 'row', gap: 12, marginBottom: 12, alignItems: 'center' }, habitIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' }, habitMain: { flex: 1 }, habitName: { color: '#24313B', fontSize: 15, fontWeight: '700', marginBottom: 2 }, bar: { height: 5, backgroundColor: '#EEF1EF', borderRadius: 5, marginTop: 10, overflow: 'hidden' }, barFill: { height: '100%', backgroundColor: '#E86F51', borderRadius: 5 }, value: { color: '#24313B', fontSize: 12, fontWeight: '700', marginTop: 7 }, valueMuted: { color: '#8A969D', fontWeight: '400' }, controls: { gap: 7 }, control: { width: 30, height: 30, borderRadius: 10, backgroundColor: '#F2F4F1', alignItems: 'center', justifyContent: 'center' }, plus: { backgroundColor: '#E86F51' }, nav: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 78, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E8ECE8', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 12 }, navItem: { alignItems: 'center', gap: 4, minWidth: 70 }, navLabel: { color: '#8A969D', fontSize: 11, fontWeight: '600' }, navActive: { color: '#E86F51' }, manageRow: { backgroundColor: '#FFFFFF', borderRadius: 17, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 11, marginBottom: 10 }, manageCopy: { flex: 1 }, switch: { width: 42, height: 25, borderRadius: 20, backgroundColor: '#DCE1DF', padding: 3 }, switchOn: { backgroundColor: '#E86F51' }, switchThumb: { width: 19, height: 19, borderRadius: 10, backgroundColor: '#FFFFFF' }, switchThumbOn: { alignSelf: 'flex-end' }, addCard: { backgroundColor: '#FFF5EF', borderRadius: 18, padding: 18, marginTop: 8 }, addText: { color: '#24313B', fontSize: 16, fontWeight: '700', marginTop: 10, marginBottom: 3 }, metricGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 }, metric: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17 }, metricValue: { color: '#24313B', fontSize: 25, fontWeight: '700', marginBottom: 2 }, chartCard: { backgroundColor: '#FFFFFF', borderRadius: 18, padding: 17 }, chart: { height: 150, backgroundColor: '#F7F6F2', borderRadius: 12, marginTop: 10, justifyContent: 'flex-end', overflow: 'hidden' }, chartLine: { width: '100%', backgroundColor: '#D9F2F0', borderTopWidth: 3, borderTopColor: '#5BAEA9' }, chartLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 } })
