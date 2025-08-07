"""
Utility functions for the data ingestion system.
"""
import hashlib
import json
import re
from typing import Dict, Any, List
from datetime import datetime
import os
import logging

# Set up logging
logger = logging.getLogger(__name__)


def generate_content_id(content: Dict[str, Any]) -> str:
    """Generate a unique ID for content based on its properties.
    
    Args:
        content: Content dictionary
        
    Returns:
        Unique content ID
    """
    try:
        # Create a consistent string representation of the content
        content_keys = sorted(content.keys())
        content_string = ""
        
        # Include key content fields for ID generation
        important_fields = ['title', 'content', 'url', 'source']
        for field in important_fields:
            if field in content and content[field]:
                content_string += f"{field}:{content[field]}|"
        
        # Include all other fields
        for key in content_keys:
            if key not in important_fields and content[key]:
                content_string += f"{key}:{content[key]}|"
        
        if not content_string:
            # Fallback to using the entire content as string
            content_string = str(content)
        
        # Generate MD5 hash
        content_hash = hashlib.md5(content_string.encode('utf-8')).hexdigest()
        return content_hash
        
    except Exception as e:
        logger.error(f"Error generating content ID: {str(e)}")
        # Fallback to random ID
        import uuid
        return str(uuid.uuid4())


def format_timestamp(timestamp: datetime = None) -> str:
    """Format timestamp for consistent storage.
    
    Args:
        timestamp: Datetime object (uses current time if None)
        
    Returns:
        ISO formatted timestamp string
    """
    if timestamp is None:
        timestamp = datetime.utcnow()
    return timestamp.isoformat() + 'Z'


def calculate_quality_score(content: Dict[str, Any]) -> float:
    """Calculate quality score for content.
    
    Args:
        content: Content dictionary
        
    Returns:
        Quality score between 0.0 and 10.0
    """
    try:
        score = 0.0
        max_score = 10.0
        
        # Check content length
        content_text = content.get('content', '')
        content_length = len(content_text.strip())
        
        if content_length > 1000:
            score += 3.0
        elif content_length > 500:
            score += 2.0
        elif content_length > 100:
            score += 1.0
        
        # Check for title
        if content.get('title') and len(content['title'].strip()) > 5:
            score += 1.5
        
        # Check for source
        if content.get('source'):
            score += 1.0
        
        # Check for URL
        if content.get('url'):
            score += 0.5
        
        # Check for metadata
        if content.get('metadata'):
            score += 1.0
        
        # Check for proper sentence structure (basic check)
        sentences = content_text.split('.')
        if len([s for s in sentences if len(s.strip()) > 10]) > 3:
            score += 1.0
        
        # Normalize score
        score = min(score, max_score)
        return round(score, 2)
        
    except Exception as e:
        logger.error(f"Error calculating quality score: {str(e)}")
        return 0.0


def sanitize_text(text: str) -> str:
    """Sanitize text for storage and processing.
    
    Args:
        text: Input text
        
    Returns:
        Sanitized text
    """
    if not text:
        return ""
    
    try:
        # Remove or replace problematic characters
        text = text.replace('\x00', '')  # Remove null bytes
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)  # Remove control characters
        
        # Normalize whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    except Exception as e:
        logger.error(f"Error sanitizing text: {str(e)}")
        return str(text).strip() if text else ""


def is_valid_url(url: str) -> bool:
    """Validate URL format.
    
    Args:
        url: URL to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not url:
        return False
    
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    return url_pattern.match(url) is not None


def normalize_url(url: str) -> str:
    """Normalize URL format.
    
    Args:
        url: URL to normalize
        
    Returns:
        Normalized URL
    """
    if not url:
        return ""
    
    # Ensure URL has protocol
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Remove trailing slashes
    url = url.rstrip('/')
    
    return url


def save_json_data(data: Dict[str, Any], filepath: str) -> bool:
    """Save data to JSON file.
    
    Args:
        data: Data to save
        filepath: Path to save file
        
    Returns:
        True if successful, False otherwise
    """
    try:
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        logger.error(f"Error saving JSON data to {filepath}: {str(e)}")
        return False


def load_json_data(filepath: str) -> Dict[str, Any]:
    """Load data from JSON file.
    
    Args:
        filepath: Path to JSON file
        
    Returns:
        Loaded data or empty dict if error
    """
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Error loading JSON data from {filepath}: {str(e)}")
        return {}


def get_file_size(filepath: str) -> int:
    """Get file size in bytes.
    
    Args:
        filepath: Path to file
        
    Returns:
        File size in bytes or 0 if error
    """
    try:
        return os.path.getsize(filepath)
    except Exception as e:
        logger.error(f"Error getting file size for {filepath}: {str(e)}")
        return 0
