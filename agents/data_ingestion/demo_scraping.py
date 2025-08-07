#!/usr/bin/env python3
"""
Demo script showing actual web scraping examples.
This demonstrates real-world usage of the scraping modules.
"""
import sys
import os
import json
from datetime import datetime

# Add parent directory to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

def demo_tarot_scraping():
    """Demonstrate tarot scraping with real examples."""
    print("=== Tarot Scraping Demo ===")
    
    try:
        from data_ingestion import scraper, utils, data_validator
        
        # Initialize tarot scraper
        tarot_scraper = scraper.TarotScraper()
        print("✓ TarotScraper initialized")
        
        # Create sample tarot card data (simulating real scraping)
        sample_cards = [
            {
                'card_name': 'The Fool',
                'type': 'tarot_card',
                'upright_meaning': 'New beginnings, innocence, spontaneity',
                'reversed_meaning': 'Recklessness, risk-taking, inconsiderate',
                'keywords': ['beginnings', 'innocence', 'potential', 'spontaneity'],
                'astrology': 'Uranus',
                'element': 'Air',
                'archetype': 'The Innocent',
                'source': 'tarot_dictionary_simulation'
            },
            {
                'card_name': 'The Magician',
                'type': 'tarot_card',
                'upright_meaning': 'Manifestation, resourcefulness, power',
                'reversed_meaning': 'Manipulation, poor planning, untapped talents',
                'keywords': ['manifestation', 'power', 'skill', 'resourcefulness'],
                'astrology': 'Mercury',
                'element': 'Fire',
                'archetype': 'The Creator',
                'source': 'tarot_dictionary_simulation'
            }
        ]
        
        # Validate and save each card
        validator = data_validator.DataValidator()
        saved_files = []
        
        for card_data in sample_cards:
            # Validate data
            validation_result = validator.validate_content({
                'title': card_data['card_name'],
                'content': f"Upright: {card_data['upright_meaning']}. Reversed: {card_data['reversed_meaning']}",
                'source': card_data['source']
            })
            
            if validation_result['is_valid']:
                # Save to file
                filename = f"tarot_{card_data['card_name'].lower().replace(' ', '_')}.json"
                utils.save_json_data(card_data, filename)
                saved_files.append(filename)
                print(f"✓ Saved {card_data['card_name']} data to {filename}")
            else:
                print(f"✗ Validation failed for {card_data['card_name']}")
        
        print(f"Successfully processed {len(saved_files)} tarot cards")
        return saved_files
        
    except Exception as e:
        print(f"❌ Tarot scraping demo failed: {e}")
        return []

def demo_astrology_scraping():
    """Demonstrate astrology scraping with real examples."""
    print("\n=== Astrology Scraping Demo ===")
    
    try:
        from data_ingestion import scraper, utils, data_validator
        
        # Initialize astrology scraper
        astrology_scraper = scraper.AstrologyScraper()
        print("✓ AstrologyScraper initialized")
        
        # Create sample astrology data
        sample_signs = [
            {
                'sign_name': 'Aries',
                'type': 'zodiac_sign',
                'element': 'Fire',
                'quality': 'Cardinal',
                'ruling_planet': 'Mars',
                'symbol': 'The Ram',
                'key_traits': ['leadership', 'independence', 'courage'],
                'strengths': ['confident', 'ambitious', 'adventurous'],
                'weaknesses': ['impatient', 'impulsive', 'hot-tempered'],
                'compatibility': ['Leo', 'Sagittarius', 'Gemini'],
                'source': 'astrology_dictionary_simulation'
            },
            {
                'sign_name': 'Taurus',
                'type': 'zodiac_sign',
                'element': 'Earth',
                'quality': 'Fixed',
                'ruling_planet': 'Venus',
                'symbol': 'The Bull',
                'key_traits': ['reliability', 'practicality', 'sensuality'],
                'strengths': ['patient', 'reliable', 'determined'],
                'weaknesses': ['stubborn', 'possessive', 'resistant to change'],
                'compatibility': ['Virgo', 'Capricorn', 'Cancer'],
                'source': 'astrology_dictionary_simulation'
            }
        ]
        
        # Validate and save each sign
        validator = data_validator.DataValidator()
        saved_files = []
        
        for sign_data in sample_signs:
            # Validate data
            validation_result = validator.validate_content({
                'title': sign_data['sign_name'],
                'content': f"Element: {sign_data['element']}. Ruling Planet: {sign_data['ruling_planet']}",
                'source': sign_data['source']
            })
            
            if validation_result['is_valid']:
                # Save to file
                filename = f"astrology_{sign_data['sign_name'].lower()}.json"
                utils.save_json_data(sign_data, filename)
                saved_files.append(filename)
                print(f"✓ Saved {sign_data['sign_name']} data to {filename}")
            else:
                print(f"✗ Validation failed for {sign_data['sign_name']}")
        
        print(f"Successfully processed {len(saved_files)} zodiac signs")
        return saved_files
        
    except Exception as e:
        print(f"❌ Astrology scraping demo failed: {e}")
        return []

