import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const client = new Anthropic();

app.post('/api/recommend', async (req, res) => {
  try {
    const { cuisine, budget, distance, occasion, excludeRestaurant } = req.body;

    const prompt = buildPrompt({ cuisine, budget, distance, occasion, excludeRestaurant });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    });

    const responseText = message.content[0].text;
    const recommendation = parseRecommendation(responseText);

    res.json(recommendation);
  } catch (error) {
    console.error('Error getting recommendation:', error);
    res.status(500).json({
      error: true,
      message: 'Failed to get recommendation. Please try again.'
    });
  }
});

function buildPrompt({ cuisine, budget, distance, occasion, excludeRestaurant }) {
  const cuisineMap = {
    'italian': 'Italian food (pasta, pizza, risotto)',
    'asian': 'Asian cuisine (Chinese, Japanese, Thai, Vietnamese, Korean)',
    'mexican': 'Mexican food (tacos, burritos, enchiladas)',
    'american': 'American cuisine (burgers, steaks, BBQ)',
    'healthy': 'Healthy options (salads, grain bowls, vegetarian)',
    'surprise': 'something unique and unexpected'
  };

  const budgetMap = {
    '$': 'budget-friendly (under $15 per person)',
    '$$': 'moderate ($15-30 per person)',
    '$$$': 'upscale ($30+ per person)'
  };

  const distanceMap = {
    'nearby': 'within 10 minutes',
    'moderate': '10-20 minutes away',
    'anywhere': 'any distance, worth the trip'
  };

  const occasionMap = {
    'quick': 'a quick bite - fast and casual',
    'date': 'date night - romantic atmosphere',
    'family': 'family dinner - kid-friendly',
    'solo': 'solo dining - comfortable alone',
    'friends': 'friends hangout - social and fun'
  };

  let exclusionNote = '';
  if (excludeRestaurant) {
    exclusionNote = `\n\nIMPORTANT: Do NOT recommend "${excludeRestaurant}" - the user wants a different option.`;
  }

  return `You are a helpful restaurant recommendation assistant. Based on the user's preferences, recommend ONE specific restaurant that would be a great match.

User preferences:
- Craving: ${cuisineMap[cuisine] || cuisine}
- Budget: ${budgetMap[budget] || budget}
- Distance: ${distanceMap[distance] || distance}
- Occasion: ${occasionMap[occasion] || occasion}${exclusionNote}

Please respond with a restaurant recommendation in the following JSON format ONLY (no additional text before or after):
{
  "name": "Restaurant Name",
  "cuisine": "Type of cuisine (e.g., Italian, Japanese, American)",
  "priceRange": "${budget}",
  "distance": "Approximate travel time (e.g., 5 min, 15 min)",
  "rating": 4.5,
  "reviewCount": 250,
  "reviewSummary": "A brief 1-sentence summary of what reviewers typically say",
  "reasoning": "2-3 sentences explaining why this restaurant is perfect for their specific preferences",
  "highlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "website": "https://example.com (or null if unknown)"
}

Make the recommendation feel personalized and explain how it matches their mood, budget, distance preference, and occasion. The restaurant can be a well-known chain or a type of local restaurant that would typically exist.`;
}

function parseRecommendation(text) {
  try {
    // Try to find JSON in the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        name: parsed.name || 'Great Restaurant',
        cuisine: parsed.cuisine || 'Various',
        priceRange: parsed.priceRange || '$$',
        distance: parsed.distance || null,
        rating: parsed.rating || null,
        reviewCount: parsed.reviewCount || null,
        reviewSummary: parsed.reviewSummary || null,
        reasoning: parsed.reasoning || 'This restaurant matches your preferences perfectly.',
        highlights: parsed.highlights || [],
        website: parsed.website || null
      };
    }
  } catch (e) {
    console.error('Error parsing recommendation:', e);
  }

  // Fallback if parsing fails
  return {
    name: 'Local Favorite',
    cuisine: 'Various',
    priceRange: '$$',
    reasoning: text.substring(0, 200),
    highlights: [],
    website: null
  };
}

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
