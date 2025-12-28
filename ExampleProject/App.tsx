import { useState, useEffect } from 'react'
import { OnboardingForm } from './components/OnboardingForm'
import { RoutineDisplay } from './components/RoutineDisplay'
import { ProgressTracker } from './components/ProgressTracker'
import { Button } from './components/ui/button'
import { UserProfile, DayRoutine } from './types'
import { generateRoutine } from './utils/generateRoutine'
import { saveUserProfile, loadUserProfile, saveProgress, loadProgress } from './utils/storage'
import { RotateCcw, Home, BarChart3, Calendar, Bell } from 'lucide-react'
import { motion } from 'framer-motion'

function App() {
  const [currentView, setCurrentView] = useState<'onboarding' | 'routine' | 'progress'>('onboarding')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [routine, setRoutine] = useState<DayRoutine[]>([])
  const [currentDay, setCurrentDay] = useState(0)
  const [completedDays, setCompletedDays] = useState<Set<number>>(new Set())

  useEffect(() => {
    const savedProfile = loadUserProfile()
    const savedProgress = loadProgress()
    
    if (savedProfile) {
      setUserProfile(savedProfile)
      const generatedRoutine = generateRoutine(savedProfile)
      setRoutine(generatedRoutine)
      setCurrentView('routine')
      
      if (savedProgress) {
        setCurrentDay(savedProgress.currentDay)
        setCompletedDays(new Set(savedProgress.completedDays))
      }
    }
  }, [])

  const handleOnboardingComplete = (profile: UserProfile) => {
    setUserProfile(profile)
    saveUserProfile(profile)
    const generatedRoutine = generateRoutine(profile)
    setRoutine(generatedRoutine)
    setCurrentView('routine')
  }

  const handleDayComplete = (dayIndex: number) => {
    const newCompletedDays = new Set(completedDays)
    if (newCompletedDays.has(dayIndex)) {
      newCompletedDays.delete(dayIndex)
    } else {
      newCompletedDays.add(dayIndex)
    }
    setCompletedDays(newCompletedDays)
    saveProgress({ currentDay, completedDays: Array.from(newCompletedDays) })
  }

  const handleDayChange = (dayIndex: number) => {
    setCurrentDay(dayIndex)
    saveProgress({ currentDay: dayIndex, completedDays: Array.from(completedDays) })
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your progress? This will clear all your data.')) {
      localStorage.clear()
      setUserProfile(null)
      setRoutine([])
      setCurrentDay(0)
      setCompletedDays(new Set())
      setCurrentView('onboarding')
    }
  }

  const renderNavigation = () => (
    <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 shadow-2xl border-b-4 border-orange-600">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-3xl font-black flex items-center gap-3">
          💪 FITPATH
        </h1>
        <div className="flex gap-3">
          <Button
            onClick={() => setCurrentView('routine')}
            variant={currentView === 'routine' ? 'secondary' : 'ghost'}
            className="text-white hover:bg-white/20 font-black text-lg px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            WORKOUT
          </Button>
          <Button
            onClick={() => setCurrentView('progress')}
            variant={currentView === 'progress' ? 'secondary' : 'ghost'}
            className="text-white hover:bg-white/20 font-black text-lg px-6 py-3"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            PROGRESS
          </Button>
          <Button
            onClick={handleReset}
            variant="ghost"
            className="text-white hover:bg-white/20 font-black text-lg px-6 py-3"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            RESET
          </Button>
        </div>
      </div>
    </div>
  )

  if (currentView === 'onboarding') {
    return <OnboardingForm onComplete={handleOnboardingComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {renderNavigation()}
      
      <div className="max-w-6xl mx-auto p-4">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentView === 'routine' && (
            <RoutineDisplay
              routine={routine}
              currentDay={currentDay}
              completedDays={completedDays}
              onDayComplete={handleDayComplete}
              onDayChange={handleDayChange}
            />
          )}
          
          {currentView === 'progress' && (
            <ProgressTracker
              routine={routine}
              completedDays={completedDays}
              currentDay={currentDay}
            />
          )}
        </motion.div>
      </div>
    </div>
  )
