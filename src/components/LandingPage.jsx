import './LandingPage.css'

function LandingPage({ onStart }) {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="hero-icon">
          <span className="fork">🍴</span>
        </div>

        <h1 className="landing-title">
          Can't decide where to eat?
        </h1>

        <p className="landing-subtitle">
          Let AI help you find the perfect restaurant based on your mood, budget, and preferences.
        </p>

        <button className="start-button" onClick={onStart}>
          <span>Find My Restaurant</span>
          <svg
            className="arrow-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <div className="features">
          <div className="feature">
            <span className="feature-icon">💬</span>
            <span className="feature-text">Quick 4 questions</span>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <span className="feature-text">AI-powered picks</span>
          </div>
          <div className="feature">
            <span className="feature-icon">✨</span>
            <span className="feature-text">Personalized for you</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
