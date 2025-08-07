"""
Data validation and quality assurance module.
"""
from typing import Dict, List, Any
import logging
import hashlib
import json
from .utils import calculate_quality_score, sanitize_text

# Set up logging
logger = logging.getLogger(__name__)


class DataValidator:
    """Validator for ensuring data quality and completeness."""
    
    def __init__(self):
        """Initialize the data validator."""
        pass
        
    def validate_content(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Validate content quality and completeness.
        
        Args:
            content: Content dictionary to validate
            
        Returns:
            Validation results and quality scores
        """
        try:
            validation_results = {
                'is_valid': True,
                'errors': [],
                'warnings': [],
                'quality_score': 0.0,
                'validation_details': {}
            }
            
            # Check required fields
            required_fields = ['content', 'source']
            for field in required_fields:
                if field not in content or not content[field]:
                    validation_results['is_valid'] = False
                    validation_results['errors'].append(f"Missing required field: {field}")
            
            # Validate content length
            content_text = content.get('content', '')
            if len(content_text.strip()) < 10:
                validation_results['is_valid'] = False
                validation_results['errors'].append("Content is too short (minimum 10 characters)")
            elif len(content_text.strip()) > 10000:
                validation_results['warnings'].append("Content is very long (over 10000 characters)")
            
            # Validate URL if present
            if 'url' in content and content['url']:
                if not self._is_valid_url(content['url']):
                    validation_results['warnings'].append("URL format appears invalid")
            
            # Calculate quality score
            quality_score = calculate_quality_score(content)
            validation_results['quality_score'] = quality_score
            validation_results['validation_details'] = {
                'content_length': len(content_text),
                'has_title': bool(content.get('title')),
                'has_source': bool(content.get('source')),
                'sanitized_content': sanitize_text(content_text)
            }
            
            if quality_score < 3.0:
                validation_results['warnings'].append("Low quality content detected")
            elif quality_score > 8.0:
                validation_results['validation_details']['quality_rating'] = "High"
            elif quality_score > 5.0:
                validation_results['validation_details']['quality_rating'] = "Medium"
            else:
                validation_results['validation_details']['quality_rating'] = "Low"
            
            logger.info(f"Content validation completed. Valid: {validation_results['is_valid']}, Quality Score: {quality_score}")
            return validation_results
            
        except Exception as e:
            logger.error(f"Error validating content: {str(e)}")
            return {
                'is_valid': False,
                'errors': [f"Validation error: {str(e)}"],
                'warnings': [],
                'quality_score': 0.0,
                'validation_details': {}
            }
        
    def check_duplicates(self, content: Dict[str, Any], existing_data: List[Dict[str, Any]]) -> bool:
        """Check if content is a duplicate.
        
        Args:
            content: Content to check for duplicates
            existing_data: List of existing content to compare against
            
        Returns:
            True if duplicate found, False otherwise
        """
        try:
            if not content or not existing_data:
                return False
            
            # Create content fingerprint
            content_text = content.get('content', '').strip().lower()
            if not content_text:
                return False
            
            # Generate hash of content
            content_hash = hashlib.md5(content_text.encode()).hexdigest()
            
            # Check against existing data
            for existing_item in existing_data:
                existing_text = existing_item.get('content', '').strip().lower()
                if not existing_text:
                    continue
                
                # Quick hash check first
                existing_hash = hashlib.md5(existing_text.encode()).hexdigest()
                if content_hash == existing_hash:
                    return True
                
                # Fuzzy match for similar content (simple approach)
                if self._is_similar_content(content_text, existing_text):
                    return True
            
            return False
            
        except Exception as e:
            logger.error(f"Error checking duplicates: {str(e)}")
            return False
    
    def _is_valid_url(self, url: str) -> bool:
        """Check if URL is valid.
        
        Args:
            url: URL to validate
            
        Returns:
            True if valid, False otherwise
        """
        import re
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        return url_pattern.match(url) is not None
    
    def _is_similar_content(self, text1: str, text2: str, threshold: float = 0.8) -> bool:
        """Check if two texts are similar.
        
        Args:
            text1: First text
            text2: Second text
            threshold: Similarity threshold (0.0 to 1.0)
            
        Returns:
            True if similar, False otherwise
        """
        # Simple approach: check if one text is contained in the other
        # or if they share a significant portion of words
        if text1 == text2:
            return True
        
        if text1 in text2 or text2 in text1:
            return True
        
        # Check word overlap
        words1 = set(text1.split())
        words2 = set(text2.split())
        
        if not words1 or not words2:
            return False
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        if len(union) == 0:
            return False
        
        similarity = len(intersection) / len(union)
        return similarity >= threshold
    
    def clean_and_normalize(self, content: Dict[str, Any]) -> Dict[str, Any]:
        """Clean and normalize content data.
        
        Args:
            content: Content to clean and normalize
            
        Returns:
            Cleaned and normalized content
        """
        try:
            cleaned_content = content.copy()
            
            # Sanitize text fields
            text_fields = ['content', 'title', 'description']
            for field in text_fields:
                if field in cleaned_content and cleaned_content[field]:
                    cleaned_content[field] = sanitize_text(str(cleaned_content[field]))
            
            # Normalize source field
            if 'source' in cleaned_content:
                cleaned_content['source'] = str(cleaned_content['source']).strip().lower()
            
            # Ensure consistent data types
            if 'metadata' in cleaned_content and not isinstance(cleaned_content['metadata'], dict):
                cleaned_content['metadata'] = {}
            
            # Add timestamp if missing
            if 'created_at' not in cleaned_content:
                from .utils import format_timestamp
                cleaned_content['created_at'] = format_timestamp()
            
            return cleaned_content
            
        except Exception as e:
            logger.error(f"Error cleaning content: {str(e)}")
            return content
