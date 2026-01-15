import './Recommendation.css'

function Recommendation({ recommendation, isLoading, onStartOver, onGetAlternative, answers }) {
  if (isLoading) {
    return (
      <div className="recommendation loading-state">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <span className="loading-icon">🍽️</span>
          </div>
          <h2 className="loading-title">Finding your perfect match...</h2>
          <p className="loading-subtitle">Our AI is searching for the ideal restaurant based on your preferences</p>
        </div>
      </div>
    )
  }

  if (recommendation?.error) {
    return (
      <div className="recommendation error-state">
        <div className="error-container">
          <span className="error-icon">😕</span>
          <h2 className="error-title">Oops!</h2>
          <p className="error-message">{recommendation.message}</p>
          <button className="primary-button" onClick={onStartOver}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!recommendation) {
    return null
  }

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating)
    const hasHalf = rating % 1 >= 0.5
    const stars = []

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="star filled">★</span>)
    }
    if (hasHalf) {
      stars.push(<span key="half" className="star half">★</span>)
    }
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="star empty">☆</span>)
    }

    return stars
  }

  return (
    <div className="recommendation">
      <div className="recommendation-card">
        <div className="card-header">
          <span className="match-badge">Perfect Match!</span>
        </div>

        <div className="restaurant-info">
          <h1 className="restaurant-name">{recommendation.name}</h1>

          <div className="restaurant-meta">
            <span className="cuisine-tag">{recommendation.cuisine}</span>
            <span className="price-tag">{recommendation.priceRange}</span>
            {recommendation.distance && (
              <span className="distance-tag">{recommendation.distance}</span>
            )}
          </div>

          {recommendation.rating && (
            <div className="rating-section">
              <div className="stars">
                {renderStars(recommendation.rating)}
              </div>
              <span className="rating-number">{recommendation.rating.toFixed(1)}</span>
              {recommendation.reviewCount && (
                <span className="review-count">({recommendation.reviewCount} reviews)</span>
              )}
            </div>
          )}

          {recommendation.reviewSummary && (
            <div className="review-summary">
              <h3>What people say</h3>
              <p>"{recommendation.reviewSummary}"</p>
            </div>
          )}
        </div>

        <div className="why-section">
          <h3>Why this is perfect for you</h3>
          <p>{recommendation.reasoning}</p>
        </div>

        {recommendation.highlights && recommendation.highlights.length > 0 && (
          <div className="highlights-section">
            <h3>Highlights</h3>
            <div className="highlights-list">
              {recommendation.highlights.map((highlight, index) => (
                <span key={index} className="highlight-tag">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {recommendation.website && (
          <a
            href={recommendation.website}
            target="_blank"
            rel="noopener noreferrer"
            className="website-link"
          >
            <span>Visit Website</span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
            </svg>
          </a>
        )}

        <div className="action-buttons">
          <button className="secondary-button" onClick={onGetAlternative}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            <span>Show me another option</span>
          </button>

          <button className="text-button" onClick={onStartOver}>
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            <span>Start Over</span>
          </button>
        </div>
      </div>

      <div className="preferences-summary">
        <h4>Your preferences</h4>
        <div className="summary-tags">
          <span className="summary-tag">{getCuisineLabel(answers.cuisine)}</span>
          <span className="summary-tag">{answers.budget}</span>
          <span className="summary-tag">{getDistanceLabel(answers.distance)}</span>
          <span className="summary-tag">{getOccasionLabel(answers.occasion)}</span>
        </div>
      </div>
    </div>
  )
}

function getCuisineLabel(value) {
  const labels = {
    'italian': 'Italian',
    'asian': 'Asian',
    'mexican': 'Mexican',
    'american': 'American',
    'healthy': 'Healthy',
    'surprise': 'Surprise me'
  }
  return labels[value] || value
}

function getDistanceLabel(value) {
  const labels = {
    'nearby': 'Nearby',
    'moderate': 'Willing to drive',
    'anywhere': 'Worth the trip'
  }
  return labels[value] || value
}

function getOccasionLabel(value) {
  const labels = {
    'quick': 'Quick bite',
    'date': 'Date night',
    'family': 'Family dinner',
    'solo': 'Solo dining',
    'friends': 'Friends hangout'
  }
  return labels[value] || value
}

export default Recommendation
