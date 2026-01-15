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

// Check if API key is available
const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
let client = null;

if (hasApiKey) {
  client = new Anthropic();
  console.log('Anthropic API key found - using AI recommendations');
} else {
  console.log('No Anthropic API key - using curated recommendations');
}

app.post('/api/recommend', async (req, res) => {
  try {
    const { cuisine, budget, distance, occasion, excludeRestaurant } = req.body;

    let recommendation;

    if (client) {
      // Use AI recommendation
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
      recommendation = parseRecommendation(responseText);
    } else {
      // Use curated fallback
      recommendation = getCuratedRecommendation({ cuisine, budget, distance, occasion, excludeRestaurant });
    }

    res.json(recommendation);
  } catch (error) {
    console.error('Error getting recommendation:', error);
    // Fallback to curated if API fails
    try {
      const { cuisine, budget, distance, occasion, excludeRestaurant } = req.body;
      const recommendation = getCuratedRecommendation({ cuisine, budget, distance, occasion, excludeRestaurant });
      res.json(recommendation);
    } catch (fallbackError) {
      res.status(500).json({
        error: true,
        message: 'Failed to get recommendation. Please try again.'
      });
    }
  }
});

// Curated restaurant database
const restaurantDatabase = {
  italian: [
    {
      name: "Olive Garden",
      cuisine: "Italian",
      rating: 4.2,
      reviewCount: 1250,
      reviewSummary: "Great for families with generous portions and their famous unlimited breadsticks",
      highlights: ["Unlimited breadsticks", "Family-friendly", "Consistent quality"],
      website: "https://www.olivegarden.com",
      budgets: ["$", "$$"],
      occasions: ["family", "friends", "quick"]
    },
    {
      name: "Carrabba's Italian Grill",
      cuisine: "Italian",
      rating: 4.4,
      reviewCount: 890,
      reviewSummary: "Authentic Italian recipes with a warm, welcoming atmosphere perfect for special occasions",
      highlights: ["Wood-fired grill", "Fresh ingredients", "Great wine selection"],
      website: "https://www.carrabbas.com",
      budgets: ["$$", "$$$"],
      occasions: ["date", "family", "friends"]
    },
    {
      name: "Maggiano's Little Italy",
      cuisine: "Italian",
      rating: 4.5,
      reviewCount: 720,
      reviewSummary: "Upscale Italian dining with generous family-style portions in an elegant setting",
      highlights: ["Family-style portions", "Elegant atmosphere", "Excellent service"],
      website: "https://www.maggianos.com",
      budgets: ["$$", "$$$"],
      occasions: ["date", "family", "friends"]
    },
    {
      name: "Fazoli's",
      cuisine: "Italian",
      rating: 4.0,
      reviewCount: 450,
      reviewSummary: "Fast-casual Italian with unlimited breadsticks - quick, affordable, and satisfying",
      highlights: ["Fast service", "Affordable", "Unlimited breadsticks"],
      website: "https://www.fazolis.com",
      budgets: ["$"],
      occasions: ["quick", "solo", "family"]
    }
  ],
  asian: [
    {
      name: "P.F. Chang's",
      cuisine: "Asian Fusion",
      rating: 4.3,
      reviewCount: 1100,
      reviewSummary: "Vibrant atmosphere with creative Asian-inspired dishes and shareable plates",
      highlights: ["Lettuce wraps", "Great cocktails", "Stylish ambiance"],
      website: "https://www.pfchangs.com",
      budgets: ["$$", "$$$"],
      occasions: ["date", "friends", "family"]
    },
    {
      name: "Panda Express",
      cuisine: "Chinese-American",
      rating: 4.0,
      reviewCount: 2200,
      reviewSummary: "Quick and reliable Chinese-American favorites with bold flavors",
      highlights: ["Orange chicken", "Fast service", "Customizable plates"],
      website: "https://www.pandaexpress.com",
      budgets: ["$"],
      occasions: ["quick", "solo", "family"]
    },
    {
      name: "Benihana",
      cuisine: "Japanese",
      rating: 4.6,
      reviewCount: 650,
      reviewSummary: "Theatrical hibachi dining experience that's perfect for celebrations",
      highlights: ["Live cooking show", "Fun atmosphere", "Great for groups"],
      website: "https://www.benihana.com",
      budgets: ["$$", "$$$"],
      occasions: ["date", "friends", "family"]
    },
    {
      name: "Thai Basil Kitchen",
      cuisine: "Thai",
      rating: 4.4,
      reviewCount: 380,
      reviewSummary: "Authentic Thai flavors with customizable spice levels in a cozy setting",
      highlights: ["Fresh ingredients", "Authentic recipes", "Vegetarian options"],
      website: null,
      budgets: ["$", "$$"],
      occasions: ["date", "solo", "friends"]
    }
  ],
  mexican: [
    {
      name: "Chipotle",
      cuisine: "Mexican",
      rating: 4.2,
      reviewCount: 3500,
      reviewSummary: "Fresh, customizable burritos and bowls made right in front of you",
      highlights: ["Fresh ingredients", "Customizable", "Fast service"],
      website: "https://www.chipotle.com",
      budgets: ["$"],
      occasions: ["quick", "solo", "friends"]
    },
    {
      name: "On The Border",
      cuisine: "Tex-Mex",
      rating: 4.1,
      reviewCount: 780,
      reviewSummary: "Lively Tex-Mex spot with strong margaritas and sizzling fajitas",
      highlights: ["Great margaritas", "Sizzling fajitas", "Fun atmosphere"],
      website: "https://www.ontheborder.com",
      budgets: ["$$"],
      occasions: ["friends", "family", "date"]
    },
    {
      name: "Cafe Rio",
      cuisine: "Mexican",
      rating: 4.4,
      reviewCount: 920,
      reviewSummary: "Fresh, made-from-scratch Mexican with legendary sweet pork barbacoa",
      highlights: ["Sweet pork", "Fresh salsa bar", "Generous portions"],
      website: "https://www.caferio.com",
      budgets: ["$", "$$"],
      occasions: ["quick", "family", "friends"]
    },
    {
      name: "Mi Cocina",
      cuisine: "Upscale Mexican",
      rating: 4.6,
      reviewCount: 540,
      reviewSummary: "Elevated Mexican cuisine with craft cocktails in a chic atmosphere",
      highlights: ["Craft cocktails", "Upscale ambiance", "Creative menu"],
      website: null,
      budgets: ["$$", "$$$"],
      occasions: ["date", "friends"]
    }
  ],
  american: [
    {
      name: "The Cheesecake Factory",
      cuisine: "American",
      rating: 4.4,
      reviewCount: 1800,
      reviewSummary: "Massive menu with something for everyone and famous cheesecakes",
      highlights: ["Huge portions", "Extensive menu", "Famous cheesecakes"],
      website: "https://www.thecheesecakefactory.com",
      budgets: ["$$"],
      occasions: ["family", "friends", "date"]
    },
    {
      name: "Five Guys",
      cuisine: "American Burgers",
      rating: 4.3,
      reviewCount: 2100,
      reviewSummary: "Fresh, never frozen burgers with unlimited toppings and amazing fries",
      highlights: ["Fresh beef", "Free toppings", "Cajun fries"],
      website: "https://www.fiveguys.com",
      budgets: ["$", "$$"],
      occasions: ["quick", "solo", "friends"]
    },
    {
      name: "Texas Roadhouse",
      cuisine: "American Steakhouse",
      rating: 4.5,
      reviewCount: 1400,
      reviewSummary: "Hand-cut steaks and legendary rolls in a lively, family-friendly atmosphere",
      highlights: ["Fresh-baked rolls", "Hand-cut steaks", "Great value"],
      website: "https://www.texasroadhouse.com",
      budgets: ["$$"],
      occasions: ["family", "friends", "date"]
    },
    {
      name: "Ruth's Chris Steak House",
      cuisine: "Upscale Steakhouse",
      rating: 4.7,
      reviewCount: 620,
      reviewSummary: "Premium steaks sizzling in butter served in an elegant setting",
      highlights: ["Sizzling butter finish", "Premium cuts", "Elegant atmosphere"],
      website: "https://www.ruthschris.com",
      budgets: ["$$$"],
      occasions: ["date", "friends"]
    }
  ],
  healthy: [
    {
      name: "sweetgreen",
      cuisine: "Healthy Salads",
      rating: 4.3,
      reviewCount: 980,
      reviewSummary: "Fresh, seasonal salads and grain bowls with locally-sourced ingredients",
      highlights: ["Seasonal menu", "Sustainable sourcing", "Customizable bowls"],
      website: "https://www.sweetgreen.com",
      budgets: ["$", "$$"],
      occasions: ["quick", "solo", "friends"]
    },
    {
      name: "CAVA",
      cuisine: "Mediterranean",
      rating: 4.4,
      reviewCount: 750,
      reviewSummary: "Build-your-own Mediterranean bowls with bold flavors and fresh ingredients",
      highlights: ["Fresh dips", "Customizable", "Healthy options"],
      website: "https://www.cava.com",
      budgets: ["$", "$$"],
      occasions: ["quick", "solo", "friends"]
    },
    {
      name: "True Food Kitchen",
      cuisine: "Health-Conscious American",
      rating: 4.5,
      reviewCount: 580,
      reviewSummary: "Doctor-designed menu focusing on anti-inflammatory ingredients and seasonal dishes",
      highlights: ["Anti-inflammatory menu", "Beautiful presentation", "Great atmosphere"],
      website: "https://www.truefoodkitchen.com",
      budgets: ["$$", "$$$"],
      occasions: ["date", "friends", "solo"]
    },
    {
      name: "Tender Greens",
      cuisine: "Farm-to-Table",
      rating: 4.2,
      reviewCount: 420,
      reviewSummary: "Chef-driven comfort food with a healthy twist using farm-fresh ingredients",
      highlights: ["Farm-fresh ingredients", "Chef-crafted", "Seasonal specials"],
      website: "https://www.tendergreens.com",
      budgets: ["$$"],
      occasions: ["quick", "solo", "friends"]
    }
  ],
  surprise: [
    {
      name: "The Melting Pot",
      cuisine: "Fondue",
      rating: 4.5,
      reviewCount: 680,
      reviewSummary: "Interactive fondue dining experience perfect for memorable evenings",
      highlights: ["Interactive dining", "Romantic atmosphere", "Unique experience"],
      website: "https://www.meltingpot.com",
      budgets: ["$$", "$$$"],
      occasions: ["date", "friends"]
    },
    {
      name: "Brazilian Steakhouse",
      cuisine: "Brazilian Churrascaria",
      rating: 4.6,
      reviewCount: 520,
      reviewSummary: "All-you-can-eat carved meats with an endless salad bar experience",
      highlights: ["Endless meat service", "Impressive salad bar", "Upscale experience"],
      website: null,
      budgets: ["$$$"],
      occasions: ["date", "friends", "family"]
    },
    {
      name: "Korean BBQ House",
      cuisine: "Korean BBQ",
      rating: 4.4,
      reviewCount: 390,
      reviewSummary: "Grill your own meats at the table with authentic Korean banchan sides",
      highlights: ["Interactive grilling", "Authentic banchan", "Fun for groups"],
      website: null,
      budgets: ["$$"],
      occasions: ["friends", "date", "family"]
    },
    {
      name: "Dim Sum Palace",
      cuisine: "Chinese Dim Sum",
      rating: 4.3,
      reviewCount: 440,
      reviewSummary: "Traditional dim sum experience with rolling carts and endless small plates",
      highlights: ["Authentic dim sum", "Variety of dishes", "Unique experience"],
      website: null,
      budgets: ["$", "$$"],
      occasions: ["friends", "family", "solo"]
    }
  ]
};

