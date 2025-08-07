"""
Configuration management for the data ingestion system.
"""
import os
from typing import Optional
import logging

# Set up logging
logger = logging.getLogger(__name__)


class Config:
    """Configuration class for data ingestion system."""
    
    def __init__(self):
        """Initialize configuration with default values and environment variables."""
        # Web scraping configuration
        self.rate_limit_delay = self._get_float_env('SCRAPER_RATE_LIMIT_DELAY', 2.0)
        self.respect_robots_txt = self._get_bool_env('SCRAPER_RESPECT_ROBOTS_TXT', True)
        self.max_retries = self._get_int_env('SCRAPER_MAX_RETRIES', 3)
        self.timeout = self._get_int_env('SCRAPER_TIMEOUT', 30)
        
        # YouTube API configuration
        self.youtube_api_key = os.getenv('YOUTUBE_API_KEY')
        self.youtube_max_results = self._get_int_env('YOUTUBE_MAX_RESULTS', 50)
        
        # Neo4j configuration
        self.neo4j_uri = os.getenv('NEO4J_URI', 'bolt://localhost:7687')
        self.neo4j_username = os.getenv('NEO4J_USERNAME', 'neo4j')
        self.neo4j_password = os.getenv('NEO4J_PASSWORD', 'password')
        self.neo4j_database = os.getenv('NEO4J_DATABASE', 'neo4j')
        
        # spaCy model
        self.spacy_model = os.getenv('SPACY_MODEL', 'en_core_web_sm')
        self.spacy_max_length = self._get_int_env('SPACY_MAX_LENGTH', 1000000)
        
        # Data validation configuration
        self.min_content_length = self._get_int_env('MIN_CONTENT_LENGTH', 10)
        self.max_content_length = self._get_int_env('MAX_CONTENT_LENGTH', 100000)
        self.quality_threshold = self._get_float_env('QUALITY_THRESHOLD', 3.0)
        
        # File I/O configuration
        self.data_directory = os.getenv('DATA_DIRECTORY', './data')
        self.backup_directory = os.getenv('BACKUP_DIRECTORY', './backups')
        self.max_file_size = self._get_int_env('MAX_FILE_SIZE', 10485760)  # 10MB
        
        # Logging configuration
        self.log_level = os.getenv('LOG_LEVEL', 'INFO')
        self.log_file = os.getenv('LOG_FILE', './logs/data_ingestion.log')
        
        # Validate configuration
        self._validate_configuration()
    
    def _get_bool_env(self, key: str, default: bool) -> bool:
        """Get boolean value from environment variable.
        
        Args:
            key: Environment variable key
            default: Default value
            
        Returns:
            Boolean value
        """
        value = os.getenv(key)
        if value is None:
            return default
        return value.lower() in ('true', '1', 'yes', 'on')
    
    def _get_int_env(self, key: str, default: int) -> int:
        """Get integer value from environment variable.
        
        Args:
            key: Environment variable key
            default: Default value
            
        Returns:
            Integer value
        """
        value = os.getenv(key)
        if value is None:
            return default
        try:
            return int(value)
        except ValueError:
            logger.warning(f"Invalid integer value for {key}: {value}. Using default: {default}")
            return default
    
    def _get_float_env(self, key: str, default: float) -> float:
        """Get float value from environment variable.
        
        Args:
            key: Environment variable key
            default: Default value
            
        Returns:
            Float value
        """
        value = os.getenv(key)
        if value is None:
            return default
        try:
            return float(value)
        except ValueError:
            logger.warning(f"Invalid float value for {key}: {value}. Using default: {default}")
            return default
    
    def _validate_configuration(self):
        """Validate configuration values and log warnings for potential issues."""
        logger.info("Validating configuration...")
        
        # Validate rate limit delay
        if self.rate_limit_delay < 0:
            logger.warning(f"Rate limit delay is negative: {self.rate_limit_delay}. Setting to 0.")
            self.rate_limit_delay = 0.0
        elif self.rate_limit_delay > 10:
            logger.warning(f"Rate limit delay is high: {self.rate_limit_delay} seconds.")
        
        # Validate content length limits
        if self.min_content_length < 0:
            logger.warning(f"Min content length is negative: {self.min_content_length}. Setting to 0.")
            self.min_content_length = 0
        if self.max_content_length < self.min_content_length:
            logger.warning(f"Max content length ({self.max_content_length}) is less than min ({self.min_content_length}).")
        
        # Validate quality threshold
        if self.quality_threshold < 0 or self.quality_threshold > 10:
            logger.warning(f"Quality threshold {self.quality_threshold} is outside valid range (0-10).")
        
        # Validate Neo4j URI
        if not self.neo4j_uri.startswith(('bolt://', 'neo4j://')):
            logger.warning(f"Neo4j URI {self.neo4j_uri} should start with 'bolt://' or 'neo4j://'")
        
        logger.info("Configuration validation completed.")
    
    def get_config_summary(self) -> dict:
        """Get a summary of configuration values (excluding sensitive data).
        
        Returns:
            Dictionary with configuration summary
        """
        return {
            'rate_limit_delay': self.rate_limit_delay,
            'respect_robots_txt': self.respect_robots_txt,
            'max_retries': self.max_retries,
            'timeout': self.timeout,
            'youtube_max_results': self.youtube_max_results,
            'neo4j_uri': self.neo4j_uri,
            'neo4j_database': self.neo4j_database,
            'spacy_model': self.spacy_model,
            'spacy_max_length': self.spacy_max_length,
            'min_content_length': self.min_content_length,
            'max_content_length': self.max_content_length,
            'quality_threshold': self.quality_threshold,
            'data_directory': self.data_directory,
            'backup_directory': self.backup_directory,
            'max_file_size': self.max_file_size,
            'log_level': self.log_level
        }


# Global configuration instance
config = Config()
