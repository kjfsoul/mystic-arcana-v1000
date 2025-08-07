# CrewAI Tarot Deck Generation System

This directory contains the complete CrewAI orchestration system for generating themed tarot decks, specifically designed for the **Crew Tarot Deck** - a cyberpunk-mysticism interpretation of traditional tarot.

## 🎯 Overview

The Crew Tarot Deck Generation System uses four specialized AI agents working in orchestration to create a complete, validated 78-card tarot deck with technology themes:

- **Major Arcana**: 22 cards reimagined as tech archetypes (The New Developer, The AI Orchestrator, etc.)
- **Minor Arcana**: 56 cards across 4 tech suits (Servers, Networks, Code, Data)
- **Visual Theme**: Cyberpunk mysticism with bioluminescent effects and sacred digital geometry

## 🤖 Agent Architecture

### DataOracle Agent

- **Role**: Spiritual data architecture with graph databases
- **Responsibilities**:
  - Generate thematic blueprints with visual specifications
  - Store deck metadata in Supabase database
  - Manage symbolic mappings between tech and traditional tarot

### UIEnchanter Agent

- **Role**: Mystical interface design with sacred geometry
- **Responsibilities**:
  - Generate consistent AI art prompts for all 78 cards
  - Ensure visual uniformity across the deck
  - Maintain cyberpunk-mysticism aesthetic

### CardWeaver Agent

- **Role**: Adaptive tarot logic with probability algorithms
- **Responsibilities**:
  - Generate complete card data structures
  - Create meaningful interpretations for tech-themed cards
  - Handle card composition and layout algorithms

### QualityGuardian Agent

- **Role**: QA testing and spiritual ethics monitoring
- **Responsibilities**:
  - Validate complete deck structure (78 cards, proper suits, etc.)
  - Ensure spiritual integrity and ethical interpretations
  - Store validated decks in database

## 📁 File Structure

```
src/crew/
├── README.md                 # This file
├── crew-tarot-deck-spec.md  # Complete deck specification
├── agents.ts                # Agent implementations
├── runner.ts                # Orchestration system
└── tarot-deck-process.md    # Original process documentation

src/app/api/crew/
├── route.ts                 # Main API endpoint
└── logs/route.ts           # Logging and monitoring

public/tarot/deck-crew/
├── card-back.svg           # Animated card back design
├── major/                  # Major Arcana card images (22 cards)
├── servers/               # Servers suit (Wands equivalent)
├── networks/              # Networks suit (Cups equivalent)
├── code/                  # Code suit (Swords equivalent)
└── data/                  # Data suit (Pentacles equivalent)

scripts/
└── test-crew-system.ts    # Comprehensive test suite
```

## 🚀 Quick Start

### 1. Start Development Server

```bash
npm run dev
```

### 2. Generate Complete Crew Tarot Deck

```bash
# Using npm script
npm run crew:generate

# Or direct API call
curl -X POST http://localhost:3000/api/crew \
  -H 'Content-Type: application/json' \
  -d '{"task": "generateCrewTarotDeck"}'
```

### 3. Test System Health

```bash
# Run comprehensive tests
npm run test:crew

# Or check API health
curl http://localhost:3000/api/crew
```

### 4. View Operation Logs

```bash
# Recent operations
curl http://localhost:3000/api/crew/logs

# Memory logs (a_mem system)
curl http://localhost:3000/api/crew/logs?type=memory
```

## 🛠️ API Endpoints

### POST /api/crew

Execute crew tasks with JSON payload:

```json
{
  "task": "generateCrewTarotDeck",
  "params": {}
}
```

**Available Tasks:**

- `generateCrewTarotDeck`: Generate complete 78-card deck
- `validateExistingDeck`: Validate deck structure
- `healthCheck`: System health monitoring

### GET /api/crew

Health check and system information

### GET /api/crew/logs

View operation logs and monitoring data

**Query Parameters:**

- `operationId`: Get specific operation details
- `limit`: Number of operations to return (default: 10)
- `type`: `operations` or `memory` logs

## 🎨 Deck Theme Overview

### Major Arcana Transformations

- **The Fool** → **The New Developer**: Beginning tech journey
- **The Magician** → **The AI Orchestrator**: Manifesting through AI
- **The High Priestess** → **The Data Oracle**: Keeper of knowledge
- **The Tower** → **The Production Incident**: System failure response
- **The Star** → **The Open Source Project**: Community brilliance

### Minor Arcana Suits

