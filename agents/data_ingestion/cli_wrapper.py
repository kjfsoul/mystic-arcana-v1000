#!/usr/bin/env python3
"""
CLI wrapper for data ingestion modules.
Provides command-line interface for all scraping and processing functionality.
"""
import sys
import os
import argparse
import json
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def setup_logging(verbose=False):
    """Set up logging configuration."""
    import logging
    level = logging.DEBUG if verbose else logging.INFO
    logging.basicConfig(
        level=level,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    return logging.getLogger(__name__)

def scrape_tarot_card(card_name, output_file=None):
    """Scrape tarot card information."""
    try:
        from data_ingestion import scraper, utils, data_validator
        
        logger = setup_logging()
        logger.info(f"Scraping tarot card: {card_name}")
        
        # Initialize scraper
        tarot_scraper = scraper.TarotScraper()
        card_data = tarot_scraper.scrape_tarot_card(card_name)
        
        # Validate data
        validator = data_validator.DataValidator()
        validation_result = validator.validate_content({
            'title': card_data['card_name'],
            'content': f"Upright: {card_data.get('upright_meaning', '')}. Reversed: {card_data.get('reversed_meaning', '')}",
            'source': 'tarot_scraper'
        })
        
        result = {
            'data': card_data,
            'validation': validation_result,
            'timestamp': utils.format_timestamp()
        }
        
        if output_file:
            utils.save_json_data(result, output_file)
            logger.info(f"Data saved to {output_file}")
        else:
            print(json.dumps(result, indent=2))
            
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error scraping tarot card {card_name}: {e}")
        return None

def scrape_zodiac_sign(sign_name, output_file=None):
    """Scrape zodiac sign information."""
    try:
        from data_ingestion import scraper, utils, data_validator
        
        logger = setup_logging()
        logger.info(f"Scraping zodiac sign: {sign_name}")
        
        # Initialize scraper
        astrology_scraper = scraper.AstrologyScraper()
        sign_data = astrology_scraper.scrape_zodiac_sign(sign_name)
        
        # Validate data
        validator = data_validator.DataValidator()
        validation_result = validator.validate_content({
            'title': sign_data['sign_name'],
            'content': f"Element: {sign_data.get('element', '')}. Ruling Planet: {sign_data.get('ruling_planet', '')}",
            'source': 'astrology_scraper'
        })
        
        result = {
            'data': sign_data,
            'validation': validation_result,
            'timestamp': utils.format_timestamp()
        }
        
        if output_file:
            utils.save_json_data(result, output_file)
            logger.info(f"Data saved to {output_file}")
        else:
            print(json.dumps(result, indent=2))
            
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error scraping zodiac sign {sign_name}: {e}")
        return None

def scrape_psychology_concept(concept_name, output_file=None):
    """Scrape psychology concept information."""
    try:
        from data_ingestion import scraper, utils, data_validator
        
        logger = setup_logging()
        logger.info(f"Scraping psychology concept: {concept_name}")
        
        # Initialize scraper
        psychology_scraper = scraper.PsychologyScraper()
        concept_data = psychology_scraper.scrape_psychology_concept(concept_name)
        
        # Validate data
        validator = data_validator.DataValidator()
        validation_result = validator.validate_content({
            'title': concept_data['concept_name'],
            'content': concept_data.get('definition', ''),
            'source': 'psychology_scraper'
        })
        
        result = {
            'data': concept_data,
            'validation': validation_result,
            'timestamp': utils.format_timestamp()
        }
        
        if output_file:
            utils.save_json_data(result, output_file)
            logger.info(f"Data saved to {output_file}")
        else:
            print(json.dumps(result, indent=2))
            
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error scraping psychology concept {concept_name}: {e}")
        return None

def process_youtube_video(video_id, languages=None, output_file=None):
    """Process YouTube video transcript."""
    try:
        from data_ingestion import youtube_processor, utils
        
        logger = setup_logging()
        logger.info(f"Processing YouTube video: {video_id}")
        
        # Initialize processor
        youtube_proc = youtube_processor.YouTubeProcessor()
        
        # Get transcript
        transcript = youtube_proc.get_transcript(video_id, languages)
        
        # Get metadata
        metadata = youtube_proc.get_video_metadata(video_id)
        
        # Get available transcripts info
        available_transcripts = youtube_proc.get_available_transcripts(video_id)
        
        result = {
            'video_id': video_id,
            'transcript': transcript,
            'metadata': metadata,
            'available_transcripts': available_transcripts,
            'timestamp': utils.format_timestamp()
        }
        
        if output_file:
            utils.save_json_data(result, output_file)
            logger.info(f"Data saved to {output_file}")
        else:
            print(json.dumps(result, indent=2))
            
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error processing YouTube video {video_id}: {e}")
        return None

def process_text_content(text, output_file=None):
    """Process text content with NLP."""
    try:
        from data_ingestion import content_processor, utils
        
        logger = setup_logging()
        logger.info("Processing text content")
        
        # Initialize processor
        try:
            processor = content_processor.ContentProcessor()
            
            # Process text
            cleaned_text = processor.clean_text(text)
            entities = processor.extract_entities(text)
            keywords = processor.extract_keywords(text)
            summary = processor.summarize(text)
            
        except ImportError:
            logger.warning("spaCy not available - using basic processing")
            cleaned_text = text.strip()
            entities = []
            keywords = []
            summary = text[:200] + "..." if len(text) > 200 else text
        
        result = {
            'original_text': text,
            'cleaned_text': cleaned_text,
            'entities': entities,
            'keywords': keywords,
            'summary': summary,
            'timestamp': utils.format_timestamp()
        }
        
        if output_file:
            utils.save_json_data(result, output_file)
            logger.info(f"Data saved to {output_file}")
        else:
            print(json.dumps(result, indent=2))
            
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error processing text content: {e}")
        return None

def validate_data(data_file, output_file=None):
    """Validate data from file."""
    try:
        from data_ingestion import data_validator, utils
        
        logger = setup_logging()
        logger.info(f"Validating data from file: {data_file}")
        
        # Load data
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        # Validate data
        validator = data_validator.DataValidator()
        validation_result = validator.validate_content(data)
        
        result = {
            'input_data': data,
            'validation': validation_result,
            'timestamp': utils.format_timestamp()
        }
        
        if output_file:
            utils.save_json_data(result, output_file)
            logger.info(f"Validation results saved to {output_file}")
        else:
            print(json.dumps(result, indent=2))
            
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error validating data from {data_file}: {e}")
        return None

def run_integration_tests(verbose=False):
    """Run integration tests."""
    try:
        logger = setup_logging(verbose)
        logger.info("Running integration tests...")
        
        # Import and run tests
        from data_ingestion.run_data_ingestion import main as run_tests
        result = run_tests()
        
        logger.info("Integration tests completed")
        return result
        
    except Exception as e:
        logger = setup_logging()
        logger.error(f"Error running integration tests: {e}")
        return False

def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(description='Data Ingestion CLI')
    parser.add_argument('--verbose', '-v', action='store_true', help='Enable verbose logging')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Tarot scraping
    tarot_parser = subparsers.add_parser('tarot', help='Scrape tarot card information')
    tarot_parser.add_argument('card_name', help='Name of the tarot card')
    tarot_parser.add_argument('--output', '-o', help='Output file path')
    
    # Astrology scraping
    astrology_parser = subparsers.add_parser('astrology', help='Scrape zodiac sign information')
    astrology_parser.add_argument('sign_name', help='Name of the zodiac sign')
    astrology_parser.add_argument('--output', '-o', help='Output file path')
    
    # Psychology scraping
    psychology_parser = subparsers.add_parser('psychology', help='Scrape psychology concept information')
    psychology_parser.add_argument('concept_name', help='Name of the psychology concept')
    psychology_parser.add_argument('--output', '-o', help='Output file path')
    
    # YouTube processing
    youtube_parser = subparsers.add_parser('youtube', help='Process YouTube video transcript')
    youtube_parser.add_argument('video_id', help='YouTube video ID')
    youtube_parser.add_argument('--languages', '-l', nargs='+', help='Preferred languages')
    youtube_parser.add_argument('--output', '-o', help='Output file path')
    
    # Text processing
    text_parser = subparsers.add_parser('process-text', help='Process text content with NLP')
    text_parser.add_argument('text', help='Text to process')
    text_parser.add_argument('--output', '-o', help='Output file path')
    
    # Data validation
    validate_parser = subparsers.add_parser('validate', help='Validate data from file')
    validate_parser.add_argument('data_file', help='Path to data file to validate')
    validate_parser.add_argument('--output', '-o', help='Output file path')
    
    # Integration tests
    test_parser = subparsers.add_parser('test', help='Run integration tests')
    
    # Parse arguments
    args = parser.parse_args()
    
    if args.command == 'tarot':
        scrape_tarot_card(args.card_name, args.output)
    elif args.command == 'astrology':
        scrape_zodiac_sign(args.sign_name, args.output)
    elif args.command == 'psychology':
        scrape_psychology_concept(args.concept_name, args.output)
    elif args.command == 'youtube':
        process_youtube_video(args.video_id, args.languages, args.output)
    elif args.command == 'process-text':
        process_text_content(args.text, args.output)
    elif args.command == 'validate':
        validate_data(args.data_file, args.output)
    elif args.command == 'test':
        run_integration_tests(args.verbose)
    else:
        parser.print_help()

if __name__ == '__main__':
    main()
