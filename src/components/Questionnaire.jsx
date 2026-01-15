import { useState } from 'react'
import './Questionnaire.css'

const questions = [
  {
    id: 'cuisine',
    title: "What are you craving?",
    subtitle: "Pick what sounds most appealing right now",
    options: [
      { value: 'italian', label: 'Italian', icon: '🍝' },
      { value: 'asian', label: 'Asian', icon: '🍜' },
      { value: 'mexican', label: 'Mexican', icon: '🌮' },
      { value: 'american', label: 'American', icon: '🍔' },
      { value: 'healthy', label: 'Healthy', icon: '🥗' },
      { value: 'surprise', label: 'Surprise me!', icon: '🎲' },
    ]
  },
  {
    id: 'budget',
    title: "What's your budget?",
    subtitle: "How much are you looking to spend per person?",
    options: [
      { value: '$', label: 'Budget-friendly', icon: '💵', description: 'Under $15' },
      { value: '$$', label: 'Moderate', icon: '💵💵', description: '$15-30' },
      { value: '$$$', label: 'Upscale', icon: '💵💵💵', description: '$30+' },
    ]
  },
  {
    id: 'distance',
    title: "How far are you willing to go?",
    subtitle: "Tell us about your travel preferences",
    options: [
      { value: 'nearby', label: 'Keep it close', icon: '📍', description: 'Within 10 min' },
      { value: 'moderate', label: 'Willing to drive', icon: '🚗', description: '10-20 min away' },
      { value: 'anywhere', label: 'Worth the trip', icon: '✈️', description: 'Distance no issue' },
    ]
  },
  {
    id: 'occasion',
    title: "What's the occasion?",
    subtitle: "This helps us find the right vibe",
    options: [
      { value: 'quick', label: 'Quick bite', icon: '⚡', description: 'Fast & casual' },
      { value: 'date', label: 'Date night', icon: '💕', description: 'Romantic atmosphere' },
      { value: 'family', label: 'Family dinner', icon: '👨‍👩‍👧‍👦', description: 'Kid-friendly' },
      { value: 'solo', label: 'Solo dining', icon: '🧘', description: 'Comfortable alone' },
      { value: 'friends', label: 'Friends hangout', icon: '🎉', description: 'Social & fun' },
    ]
  }
]

function Questionnaire({ onComplete, onBack }) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [direction, setDirection] = useState('forward')

  const question = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const handleSelect = (value) => {
    const newAnswers = { ...answers, [question.id]: value }
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setDirection('forward')
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1)
      }, 200)
    } else {
      onComplete(newAnswers)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setDirection('backward')
      setCurrentQuestion(currentQuestion - 1)
    } else {
      onBack()
    }
  }

  return (
    <div className="questionnaire">
      <div className="questionnaire-header">
        <button className="back-button" onClick={handleBack}>
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>

        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <span className="progress-text">
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>
      </div>

      <div className={`question-container ${direction}`} key={question.id}>
        <h2 className="question-title">{question.title}</h2>
        <p className="question-subtitle">{question.subtitle}</p>

        <div className="options-grid">
          {question.options.map((option) => (
            <button
              key={option.value}
              className={`option-button ${answers[question.id] === option.value ? 'selected' : ''}`}
              onClick={() => handleSelect(option.value)}
            >
              <span className="option-icon">{option.icon}</span>
              <span className="option-label">{option.label}</span>
              {option.description && (
                <span className="option-description">{option.description}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Questionnaire
