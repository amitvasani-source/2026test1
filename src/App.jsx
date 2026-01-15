import { useState } from 'react'
import LandingPage from './components/LandingPage'
import Questionnaire from './components/Questionnaire'
import Recommendation from './components/Recommendation'
import './App.css'

function App() {
  const [currentView, setCurrentView] = useState('landing')
  const [answers, setAnswers] = useState({
    cuisine: '',
    budget: '',
    distance: '',
    occasion: ''
  })
  const [recommendation, setRecommendation] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = () => {
    setCurrentView('questionnaire')
  }

  const handleQuestionnaireComplete = async (finalAnswers) => {
    setAnswers(finalAnswers)
    setIsLoading(true)
    setCurrentView('recommendation')

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalAnswers),
      })

      if (!response.ok) {
        throw new Error('Failed to get recommendation')
      }

      const data = await response.json()
      setRecommendation(data)
    } catch (error) {
      console.error('Error getting recommendation:', error)
      setRecommendation({
        error: true,
        message: 'Sorry, we had trouble finding a recommendation. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartOver = () => {
    setCurrentView('landing')
    setAnswers({
      cuisine: '',
      budget: '',
      distance: '',
      occasion: ''
    })
    setRecommendation(null)
  }

  const handleGetAlternative = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...answers,
          excludeRestaurant: recommendation?.name
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get alternative')
      }

      const data = await response.json()
      setRecommendation(data)
    } catch (error) {
      console.error('Error getting alternative:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <div className="background-pattern"></div>

      {currentView === 'landing' && (
        <LandingPage onStart={handleStart} />
      )}

      {currentView === 'questionnaire' && (
        <Questionnaire
          onComplete={handleQuestionnaireComplete}
          onBack={handleStartOver}
        />
      )}

      {currentView === 'recommendation' && (
        <Recommendation
          recommendation={recommendation}
          isLoading={isLoading}
          onStartOver={handleStartOver}
          onGetAlternative={handleGetAlternative}
          answers={answers}
        />
      )}
    </div>
  )
}

export default App