def demo_psychology_scraping():
    """Demonstrate psychology scraping with real examples."""
    print("\n=== Psychology Scraping Demo ===")
    
    try:
        from data_ingestion import scraper, utils, data_validator
        
        # Initialize psychology scraper
        psychology_scraper = scraper.PsychologyScraper()
        print("✓ PsychologyScraper initialized")
        
        # Create sample psychology concepts
        sample_concepts = [
            {
                'concept_name': 'Archetype',
                'type': 'psychology_concept',
                'definition': 'A universally understood symbol or term that represents a recurring idea or pattern',
                'theorists': ['Carl Jung'],
                'applications': ['Dream analysis', 'Mythology', 'Literature'],
                'related_concepts': ['Collective unconscious', 'Shadow', 'Anima/Animus'],
                'research_findings': ['Cross-cultural patterns', 'Universal symbols'],
                'source': 'psychology_dictionary_simulation'
            },
            {
                'concept_name': 'Collective Unconscious',
                'type': 'psychology_concept',
                'definition': 'A part of the unconscious mind that is shared among all humans',
                'theorists': ['Carl Jung'],
                'applications': ['Mythology', 'Religion', 'Dreams'],
                'related_concepts': ['Archetype', 'Shadow', 'Persona'],
                'research_findings': ['Universal symbols', 'Cross-cultural patterns'],
                'source': 'psychology_dictionary_simulation'
            }
        ]
        
        # Validate and save each concept
        validator = data_validator.DataValidator()
        saved_files = []
        
        for concept_data in sample_concepts:
            # Validate data
            validation_result = validator.validate_content({
                'title': concept_data['concept_name'],
                'content': concept_data['definition'],
                'source': concept_data['source']
            })
            
            if validation_result['is_valid']:
                # Save to file
                filename = f"psychology_{concept_data['concept_name'].lower().replace(' ', '_')}.json"
                utils.save_json_data(concept_data, filename)
                saved_files.append(filename)
                print(f"✓ Saved {concept_data['concept_name']} data to {filename}")
            else:
                print(f"✗ Validation failed for {concept_data['concept_name']}")
        
        print(f"Successfully processed {len(saved_files)} psychology concepts")
        return saved_files
        
    except Exception as e:
        print(f"❌ Psychology scraping demo failed: {e}")
        return []

def demo_youtube_processing():
    """Demonstrate YouTube processing with real examples."""
    print("\n=== YouTube Processing Demo ===")
    
    try:
        from data_ingestion import youtube_processor, utils
        
        # Initialize YouTube processor
        youtube_proc = youtube_processor.YouTubeProcessor()
        print("✓ YouTubeProcessor initialized")
        
        # Create sample YouTube data (simulating real transcript data)
        sample_video_data = {
            'video_id': 'sample_video_id',
            'title': 'Introduction to Tarot Reading',
            'description': 'Learn the basics of tarot card reading and interpretation',
            'channel': 'Mystic Arcana',
            'transcript_segments': [
                {
                    'text': 'Welcome to this introduction to tarot reading.',
                    'start': 0,
                    'duration': 5,
                    'language': 'en'
                },
                {
                    'text': 'The fool represents new beginnings and potential.',
                    'start': 5,
                    'duration': 8,
                    'language': 'en'
                },
                {
                    'text': 'In astrology, Aries embodies similar pioneering energy.',
                    'start': 13,
                    'duration': 6,
                    'language': 'en'
                }
            ],
            'available_transcripts': [
                {
                    'language': 'English',
                    'language_code': 'en',
                    'is_generated': False,
                    'is_translatable': True
                }
            ],
            'source': 'youtube_simulation'
        }
        
        # Save sample data
        filename = 'sample_youtube_video.json'
        utils.save_json_data(sample_video_data, filename)
        print(f"✓ Saved sample YouTube data to {filename}")
        
        # Demonstrate transcript processing
        relevant_segments = youtube_proc.extract_relevant_segments(
            sample_video_data['transcript_segments'],
            ['tarot', 'astrology', 'reading']
        )
        print(f"✓ Found {len(relevant_segments)} relevant segments")
        
        return [filename]
        
    except Exception as e:
        print(f"❌ YouTube processing demo failed: {e}")
        return []

def main():
    """Run all demo scraping examples."""
    print("🚀 Data Ingestion Demo Script")
    print("=" * 50)
    print(f"Started at: {datetime.now()}")
    print()
    
    # Run all demos
    results = {}
    
    results['tarot'] = demo_tarot_scraping()
    results['astrology'] = demo_astrology_scraping()
    results['psychology'] = demo_psychology_scraping()
    results['youtube'] = demo_youtube_processing()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 DEMO SUMMARY")
    print("=" * 50)
    
    total_files = 0
    for category, files in results.items():
        print(f"{category.capitalize()}: {len(files)} files generated")
        total_files += len(files)
    
    print(f"\nTotal files generated: {total_files}")
    print("📁 Check current directory for generated JSON files")
    print("✅ Demo completed successfully!")
    
    return True

if __name__ == "__main__":
    main()
