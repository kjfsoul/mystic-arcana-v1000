# Data Ingestion System Technical Specification

## Overview

This document outlines the technical specification for implementing a Python-based data ingestion system for Mystic Arcana. The system will leverage BeautifulSoup, Requests, youtube-transcript-api, and spaCy to ingest content from various sources and structure it for use in Supabase caching and Neo4j graph data storage.

## System Architecture

### Current Architecture Analysis

The existing Mystic Arcana system includes:

1. **Frontend**: Next.js/TypeScript application with tarot reading capabilities
2. **Backend**: Node.js/Python hybrid with FastAPI components
3. **Database**: Supabase (PostgreSQL) with RLS security
4. **Agents**: Existing TypeScript agents including DataOracle for knowledge graph construction
5. **Memory System**: A-mem agentic memory system with ChromaDB vector storage
6. **MCP Integration**: Claude-flow coordination system for agent orchestration

### Proposed Data Ingestion Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│  Data Sources   │───▶│  Python Ingestor │───▶│  Knowledge Graph    │
│ (Web, YouTube,  │    │  (BeautifulSoup, │    │  (Supabase/Neo4j)   │
│  APIs, Files)   │    │  youtube-transcript-api, spacy) │          │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
                              │                         │
                              ▼                         ▼
                    ┌──────────────────┐    ┌─────────────────────┐
                    │   JSON Cache     │    │   Agent Context     │
                    │  (Supabase)      │    │   (Session Utils)   │
                    └──────────────────┘    └─────────────────────┘
```

## Directory Structure

Based on the existing project structure, the data ingestion system will be implemented in:

```
.
├── agents/
│   └── data_ingestion/          # New directory for data ingestion agents
│       ├── __init__.py
│       ├── web_scraper.py       # BeautifulSoup-based web scraping
│       ├── youtube_processor.py # YouTube transcript processing
│       ├── content_processor.py # spaCy-based NLP processing
│       ├── data_validator.py    # Quality validation and cleaning
│       └── ingestion_pipeline.py # Orchestration pipeline
├── kg/                          # New directory for knowledge graph components
│   ├── __init__.py
│   ├── graph_builder.py         # Neo4j graph construction
│   ├── entity_extractor.py     # Entity and relationship extraction
│   └── graph_validator.py       # Graph data validation
└── backend/
    └── agents/
        └── data_ingestion_agent.py # Integration with existing agent framework
