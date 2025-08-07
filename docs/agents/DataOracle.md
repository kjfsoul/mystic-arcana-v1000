# DataOracle Agent Documentation

## Overview

The **DataOracle Agent** is the master of automated knowledge graph construction for Mystic Arcana. It embodies the archetype of the omniscient librarian, capable of harvesting wisdom from digital sources and structuring it into interconnected understanding that powers personalized mystical experiences.

## Architecture

### Agent Hierarchy

```
DataOracle (Coordinator)
├── TarotSourceIngestor (Specialist)
├── KnowledgeGraphPopulator (Analyst)
├── DataQualityValidator (Optimizer)
└── VectorEmbeddingEngine (Specialist)
```

### Core Purpose

- **Automated Data Ingestion**: Harvest content from expert tarot sources
- **Knowledge Graph Construction**: Build interconnected concept networks
- **Quality Validation**: Ensure data integrity and reliability
- **Explainable AI**: Provide transparent reasoning lineage
- **Semantic Search**: Enable intelligent content discovery

## Features

### 🔮 Automated Knowledge Harvesting

- Ethical web scraping with robots.txt compliance
- Rate limiting and respectful crawling practices
- Multi-source content aggregation
- Real-time quality assessment

### 🧠 Knowledge Graph Construction

- **6 Core Tables**: Sources, Concepts, Interpretations, Relationships, Syntheses, Lineage
- **Semantic Relationships**: Automatic relationship discovery
- **Multi-source Synthesis**: Intelligent meaning combination
- **Vector Embeddings**: Semantic search capabilities

### ✅ Quality Assurance

- Data deduplication and validation
- Source authority weighting
- Completeness scoring (0-10 scale)
- Error tracking and reporting

### 📜 Explainable AI

- Complete reasoning lineage tracking
- Decision point documentation
- Source attribution and weights
- Uncertainty area identification

## Knowledge Graph Schema

### Core Tables

#### kg_sources

- **Purpose**: Authoritative record of knowledge origins
- **Key Fields**: name, source_type, authority_level, reliability_score
- **Authority Levels**: 1-10 (10 = highest authority)

#### kg_concepts

- **Purpose**: Universal mystical entities (cards, planets, etc.)
- **Key Fields**: name, concept_type, canonical_name, archetypal_energy
- **Concept Types**: tarot_card, planet, sign, house, aspect, element

#### kg_interpretations

- **Purpose**: Source-specific meanings and contexts
- **Key Fields**: primary_meaning, context_type, personalization_triggers
- **Context Types**: upright, reversed, love, career, spiritual, etc.

#### kg_concept_relationships

- **Purpose**: Define how concepts relate to each other
- **Relationship Types**: strengthens, weakens, opposes, complements, etc.
- **Directionality**: bidirectional, unidirectional

#### kg_interpretation_synthesis

- **Purpose**: Combine interpretations from multiple sources
- **Key Fields**: unified_meaning, confidence_level, source_conflicts

#### kg_interpretation_lineage

- **Purpose**: Complete reasoning chain for transparency
- **Key Fields**: reasoning_steps, decision_points, key_evidence

## Usage

### Basic Operations

```typescript
import { DataOracleAgent } from "@/agents/DataOracle";

// Initialize agent
const dataOracle = new DataOracleAgent();

// Check health
const isHealthy = await dataOracle.healthCheck();

// Get status
const status = await dataOracle.getStatus();
console.log(`KG contains ${status.knowledgeGraph.concepts} concepts`);
```

### Complete Ingestion Pipeline

```typescript
// Run full ingestion with all features
const metrics = await dataOracle.orchestrateIngestion({
  include_relationships: true,
  generate_syntheses: true,
  create_lineage: true,
});

console.log(`Created ${metrics.concepts_created} concepts`);
console.log(`Quality score: ${metrics.data_quality_score}/10`);
```

### Targeted Ingestion

```typescript
// Ingest specific sources only
const metrics = await dataOracle.runTargetedIngestion({
  sources: ["Biddy Tarot", "Golden Dawn Tradition"],
  includeRelationships: true,
  generateSyntheses: false,
});
```

### Knowledge Graph Search

```typescript
// Semantic search
const results = await dataOracle.searchKnowledgeGraph("transformation", {
  conceptTypes: ["tarot_card"],
  contextTypes: ["spiritual"],
  minQualityScore: 7.0,
  includeRelationships: true,
  limit: 10,
});

// Get detailed concept information
const concept = await dataOracle.getConceptDetails(results[0].id);
```

## NPM Scripts

### Activation & Management

```bash
# Activate DataOracle and run initial ingestion
npm run oracle:activate

# Check current status
npm run oracle:status

# Run ingestion pipeline
npm run oracle:ingest

# Search knowledge graph
npm run oracle:search "fool"

# Run tests
npm run test:oracle
```

## Web Scraping Module

### DataOracleWebScraper

The web scraping module provides ethical, rate-limited content extraction:

#### Supported Sources

- **Biddy Tarot**: Comprehensive card interpretations
- **Labyrinthos Academy**: Modern educational content
- **Additional sources**: Extensible for more providers

#### Ethical Practices

- Robots.txt compliance checking
- Configurable rate limiting (default: 2s between requests)
- Retry logic with exponential backoff
- Request timeout handling
- User-Agent identification

#### Content Extraction

```typescript
import DataOracleWebScraper from "@/agents/DataOracle-WebScraper";

const scraper = new DataOracleWebScraper({
  rateLimitDelay: 2000,
  maxRetries: 3,
  respectRobotsTxt: true,
});

// Generate URLs for major arcana
const urls = scraper.generateBiddyTarotUrls();

// Scrape content (respects rate limits)
const results = await scraper.scrapeBiddyTarot(urls);
```

