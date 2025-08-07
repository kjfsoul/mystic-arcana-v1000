"""
YouTube transcript processing module.
"""
from typing import Dict, List, Any, Optional
import requests
from youtube_transcript_api import YouTubeTranscriptApi
import logging
from .utils import sanitize_text

# Set up logging
logger = logging.getLogger(__name__)


class YouTubeProcessor:
    """Processor for extracting transcripts from YouTube videos."""
    
    def __init__(self):
        """Initialize the YouTube processor."""
        pass
        
    def get_transcript(self, video_id: str, languages: List[str] = None) -> List[Dict[str, Any]]:
        """Get transcript for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            languages: List of preferred languages (e.g., ['en', 'es'])
            
        Returns:
            List of transcript segments
        """
        try:
            logger.info(f"Fetching transcript for video: {video_id}")
            
            # If languages specified, try those first
            if languages:
                try:
                    transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
                    transcript = transcript_list.find_transcript(languages)
                    segments = transcript.fetch()
                except Exception:
                    # Fall back to automatic language detection
                    segments = YouTubeTranscriptApi.get_transcript(video_id)
            else:
                # Get transcript with automatic language detection
                segments = YouTubeTranscriptApi.get_transcript(video_id)
            
            # Process segments
            processed_segments = []
            for segment in segments:
                processed_segment = {
                    'text': sanitize_text(segment.get('text', '')),
                    'start': segment.get('start', 0),
                    'duration': segment.get('duration', 0),
                    'language': segment.get('language', 'unknown')
                }
                processed_segments.append(processed_segment)
            
            logger.info(f"Successfully fetched {len(processed_segments)} transcript segments")
            return processed_segments
            
        except Exception as e:
            logger.error(f"Error fetching transcript for video {video_id}: {str(e)}")
            return []
        
    def get_video_metadata(self, video_id: str) -> Dict[str, Any]:
        """Get metadata for a YouTube video.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            Dictionary containing video metadata
        """
        try:
            logger.info(f"Fetching metadata for video: {video_id}")
            
            # Note: This is a simplified version. In production, you would use
            # the YouTube Data API with an API key for full metadata
            url = f"https://www.youtube.com/watch?v={video_id}"
            
            # For now, we'll return basic metadata structure
            metadata = {
                'video_id': video_id,
                'url': url,
                'title': '',
                'description': '',
                'channel': '',
                'published_at': '',
                'duration': 0,
                'view_count': 0,
                'like_count': 0,
                'tags': []
            }
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error fetching metadata for video {video_id}: {str(e)}")
            return {
                'video_id': video_id,
                'error': str(e)
            }
    
    def extract_relevant_segments(self, segments: List[Dict[str, Any]],
                                   keywords: List[str]) -> List[Dict[str, Any]]:
        """Extract segments that contain specific keywords.
        
        Args:
            segments: List of transcript segments
            keywords: List of keywords to search for
            
        Returns:
            List of relevant segments
        """
        relevant_segments = []
        keywords_lower = [kw.lower() for kw in keywords]
        
        for segment in segments:
            text_lower = segment.get('text', '').lower()
            if any(kw in text_lower for kw in keywords_lower):
                relevant_segments.append(segment)
        
        return relevant_segments
    
    def get_available_transcripts(self, video_id: str) -> List[Dict[str, Any]]:
        """Get information about available transcripts for a video.
        
        Args:
            video_id: YouTube video ID
            
        Returns:
            List of available transcript information
        """
        try:
            transcript_list = YouTubeTranscriptApi.list_transcripts(video_id)
            available_transcripts = []
            
            # Get manually created transcripts
            for transcript in transcript_list:
                available_transcripts.append({
                    'language': transcript.language,
                    'language_code': transcript.language_code,
                    'is_generated': transcript.is_generated,
                    'is_translatable': transcript.is_translatable
                })
            
            return available_transcripts
        except Exception as e:
            logger.error(f"Error fetching available transcripts for video {video_id}: {str(e)}")
            return []
