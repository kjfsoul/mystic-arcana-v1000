# Data Ingestion Modules

This package provides Python modules for ingesting tarot, astrology, and psychology data from web sources and YouTube videos.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Modules](#modules)
  - [Web Scraping](#web-scraping)
  - [YouTube Processing](#youtube-processing)
  - [Content Processing](#content-processing)
  - [Data Validation](#data-validation)
- [Usage Examples](#usage-examples)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Integration with Other Agents](#integration-with-other-agents)

## Overview

The data ingestion system consists of modular Python components designed to extract, process, and validate data from various sources:

- **Web Scraping**: Extract structured data from tarot, astrology, and psychology websites
- **YouTube Processing**: Fetch and analyze YouTube video transcripts
- **Content Processing**: Apply NLP techniques for entity extraction and summarization
- **Data Validation**: Ensure data quality and consistency

## Installation

Install required dependencies:

```bash
pip install -r requirements-data-ingestion.txt
```

For full NLP capabilities, install spaCy language model:

```bash
python -m spacy download en_core_web_sm
```

## Modules

### Web Scraping

#### WebScraper

Base web scraper with rate limiting and error handling.

```python
from agents.data_ingestion import scraper

# Initialize with custom settings
web_scraper = scraper.WebScraper(rate_limit_delay=1.0, respect_robots_txt=True)

# Scrape a single URL
result = web_scraper.scrape_url("https://example.com/article")

# Scrape multiple URLs
urls = ["https://site1.com", "https://site2.com"]
results = web_scraper.scrape_multiple(urls)
```

#### TarotScraper

Specialized scraper for tarot card meanings and interpretations.

```python
from agents.data_ingestion import scraper

tarot_scraper = scraper.TarotScraper()

# Get tarot card information structure
card_data = tarot_scraper.scrape_tarot_card("The Fool")
# Returns: {'card_name': 'The Fool', 'type': 'tarot_card', ...}

# Get tarot spread information
spread_data = tarot_scraper.scrape_tarot_spread("Celtic Cross")
```

#### AstrologyScraper

Specialized scraper for astrological data.

```python
from agents.data_ingestion import scraper

astrology_scraper = scraper.AstrologyScraper()

# Get zodiac sign information
sign_data = astrology_scraper.scrape_zodiac_sign("Aries")
# Returns: {'sign_name': 'Aries', 'type': 'zodiac_sign', ...}

# Get planetary information
planet_data = astrology_scraper.scrape_planet_info("Mars")
```

#### PsychologyScraper

Specialized scraper for psychology concepts.

```python
from agents.data_ingestion import scraper

psychology_scraper = scraper.PsychologyScraper()

# Get psychology concept information
concept_data = psychology_scraper.scrape_psychology_concept("Archetype")
# Returns: {'concept_name': 'Archetype', 'type': 'psychology_concept', ...}

# Get psychological theory information
theory_data = psychology_scraper.scrape_theory_info("Jungian Psychology")
```

### YouTube Processing

#### YouTubeProcessor

Extracts transcripts and metadata from YouTube videos.

```python
from agents.data_ingestion import youtube_processor

youtube_proc = youtube_processor.YouTubeProcessor()

# Get video transcript
transcript = youtube_proc.get_transcript("video_id_here", languages=['en'])

# Get video metadata
metadata = youtube_proc.get_video_metadata("video_id_here")

# Extract relevant segments
keywords = ["tarot", "astrology", "psychology"]
relevant_segments = youtube_proc.extract_relevant_segments(transcript, keywords)

# Get available transcripts information
available = youtube_proc.get_available_transcripts("video_id_here")
```

### Content Processing

#### ContentProcessor

Applies NLP techniques for text analysis (requires spaCy).

```python
from agents.data_ingestion import content_processor

# Initialize processor (handles missing spaCy gracefully)
processor = content_processor.ContentProcessor()

# Clean and preprocess text
clean_text = processor.clean_text("  Dirty\ttext\nwith\rwhitespace  ")

# Extract named entities
entities = processor.extract_entities("The Fool represents new beginnings in tarot.")

# Extract keywords
keywords = processor.extract_keywords("Archetype theory in Jungian psychology.")

# Generate summary
summary = processor.summarize("Long text about tarot card meanings and interpretations.")
```

### Data Validation

#### DataValidator

Ensures data quality and consistency.

```python
from agents.data_ingestion import data_validator

validator = data_validator.DataValidator()

# Validate content quality
content = {
    'title': 'The Fool Card Meaning',
    'content': 'The Fool represents new beginnings...',
    'source': 'tarot_dictionary'
}
validation_result = validator.validate_content(content)

# Check for duplicates
existing_data = [content]
is_duplicate = validator.check_duplicates(content, existing_data)

# Clean and normalize data
cleaned_content = validator.clean_and_normalize(content)
```

## Usage Examples

### End-to-End Tarot Data Ingestion

```python
from agents.data_ingestion import scraper, data_validator, utils

# 1. Scrape tarot data
tarot_scraper = scraper.TarotScraper()
card_data = tarot_scraper.scrape_tarot_card("The Fool")

# 2. Validate data
validator = data_validator.DataValidator()
validation_result = validator.validate_content({
    'title': card_data['card_name'],
    'content': f"Upright: {card_data['upright_meaning']}. Reversed: {card_data['reversed_meaning']}",
    'source': 'tarot_scraper'
})

# 3. Save structured data
if validation_result['is_valid']:
    output_file = f"tarot_{card_data['card_name'].lower().replace(' ', '_')}.json"
    utils.save_json_data(card_data, output_file)
    print(f"Saved tarot data to {output_file}")
```

### YouTube Transcript Analysis

```python
from agents.data_ingestion import youtube_processor, content_processor

# 1. Get YouTube transcript
youtube_proc = youtube_processor.YouTubeProcessor()
transcript = youtube_proc.get_transcript("video_id_here")

# 2. Process content
processor = content_processor.ContentProcessor()
full_text = " ".join([seg['text'] for seg in transcript])
keywords = processor.extract_keywords(full_text)
summary = processor.summarize(full_text)

# 3. Extract relevant segments
relevant_segments = youtube_proc.extract_relevant_segments(transcript, ["tarot", "reading"])
```

### Batch Processing Pipeline

```python
from agents.data_ingestion import scraper, data_validator, utils
import json

def process_sources(sources):
    """Process multiple data sources and save results."""
    results = []

    for source_type, urls in sources.items():
        print(f"Processing {source_type} sources...")

        # Initialize appropriate scraper
        if source_type == 'tarot':
            scraper_instance = scraper.TarotScraper()
        elif source_type == 'astrology':
            scraper_instance = scraper.AstrologyScraper()
        elif source_type == 'psychology':
            scraper_instance = scraper.PsychologyScraper()
        else:
            scraper_instance = scraper.WebScraper()

        # Process each URL
        for url in urls:
            try:
                # Scrape data
                scraped_data = scraper_instance.scrape_url(url)

                # Validate data
                validator = data_validator.DataValidator()
                validation_result = validator.validate_content(scraped_data)

                # Save valid data
                if validation_result['is_valid']:
                    filename = f"{source_type}_{utils.generate_content_id(scraped_data)}.json"
                    utils.save_json_data(scraped_data, filename)
                    results.append({
                        'source': source_type,
                        'url': url,
                        'file': filename,
                        'quality_score': validation_result['quality_score']
                    })

            except Exception as e:
                print(f"Error processing {url}: {e}")

    # Save processing results
    with open('processing_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    return results

# Example usage
sources = {
    'tarot': ['https://example.com/tarot/major-arcana'],
    'astrology': ['https://example.com/astrology/zodiac-signs'],
    'psychology': ['https://example.com/psychology/archetypes']
}

results = process_sources(sources)
print(f"Processed {len(results)} sources successfully")
```

## Configuration

The system uses environment variables for configuration. Create a `.env` file:

```bash
# Web scraping
SCRAPER_RATE_LIMIT_DELAY=2.0
SCRAPER_RESPECT_ROBOTS_TXT=true
SCRAPER_MAX_RETRIES=3
SCRAPER_TIMEOUT=30

# YouTube API
YOUTUBE_API_KEY=your_api_key_here
YOUTUBE_MAX_RESULTS=50

# Neo4j database
NEO4J_URI=bolt://localhost:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=password
NEO4J_DATABASE=neo4j

# spaCy
SPACY_MODEL=en_core_web_sm
SPACY_MAX_LENGTH=1000000

# Data validation
MIN_CONTENT_LENGTH=10
MAX_CONTENT_LENGTH=100000
QUALITY_THRESHOLD=3.0

# File I/O
DATA_DIRECTORY=./data
BACKUP_DIRECTORY=./backups
MAX_FILE_SIZE=10485760

# Logging
LOG_LEVEL=INFO
LOG_FILE=./logs/data_ingestion.log
```

## Error Handling

All modules include comprehensive error handling:

```python
from agents.data_ingestion import scraper

try:
    web_scraper = scraper.WebScraper()
    result = web_scraper.scrape_url("https://example.com")

    if 'error' in result:
        print(f"Scraping error: {result['error']}")
    else:
        print(f"Successfully scraped: {result['title']}")

except Exception as e:
    print(f"Unexpected error: {e}")
```

## Testing

Run integration tests:

```bash
cd agents/data_ingestion
python run_data_ingestion.py
```

This will generate log files and sample JSON output demonstrating all functionality.

## Integration with Other Agents

### CLI Usage

```bash
# Run integration tests
python run_data_ingestion.py

# Process specific sources
python -c "
from agents.data_ingestion import scraper
s = scraper.TarotScraper()
print(s.scrape_tarot_card('The Fool'))
"
```

### HTTP Endpoint Integration

The modules can be integrated into web services:

```python
from flask import Flask, jsonify
from agents.data_ingestion import scraper

app = Flask(__name__)

@app.route('/api/tarot/<card_name>')
def get_tarot_card(card_name):
    scraper_instance = scraper.TarotScraper()
    card_data = scraper_instance.scrape_tarot_card(card_name)
    return jsonify(card_data)

if __name__ == '__main__':
    app.run(debug=True)
```

### Direct Python Import

All modules are designed for direct import and use:

```python
# In any Python script or agent
from agents.data_ingestion import (
    scraper,
    youtube_processor,
    content_processor,
    data_validator,
    utils
)

# Use any functionality directly
tarot_data = scraper.TarotScraper().scrape_tarot_card("The Magician")
```

## Extending the Modules

### Adding New Scrapers

```python
# Create custom scraper by extending WebScraper
from agents.data_ingestion.scraper import WebScraper

class CustomScraper(WebScraper):
    def scrape_custom_data(self, url):
        # Custom scraping logic
        result = self.scrape_url(url)
        # Process result for custom needs
        return result
```

### Adding New Validation Rules

```python
# Extend DataValidator with custom rules
from agents.data_ingestion.data_validator import DataValidator

class CustomValidator(DataValidator):
    def validate_custom_rules(self, content):
        # Add custom validation logic
        return super().validate_content(content)
```

## Sample Output Files

The system generates structured JSON files:

```json
{
  "card_name": "The Fool",
  "type": "tarot_card",
  "upright_meaning": "New beginnings, innocence, spontaneity",
  "reversed_meaning": "Recklessness, risk-taking, inconsiderate",
  "keywords": ["beginnings", "innocence", "potential"],
  "astrology": "Uranus",
  "element": "Air",
  "archetype": "The Innocent",
  "timestamp": "2025-08-07T16:35:00Z"
}
```

## Troubleshooting

### Common Issues

1. **spaCy not installed**: The system gracefully handles missing spaCy
2. **Network errors**: Built-in retry mechanisms and error handling
3. **Invalid URLs**: URL validation prevents processing invalid sources
4. **Large files**: Configurable limits prevent memory issues

### Getting Help

For issues, check the log files generated during processing or contact the development team.
