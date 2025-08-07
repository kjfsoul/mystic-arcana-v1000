# 🃏 Tarot Data Engine

A scalable backend system that replaces hardcoded tarot card arrays with a dynamic, database-driven API.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Supabase account (free tier works)
- Environment variables configured

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository>
   cd mystic-arcana-v1000
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

3. **Run automated setup**
   ```bash
   npm run setup:tarot
   ```

That's it! The setup script will:

- ✅ Verify your environment configuration
- ✅ Test database connectivity
- ✅ Seed the database with 78 Rider-Waite cards
- ✅ Run comprehensive tests
- ✅ Confirm everything is working

## 🎯 What This Replaces

**Before (Hardcoded):**

```typescript
import { RIDER_WAITE_DECK } from "./RiderWaiteDeck";
const cards = RIDER_WAITE_DECK; // Static array of 78 cards
```

**After (API-Driven):**

```typescript
const response = await fetch(
  "/api/tarot/deck/00000000-0000-0000-0000-000000000001",
);
const { cards } = await response.json(); // Dynamic from database
```

## 🏗️ Architecture

### Database Schema

- **`decks`** table: Stores tarot deck metadata
- **`cards`** table: Stores individual card data with meanings, images, keywords
- **Row Level Security**: Public read access, admin-only writes

### API Endpoints

- **`GET /api/tarot/deck/[deckId]`**: Fetch all cards for a deck
- Returns transformed data matching frontend `TarotCardData` interface
- Includes deck info, cards array, and statistics

### Data Flow

```
Database → API Endpoint → Data Transformation → Frontend Components
```

## 📊 Features

### ✅ Complete Rider-Waite Deck

- 22 Major Arcana cards (The Fool to The World)
- 56 Minor Arcana cards (4 suits × 14 cards each)
- Upright and reversed meanings
- Keywords and descriptions
- Image URLs for all cards

### ✅ Performance Optimized

- Single database query fetches all deck data
- Response caching headers (1 hour cache)
- Efficient database indexes
- Response time logging

### ✅ Error Handling

- Comprehensive error messages with codes
- Request/response logging
- Graceful fallbacks
- Detailed error context

### ✅ Type Safety

- Full TypeScript support
- Database types auto-generated
- Frontend interface compatibility
- Compile-time validation

## 🧪 Testing

### Automated Tests

```bash
npm run test:tarot
```

Tests verify:

- Database connectivity
- Deck existence (Rider-Waite)
- Card count (should be 78)
- API endpoint functionality
- Data transformation accuracy

### Manual Testing

```bash
# Start development server
npm run dev

# Test API endpoint
curl "http://localhost:3000/api/tarot/deck/00000000-0000-0000-0000-000000000001"
```

## 🔧 Scripts

| Script                | Purpose                  |
| --------------------- | ------------------------ |
| `npm run setup:tarot` | Complete automated setup |
| `npm run seed:tarot`  | Seed database with cards |
| `npm run test:tarot`  | Run verification tests   |

## 📈 Scalability

### Multiple Deck Support

The system supports unlimited tarot decks:

```sql
-- Add new deck
INSERT INTO decks (name, description) VALUES ('Thoth Tarot', 'Crowley deck');

-- Add cards for new deck
INSERT INTO cards (deck_id, name, ...) VALUES (new_deck_id, ...);
```

### Future Enhancements

- 🔮 Deck management API (CRUD operations)
- 🎨 Image upload and management
- 👤 User-created custom decks
- 📱 Mobile-optimized responses
- 🌐 Multi-language support

## 🔒 Security

- **Row Level Security (RLS)** enabled
- **Public read access** for deck/card data
- **Admin-only writes** via service role
- **Input validation** on all endpoints
- **SQL injection protection** via Supabase

## 🚨 Troubleshooting

### Environment Issues

```bash
# Check if .env.local exists and has required variables
cat .env.local

# Verify Supabase connection
npm run test:tarot
```

### Database Issues

```bash
# Check if tables exist
npx supabase db push

# Re-seed database
npm run seed:tarot
```

### API Issues

```bash
# Check development server logs
npm run dev

# Test endpoint directly
curl -v "http://localhost:3000/api/tarot/deck/00000000-0000-0000-0000-000000000001"
```

## 📚 Documentation

- **[Complete API Documentation](docs/tarot-data-engine.md)**
- **[Database Schema](supabase/migrations/002_tarot_schema.sql)**
- **[Frontend Integration Guide](docs/tarot-data-engine.md#frontend-integration)**

## 🤝 Contributing

### Adding New Decks

1. Insert deck record in `decks` table
2. Add cards with proper `deck_id` reference
3. Update tests to include new deck
4. Document the new deck

### Modifying Card Data

1. Update via database (preserves data integrity)
2. Use admin client for bulk operations
3. Test changes with `npm run test:tarot`
4. Update documentation if schema changes

## 📄 License

Part of the Mystic Arcana project. See main project license.

---

**Need help?** Run `npm run setup:tarot` for automated setup and diagnostics.