- **Wands** → **Servers**: Infrastructure, scaling, performance
- **Cups** → **Networks**: Communication, APIs, data flow
- **Swords** → **Code**: Logic, algorithms, problem-solving
- **Pentacles** → **Data**: Databases, storage, information

## 🔍 Testing & Validation

### Automated Tests

```bash
npm run test:crew
```

Tests cover:

- Individual agent functionality
- Complete deck generation workflow
- Database integration
- Validation logic
- Error handling

### Manual Testing

```bash
# Health check
curl http://localhost:3000/api/crew

# Generate deck
curl -X POST http://localhost:3000/api/crew \
  -H 'Content-Type: application/json' \
  -d '{"task": "generateCrewTarotDeck"}'

# View results
curl http://localhost:3000/api/crew/logs?limit=1
```

## 📊 Monitoring & Logging

### A-mem System Integration

All crew operations are logged to the `a_mem` system for development tracking:

- Command execution: `A-mem/crew-operations.log`
- Operation details: `crew_memory_logs/`
- Health monitoring: Automated every 5 minutes

### Operation Logs

Each crew operation generates detailed logs including:

- Task execution times
- Success/failure status
- Agent-specific results
- Validation reports
- Error details

## 🔧 Configuration

### Environment Variables

```bash
# Required for database integration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Optional for autonomous monitoring
AUTONOMOUS_MODE=true
```

### Database Setup

The system requires these Supabase tables:

- `decks`: Deck metadata storage
- `cards`: Individual card data storage

## 🎯 Integration with Existing System

### Tarot Engine Compatibility

The Crew Tarot Deck integrates seamlessly with the existing tarot system:

- Uses `TarotCardData` interface from `TarotEngine.ts`
- Compatible with all spread layouts (single, three-card, Celtic Cross)
- Works with existing reading components
- Accessible via `DeckManager.fetchDeck('00000000-0000-0000-0000-000000000002')`

### UI Integration

Cards can be used in any existing tarot component:

```typescript
import { TarotEngine } from "@/lib/tarot/TarotEngine";

const engine = new TarotEngine({
  deckId: "00000000-0000-0000-0000-000000000002", // Crew Tarot Deck
});
```

## 🚀 Production Deployment

### Vercel Deployment

1. Set environment variables in Vercel dashboard
2. Deploy branch with crew system
3. Set up cron job for health monitoring:
   ```bash
   # vercel.json
   {
     "crons": [
       {
         "path": "/api/crew",
         "schedule": "0 */6 * * *"
       }
     ]
   }
   ```

### Health Monitoring

- Automated health checks every 5 minutes in development
- Production monitoring via Vercel cron jobs
- Detailed logging for troubleshooting
- Graceful error handling and recovery

## 📈 Performance Metrics

### Expected Performance

- **Blueprint Generation**: ~200ms
- **Prompt Generation**: ~500ms
- **Card Data Creation**: ~1000ms
- **Validation**: ~300ms
- **Database Storage**: ~800ms
- **Total Deck Generation**: ~3-5 seconds

### Scalability

- Stateless agent design
- Concurrent task execution
- Database connection pooling
- Efficient memory usage

## 🎨 Future Enhancements

### Planned Features

- **Visual Asset Generation**: Integration with AI image generation APIs
- **Multiple Themes**: Additional themed decks (Cyberpunk, Nature, Space)
- **Custom Decks**: User-generated deck themes
- **Advanced Validation**: Computer vision for visual consistency
- **Real-time Collaboration**: Multi-agent real-time deck creation

### Extension Points

- Custom agent plugins
- External AI service integration
- Advanced prompt engineering
- Dynamic theme generation
- Community deck sharing

---

## 🤝 Contributing

When working with the crew system:

1. **Follow a_mem logging**: All commands use `memlog-ma` prefix
2. **Test thoroughly**: Run `npm run test:crew` before commits
3. **Document changes**: Update this README for new features
4. **Maintain compatibility**: Ensure existing tarot system integration
5. **Validate spiritually**: Respect tarot traditions while embracing technology

## 📞 Support

For issues with the crew system:

1. Check logs: `curl http://localhost:3000/api/crew/logs`
2. Run health check: `curl http://localhost:3000/api/crew`
3. Test individual agents: `npm run test:crew`
4. Review a_mem logs: `cat A-mem/crew-operations.log`

The Crew Tarot Deck represents the fusion of ancient wisdom and modern technology, creating a bridge between spiritual insight and digital innovation. 🔮⚡