function getCuratedRecommendation({ cuisine, budget, distance, occasion, excludeRestaurant }) {
  const restaurants = restaurantDatabase[cuisine] || restaurantDatabase.surprise;

  // Filter by budget and occasion
  let filtered = restaurants.filter(r => {
    const matchesBudget = r.budgets.includes(budget);
    const matchesOccasion = r.occasions.includes(occasion);
    const notExcluded = r.name !== excludeRestaurant;
    return matchesBudget && matchesOccasion && notExcluded;
  });

  // If no matches, relax constraints
  if (filtered.length === 0) {
    filtered = restaurants.filter(r => r.name !== excludeRestaurant);
  }

  // If still no matches, use all restaurants
  if (filtered.length === 0) {
    filtered = restaurants;
  }

  // Pick a random restaurant from filtered list
  const restaurant = filtered[Math.floor(Math.random() * filtered.length)];

  // Generate distance based on preference
  const distanceMap = {
    'nearby': ['3 min', '5 min', '7 min', '10 min'],
    'moderate': ['12 min', '15 min', '18 min', '20 min'],
    'anywhere': ['15 min', '20 min', '25 min', '30 min']
  };
  const distances = distanceMap[distance] || distanceMap.nearby;
  const selectedDistance = distances[Math.floor(Math.random() * distances.length)];

  // Generate personalized reasoning
  const reasoning = generateReasoning(restaurant, { cuisine, budget, distance, occasion });

  return {
    name: restaurant.name,
    cuisine: restaurant.cuisine,
    priceRange: budget,
    distance: selectedDistance,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    reviewSummary: restaurant.reviewSummary,
    reasoning: reasoning,
    highlights: restaurant.highlights,
    website: restaurant.website
  };
}

function generateReasoning(restaurant, preferences) {
  const occasionPhrases = {
    'quick': "perfect for when you need something fast without sacrificing quality",
    'date': "sets the right mood for a memorable evening together",
    'family': "offers a welcoming atmosphere where everyone can find something they'll love",
    'solo': "provides a comfortable setting where you can enjoy a great meal at your own pace",
    'friends': "has the perfect vibe for catching up and sharing good food together"
  };

  const budgetPhrases = {
    '$': "keeps things budget-friendly without compromising on taste",
    '$$': "offers great value for quality dining",
    '$$$': "delivers a premium experience that's worth the splurge"
  };

  const occasionPhrase = occasionPhrases[preferences.occasion] || "fits what you're looking for";
  const budgetPhrase = budgetPhrases[preferences.budget] || "matches your budget";

  return `${restaurant.name} ${occasionPhrase}. It ${budgetPhrase}, and their ${restaurant.highlights[0].toLowerCase()} is consistently praised by diners.`;
}

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
