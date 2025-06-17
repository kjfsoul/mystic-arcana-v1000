# 🃏 Tarot Data Engine Documentation

## Overview

The Tarot Data Engine is a scalable backend system that replaces hardcoded tarot card arrays with a dynamic database-driven approach. It provides secure API endpoints for accessing tarot deck and card data.

## Architecture

### Database Schema

#### `decks` Table
```sql
CREATE TABLE public.decks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

#### `cards` Table
```sql
CREATE TABLE public.cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deck_id UUID REFERENCES public.decks(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    card_number INTEGER,
    suit VARCHAR(50), -- For minor arcana: cups, wands, swords, pentacles
    arcana_type VARCHAR(50) CHECK (arcana_type IN ('major', 'minor')),
    meaning_upright TEXT NOT NULL,
    meaning_reversed TEXT NOT NULL,
    image_url VARCHAR(500),
    keywords JSONB, -- Array of keywords for the card
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Security

- **Row Level Security (RLS)** enabled on both tables
- **Read Access**: Public (anyone can view decks and cards)
- **Write Access**: Service role only (admin operations)

## API Endpoints

### GET `/api/tarot/deck/[deckId]`

Fetches all cards for a specific tarot deck.

#### Parameters
- `deckId` (string): UUID of the deck to fetch

#### Response Format
```typescript
{
  deck: {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
  };
  cards: Array<{
    id: string;
    name: string;
    arcana: 'major' | 'minor';
    suit: string | null;
    number: number | null;
    frontImage: string | null;
    backImage: string;
    meaning: {
      upright: string;
      reversed: string;
      keywords: string[];
    };
    description: string;
  }>;
  stats: {
    totalCards: number;
    majorArcana: number;
    minorArcana: number;
    suits: {
      cups: number;
      pentacles: number;
      swords: number;
      wands: number;
    };
  };
}
```

#### Example Usage
```typescript
// Fetch Rider-Waite deck
const response = await fetch('/api/tarot/deck/00000000-0000-0000-0000-000000000001');
const data = await response.json();

console.log(`Deck: ${data.deck.name}`);
console.log(`Total cards: ${data.stats.totalCards}`);
```

#### Error Responses
- `400`: Invalid deck ID format
- `404`: Deck not found or inactive
- `500`: Internal server error

## Data Seeding

### Rider-Waite Deck

The system comes pre-configured with the complete 78-card Rider-Waite tarot deck:

- **22 Major Arcana cards** (0-21)
- **56 Minor Arcana cards** (14 cards × 4 suits)

### Running the Seed Script

```bash
# Seed the database with Rider-Waite deck
npm run seed:tarot

# Test the data engine
npm run test:tarot
```

### Seed Script Features

- **Idempotent**: Safe to run multiple times
- **Data Validation**: Ensures all 78 cards are inserted
- **Error Handling**: Comprehensive error reporting
- **Progress Tracking**: Real-time insertion feedback

## Frontend Integration

### Replacing Hardcoded Data

**Before (Hardcoded):**
```typescript
import { RIDER_WAITE_DECK } from './RiderWaiteDeck';

const cards = RIDER_WAITE_DECK;
```

**After (API-Driven):**
```typescript
const response = await fetch('/api/tarot/deck/00000000-0000-0000-0000-000000000001');
const { cards } = await response.json();
```

### Data Transformation

The API automatically transforms database records to match the frontend `TarotCardData` interface:

```typescript
// Database format → Frontend format
{
  name: "The Fool",
  card_number: 0,
  arcana_type: "major",
  meaning_upright: "New beginnings...",
  // ...
} 
→ 
{
  id: "0-the-fool",
  name: "The Fool",
  arcana: "major",
  meaning: {
    upright: "New beginnings...",
    // ...
  }
  // ...
}
```

## Testing

### Automated Tests

```bash
# Run comprehensive tests
npm run test:tarot
```

Tests include:
- Database connectivity
- Deck existence verification
- Card count validation (should be 78)
- API endpoint functionality
- Data transformation accuracy

### Manual Testing

```bash
# Test API endpoint directly
curl "http://localhost:3000/api/tarot/deck/00000000-0000-0000-0000-000000000001"
```

## Scalability Features

### Multiple Deck Support

The system is designed to support multiple tarot decks:

```sql
-- Add new deck
INSERT INTO decks (name, description) 
VALUES ('Thoth Tarot', 'Aleister Crowley Thoth deck');

-- Add cards for new deck
INSERT INTO cards (deck_id, name, ...) 
VALUES (new_deck_id, 'The Fool', ...);
```

### Performance Optimizations

- **Database Indexes**: Optimized queries on `deck_id`, `arcana_type`, and `suit`
- **Caching Ready**: API responses can be cached at CDN level
- **Efficient Queries**: Single query fetches all deck data

### Future Enhancements

- **Deck Management API**: CRUD operations for decks
- **Card Management API**: CRUD operations for cards
- **Image Upload**: Direct image management
- **Deck Versioning**: Support for deck updates
- **Custom Decks**: User-created deck support

## Environment Variables

```bash
# Required for database operations
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key  # For seeding only
```

## Migration Guide

### For Frontend Developers

1. **Replace imports**:
   ```typescript
   // Remove
   import { RIDER_WAITE_DECK } from './RiderWaiteDeck';
   
   // Add
   const fetchDeck = async (deckId: string) => {
     const response = await fetch(`/api/tarot/deck/${deckId}`);
     return response.json();
   };
   ```

2. **Update components** to use async data fetching
3. **Add loading states** for API calls
4. **Handle error states** for network failures

### For Backend Developers

1. **Database setup**: Run migrations in `supabase/migrations/`
2. **Seed data**: Execute `npm run seed:tarot`
3. **Test endpoints**: Run `npm run test:tarot`
4. **Deploy**: Standard Next.js deployment process

## Support

For issues or questions:
1. Check the test output: `npm run test:tarot`
2. Verify environment variables are set
3. Ensure Supabase project is active
4. Review API logs in development console