```

## Core Components

### 1. Web Scraper (web_scraper.py)

**Purpose**: Ethical web scraping with BeautifulSoup for content extraction

**Dependencies**:

- `requests` - HTTP client
- `beautifulsoup4` - HTML/XML parsing
- `lxml` - Fast XML/HTML parser

**Features**:

- Rate limiting and respectful crawling
- Robots.txt compliance
- Multiple parsing strategies
- Content quality assessment
- Error handling and retry logic

**Example Interface**:

```python
class WebScraper:
    def __init__(self, rate_limit_delay=2.0, respect_robots_txt=True):
        self.rate_limit_delay = rate_limit_delay
        self.respect_robots_txt = respect_robots_txt
        self.session = requests.Session()

    def scrape_url(self, url: str) -> Dict[str, Any]:
        """Scrape content from a URL using BeautifulSoup"""
        # Implementation details...

    def scrape_multiple(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Scrape multiple URLs with rate limiting"""
        # Implementation details...
```

### 2. YouTube Processor (youtube_processor.py)

**Purpose**: Extract transcripts from YouTube videos using youtube-transcript-api

**Dependencies**:

- `youtube-transcript-api` - YouTube transcript extraction
- `requests` - HTTP client for video metadata

**Features**:

- Automatic transcript language detection
- Manual and generated transcript support
- Video metadata extraction
- Transcript chunking for long videos

**Example Interface**:

```python
class YouTubeProcessor:
    def __init__(self):
        pass

    def get_transcript(self, video_id: str) -> List[Dict[str, Any]]:
        """Get transcript for a YouTube video"""
        # Implementation details...

    def get_video_metadata(self, video_id: str) -> Dict[str, Any]:
        """Get metadata for a YouTube video"""
        # Implementation details...
```

### 3. Content Processor (content_processor.py)

**Purpose**: Natural language processing using spaCy for entity extraction and content analysis

**Dependencies**:

- `spacy` - Industrial-strength NLP
- `spacy-models` - Language models (en_core_web_sm, en_core_web_md, etc.)

**Features**:

- Named Entity Recognition (NER)
- Part-of-speech tagging
- Dependency parsing
- Text summarization
- Keyword extraction
- Sentiment analysis

**Example Interface**:

```python
class ContentProcessor:
    def __init__(self, model_name="en_core_web_sm"):
        self.nlp = spacy.load(model_name)

    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text"""
        # Implementation details...

    def extract_keywords(self, text: str, num_keywords: int = 10) -> List[str]:
        """Extract important keywords from text"""
        # Implementation details...

    def summarize(self, text: str, ratio: float = 0.3) -> str:
        """Generate text summary"""
        # Implementation details...
```

### 4. Data Validator (data_validator.py)

**Purpose**: Quality validation and data cleaning for ingested content

**Features**:

- Content quality scoring
- Duplicate detection
- Data format validation
- Completeness checking
- Error reporting

**Example Interface**:

```python
class DataValidator:
    def __init__(self):
        pass

    def validate_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content quality and completeness"""
        # Implementation details...

    def check_duplicates(self, content: Dict[str, Any], existing_data: List[Dict[str, Any]]) -> bool:
        """Check if content is a duplicate"""
        # Implementation details...
```

### 5. Ingestion Pipeline (ingestion_pipeline.py)

**Purpose**: Orchestrate the complete data ingestion workflow

**Features**:

- Multi-source ingestion coordination
- Error handling and recovery
- Progress tracking and monitoring
- Batch processing capabilities
- Integration with existing agents

**Example Interface**:

```python
class IngestionPipeline:
    def __init__(self):
        self.web_scraper = WebScraper()
        self.youtube_processor = YouTubeProcessor()
        self.content_processor = ContentProcessor()
        self.validator = DataValidator()

    def ingest_source(self, source_config: Dict[str, Any]) -> Dict[str, Any]:
        """Ingest data from a specific source"""
        # Implementation details...

    def process_content(self, raw_content: Dict[str, Any]) -> Dict[str, Any]:
        """Process raw content through the pipeline"""
        # Implementation details...
```

## Knowledge Graph Integration

### Graph Builder (graph_builder.py)

**Purpose**: Construct and maintain Neo4j graph database

**Dependencies**:

- `neo4j` - Official Neo4j driver
- `py2neo` - Python client for Neo4j (optional)

**Features**:

- Node and relationship creation
- Graph schema management
- Batch operations for performance
- Conflict resolution
- Index management

**Example Interface**:

```python
class GraphBuilder:
    def __init__(self, uri: str, username: str, password: str):
        self.driver = GraphDatabase.driver(uri, auth=(username, password))

    def create_entity(self, entity_data: Dict[str, Any]) -> str:
        """Create entity node in graph"""
        # Implementation details...

    def create_relationship(self, source_id: str, target_id: str, relationship_type: str, properties: Dict[str, Any] = None):
        """Create relationship between entities"""
        # Implementation details...
```

### Entity Extractor (entity_extractor.py)

**Purpose**: Extract entities and relationships from processed content

**Features**:

- Entity linking to existing knowledge base
- Relationship type classification
- Confidence scoring
- Context-aware extraction

**Example Interface**:

```python
class EntityExtractor:
    def __init__(self):
        pass

    def extract_entities_and_relationships(self, processed_content: Dict[str, Any]) -> Dict[str, Any]:
        """Extract entities and relationships from processed content"""
        # Implementation details...
```

## Integration Points

### 1. JSON Output for Supabase Caching

The system will generate JSON output compatible with existing Supabase caching mechanisms:

```python
{
    "id": "unique_content_id",
    "source": "youtube_video|web_page|api",
    "source_id": "video_id_or_url",
    "title": "Content Title",
    "content": "Processed content text",
    "entities": [
        {
            "type": "PERSON|ORG|GPE|etc.",
            "text": "Entity text",
            "start": 0,
            "end": 10
        }
    ],
    "keywords": ["keyword1", "keyword2"],
    "summary": "Content summary",
    "metadata": {
        "ingested_at": "2025-08-07T12:00:00Z",
        "quality_score": 8.5,
        "language": "en"
    }
}
```

### 2. Neo4j Graph Data Output

The system will create graph structures in Neo4j:

```
(:Content {id, title, source})-[:MENTIONS]->(:Entity {name, type})
(:Entity)-[:RELATED_TO]->(:Entity)
(:Content)-[:HAS_KEYWORD]->(:Keyword {text})
```

### 3. Session Utilities Integration

Integration with existing session utilities for agent/LLM context reading:

```python
# Integration with memoryLogger.ts equivalent in Python
class SessionContextManager:
    def __init__(self):
        pass

    def get_user_context(self, user_id: str) -> Dict[str, Any]:
        """Get user context for personalized ingestion"""
        # Implementation details...

    def log_interaction(self, interaction_data: Dict[str, Any]) -> None:
        """Log ingestion interaction for learning"""
        # Implementation details...
```

## Logging and Memory Synchronization

### A-Mem Integration

The system will integrate with the existing A-mem agentic memory system:

```python
class MemorySync:
    def __init__(self):
        pass

    def sync_to_a_mem(self, content_data: Dict[str, Any]) -> str:
        """Sync processed content to A-mem system"""
        # Implementation details...

    def get_memory_context(self, query: str) -> Dict[str, Any]:
        """Get relevant memory context for ingestion"""
        # Implementation details...
```

### Claude.md Integration

The system will maintain compatibility with existing logging requirements:

```python
class ClaudeLogger:
    def __init__(self):
        pass

    def log_operation(self, operation: str, details: Dict[str, Any]) -> None:
        """Log operation for Claude.md compliance"""
        # Implementation details...
```

## Requirements Implementation

### Python Dependencies

Create `requirements-data-ingestion.txt`:

```txt
beautifulsoup4>=4.12.0
requests>=2.31.0
youtube-transcript-api>=0.6.1
spacy>=3.7.0
neo4j>=5.12.0
lxml>=4.9.0
pydantic>=2.0.0
```

### Environment Variables

```bash
# Web scraping configuration
SCRAPER_RATE_LIMIT_DELAY=2.0
SCRAPER_RESPECT_ROBOTS_TXT=true

# YouTube API (if needed)
YOUTUBE_API_KEY=your_api_key_here

# Neo4j configuration
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password

# spaCy model
SPACY_MODEL=en_core_web_sm
```

## Deployment and Operations

### Installation

```bash
# Install Python dependencies
pip install -r requirements-data-ingestion.txt

# Install spaCy model
python -m spacy download en_core_web_sm

# Install Neo4j (if running locally)
# Follow Neo4j installation guide
```

### Running the System

```bash
# Run ingestion pipeline
python -m agents.data_ingestion.ingestion_pipeline --config config.json

# Run specific source ingestion
python -m agents.data_ingestion.ingestion_pipeline --source youtube --source-id VIDEO_ID

# Validate data quality
python -m agents.data_ingestion.data_validator --check-all
```

### Monitoring and Maintenance

- Regular quality score monitoring
- Duplicate detection and cleanup
- Performance optimization for large datasets
- Error rate tracking and alerting

## Security and Compliance

### Data Handling

- Respect robots.txt and rate limits
- Proper attribution for all sources
- Compliance with copyright and fair use
- Secure storage of credentials
- Privacy protection for user data

### Access Control

- Role-based access to ingestion system
- Audit logging for all operations
- Secure API endpoints
- Data encryption at rest and in transit

## Future Enhancements

### Scalability Features

- Distributed processing with Celery or similar
- Streaming data processing with Apache Kafka
- Cloud storage integration (S3, GCS)
- Containerization with Docker

### Advanced Features

- Real-time content monitoring
- Multi-language support
- Advanced NLP with transformers
- Automated quality improvement
- Integration with more data sources

## Testing Strategy

### Unit Tests

- Individual component testing
- Data validation tests
- Error handling tests
- Performance benchmarks

### Integration Tests

- End-to-end ingestion workflows
- Database integration tests
- API integration tests
- Cross-component interaction tests

### Monitoring Tests

- Quality score validation
- Duplicate detection verification
- Performance regression tests
- Security compliance checks

## Conclusion

This technical specification provides a comprehensive framework for implementing a Python-based data ingestion system that integrates seamlessly with the existing Mystic Arcana architecture. The system leverages industry-standard libraries for web scraping, content processing, and graph database integration while maintaining compatibility with existing agents and memory systems.