## Expert Sources

### Pre-configured Authoritative Sources

1. **Biddy Tarot** (Authority: 9/10)
   - Comprehensive interpretations by Brigit Esselmont
   - Multiple contexts (upright, reversed, love, career)
   - High consistency and reliability

2. **Labyrinthos Academy** (Authority: 8/10)
   - Modern educational approach
   - Visual learning integration
   - Consistent methodology

3. **Golden Dawn Tradition** (Authority: 10/10)
   - Classical Western esoteric foundation
   - Historical authority
   - Core symbolic interpretations

4. **Rider-Waite-Smith Tradition** (Authority: 10/10)
   - Foundational tarot system
   - Universal symbol set
   - Public domain content

5. **Thirteen Ways** (Authority: 7/10)
   - Alternative interpretations
   - Creative perspectives
   - Complementary viewpoints

## Data Quality Metrics

### Quality Scoring (0-10 scale)

#### Content Quality Indicators

- **Length**: Substantial content (>500 words)
- **Structure**: Clear meaning sections
- **Keywords**: Rich tarot terminology
- **Completeness**: Multiple contexts covered
- **Authority**: Source credibility rating

#### Concept Completeness Validation

```sql
-- Automated quality calculation
SELECT validate_concept_completeness('concept-id');
-- Returns: 0.00-10.00 based on:
-- - Core data presence (2.0 points)
-- - Canonical naming (1.0 point)
-- - Keywords richness (1.0 point)
-- - Archetypal energy (1.0 point)
-- - Interpretation count (up to 3.0 points)
-- - Relationship count (up to 2.0 points)
```

### Error Handling & Monitoring

#### Comprehensive Error Tracking

```typescript
interface IngestionMetrics {
  errors_encountered: number;
  error_details: Array<{
    error_type: string;
    error_message: string;
    context: Record<string, any>;
    timestamp: Date;
  }>;
}
```

#### Common Error Types

- **Network Errors**: Connection timeouts, DNS failures
- **Parsing Errors**: Invalid HTML structure, missing content
- **Database Errors**: Constraint violations, connection issues
- **Rate Limiting**: API limits exceeded
- **Quality Failures**: Content below threshold

## Performance Characteristics

### Benchmarks

- **Initial Ingestion**: ~22 Major Arcana concepts in <30 seconds
- **Relationship Generation**: ~100+ relationships created
- **Search Performance**: <1 second for semantic queries
- **Memory Usage**: ~50MB for complete knowledge graph
- **Concurrent Operations**: Supports parallel searches

### Scalability Features

- **Batch Processing**: Configurable batch sizes
- **Rate Limiting**: Respectful crawling speeds
- **Connection Pooling**: Efficient database usage
- **Vector Indexing**: Fast semantic search
- **Caching**: Reduced API calls

## Integration Points

### Sophia Agent Integration

```typescript
// DataOracle provides structured data to Sophia
const interpretations = await dataOracle.searchKnowledgeGraph(cardName, {
  conceptTypes: ["tarot_card"],
  contextTypes: [spreadContext],
});

// Sophia uses this for personalized readings
const reading = await sophia.getReading(cards, spreadType, context);
```

### PersonaLearner Integration

```typescript
// PersonaLearner stores user preferences
const userMemories = await personaLearner.retrieveUserMemories(userId);

// DataOracle uses memories for targeted searches
const relevantConcepts = await dataOracle.searchKnowledgeGraph(query, {
  personalizeFor: userMemories,
});
```

## Future Enhancements

### Planned Features

- **Auto-scheduling**: Periodic ingestion jobs
- **ML Enhancement**: AI-powered relationship discovery
- **Multi-language**: International source support
- **Real-time Updates**: Live content monitoring
- **API Integration**: Direct provider APIs

### Expansion Opportunities

- **Astrology Sources**: Planetary interpretation ingestion
- **Numerology**: Number meaning databases
- **Crystal Healing**: Gemstone property databases
- **Dream Interpretation**: Symbol meaning collections

## Security & Privacy

### Data Handling

- **Attribution Required**: All sources properly credited
- **Usage Rights**: Educational research compliance
- **Rate Limiting**: Respectful of source servers
- **Content Filtering**: Quality thresholds maintained

### Privacy Protection

- **No Personal Data**: Only mystical content ingested
- **Anonymized Usage**: No user tracking in scraping
- **Secure Storage**: Encrypted database connections
- **Audit Trails**: Complete operation logging

## Troubleshooting

### Common Issues

#### Database Connection Errors

```bash
# Check Supabase status
npm run supabase:start

# Verify connection
npm run oracle:status
```

#### Ingestion Failures

```bash
# Check detailed error logs
npm run oracle:activate

# Run targeted ingestion
npm run oracle:ingest
```

#### Low Quality Scores

- Verify source accessibility
- Check content extraction rules
- Review quality thresholds
- Validate database constraints

### Debug Commands

```bash
# Verbose logging
DEBUG=dataoracle* npm run oracle:activate

# Test specific components
npm run test:oracle

# Health check
npm run oracle:status
```

## Contributing

### Adding New Sources

1. Update `initializeExpertSources()` in DataOracle.ts
2. Add parsing logic to DataOracle-WebScraper.ts
3. Create URL generation method
4. Add quality validation rules
5. Update tests and documentation

### Extending Knowledge Graph

1. Design new table schema
2. Update migration files
3. Add TypeScript interfaces
4. Implement population logic
5. Create search integration

---

_The DataOracle Agent represents the culmination of automated knowledge management, bringing together the wisdom of ages with the precision of modern AI to create a foundation for truly personalized mystical experiences._
