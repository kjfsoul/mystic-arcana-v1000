"""
Data ingestion package for Mystic Arcana.
"""

from .config import config
from .scraper import WebScraper, TarotScraper, AstrologyScraper, PsychologyScraper
from .youtube_processor import YouTubeProcessor
from .data_validator import DataValidator
from .utils import (
    generate_content_id,
    format_timestamp,
    calculate_quality_score,
    sanitize_text,
    is_valid_url,
    normalize_url,
    save_json_data,
    load_json_data
)

# Import ContentProcessor only if spaCy is available
try:
    from .content_processor import ContentProcessor
    __all__ = [
        'config',
        'WebScraper',
        'TarotScraper',
        'AstrologyScraper',
        'PsychologyScraper',
        'YouTubeProcessor',
        'ContentProcessor',
        'DataValidator',
        'generate_content_id',
        'format_timestamp',
        'calculate_quality_score',
        'sanitize_text',
        'is_valid_url',
        'normalize_url',
        'save_json_data',
        'load_json_data'
    ]
except ImportError:
    # spaCy not available, exclude ContentProcessor
    __all__ = [
        'config',
        'WebScraper',
        'TarotScraper',
        'AstrologyScraper',
        'PsychologyScraper',
        'YouTubeProcessor',
        'DataValidator',
        'generate_content_id',
        'format_timestamp',
        'calculate_quality_score',
        'sanitize_text',
        'is_valid_url',
        'normalize_url',
        'save_json_data',
        'load_json_data'
    ]
