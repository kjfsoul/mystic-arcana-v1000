# Let me create some data structures for the tarot module
import json
import random

# Define the comprehensive tarot card data structure
major_arcana = [
    {"id": 0, "name": "The Fool", "keywords": ["new beginnings", "innocence", "adventure", "leap of faith"], 
     "meanings": {"upright": "New beginnings, spontaneity, innocence", "reversed": "Recklessness, taken advantage of, inconsistency"}},
    {"id": 1, "name": "The Magician", "keywords": ["manifestation", "willpower", "desire", "creation"], 
     "meanings": {"upright": "Manifestation, resourcefulness, power", "reversed": "Manipulation, poor planning, untapped talents"}},
    {"id": 2, "name": "The High Priestess", "keywords": ["intuition", "sacred knowledge", "divine feminine", "subconscious mind"], 
     "meanings": {"upright": "Intuition, sacred knowledge, divine feminine", "reversed": "Secrets, disconnected from intuition, withdrawal"}},
    {"id": 3, "name": "The Empress", "keywords": ["femininity", "beauty", "nature", "abundance"], 
     "meanings": {"upright": "Femininity, beauty, nature, abundance", "reversed": "Creative block, dependence on others"}},
    {"id": 4, "name": "The Emperor", "keywords": ["authority", "structure", "control", "fatherhood"], 
     "meanings": {"upright": "Authority, establishment, structure", "reversed": "Tyranny, rigidity, coldness"}},
    {"id": 5, "name": "The Hierophant", "keywords": ["spiritual wisdom", "religious beliefs", "conformity", "tradition"], 
     "meanings": {"upright": "Spiritual wisdom, religious beliefs, conformity", "reversed": "Personal beliefs, freedom, challenging the status quo"}},
]

minor_arcana_suits = {
    "Cups": {"element": "Water", "themes": ["emotions", "intuition", "relationships", "spirituality"]},
    "Wands": {"element": "Fire", "themes": ["passion", "creativity", "energy", "ambition"]},
    "Swords": {"element": "Air", "themes": ["intellect", "communication", "conflict", "truth"]},
    "Pentacles": {"element": "Earth", "themes": ["material", "practical", "career", "money"]}
}

# Define different tarot spreads
tarot_spreads = {
    "Celtic Cross": {
        "positions": 10,
        "positions_meaning": [
            "Present situation",
            "Challenge/Cross",
            "Distant past/Foundation",
            "Recent past",
            "Possible outcome",
            "Near future",
            "Your approach",
            "External influences",
            "Hopes and fears",
            "Final outcome"
        ],
        "complexity": "Advanced",
        "reading_time": "30-45 minutes"
    },
    "Three Card": {
        "positions": 3,
        "positions_meaning": ["Past", "Present", "Future"],
        "complexity": "Beginner",
        "reading_time": "10-15 minutes"
    },
    "Relationship": {
        "positions": 7,
        "positions_meaning": [
            "You",
            "Your partner",
            "The relationship",
            "Strengths",
            "Challenges",
            "Advice",
            "Outcome"
        ],
        "complexity": "Intermediate",
        "reading_time": "20-30 minutes"
    },
    "Career Path": {
        "positions": 5,
        "positions_meaning": [
            "Current situation",
            "Hidden influences",
            "Guidance",
            "Possible outcome",
            "Advice"
        ],
        "complexity": "Intermediate",
        "reading_time": "15-25 minutes"
    }
}

# User experience levels and preferences
user_experience_levels = {
    "Beginner": {
        "recommended_spreads": ["Three Card"],
        "explanation_depth": "detailed",
        "keywords_shown": True,
        "reversed_cards": False
    },
    "Intermediate": {
        "recommended_spreads": ["Three Card", "Relationship", "Career Path"],
        "explanation_depth": "moderate",
        "keywords_shown": True,
        "reversed_cards": True
    },
    "Advanced": {
        "recommended_spreads": ["Celtic Cross", "Relationship", "Career Path"],
        "explanation_depth": "concise",
        "keywords_shown": False,
        "reversed_cards": True
    }
}

# Mood-based spread recommendations
mood_based_spreads = {
    "Contemplative": ["Celtic Cross", "Spiritual Journey"],
    "Anxious": ["Three Card", "Guidance"],
    "Curious": ["Daily Insight", "What Should I Know"],
    "Focused": ["Career Path", "Decision Making"],
    "Romantic": ["Relationship", "Love Triangle"],
    "Uncertain": ["Yes/No", "Clarity"]
}

print("Tarot module data structures created successfully!")
print(f"Major Arcana cards: {len(major_arcana)}")
print(f"Available spreads: {list(tarot_spreads.keys())}")
print(f"User experience levels: {list(user_experience_levels.keys())}")