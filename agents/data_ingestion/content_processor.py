"""
Content processing module using spaCy for NLP tasks.
"""
import spacy
from typing import Dict, List, Any
import logging
from collections import Counter
import re
from .config import config

# Set up logging
logger = logging.getLogger(__name__)


class ContentProcessor:
    """Processor for natural language processing using spaCy."""
    
    def __init__(self, model_name: str = None):
        """Initialize the content processor.
        
        Args:
            model_name: Name of the spaCy model to use
        """
        model_name = model_name or config.spacy_model
        try:
            self.nlp = spacy.load(model_name)
            logger.info(f"Successfully loaded spaCy model: {model_name}")
        except OSError:
            logger.warning(f"Could not load spaCy model {model_name}. Using blank English model.")
            self.nlp = spacy.blank("en")
        
    def clean_text(self, text: str) -> str:
        """Clean and preprocess text for analysis.
        
        Args:
            text: Input text to clean
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep punctuation
        text = re.sub(r'[^\w\s\.\,\!\?\;\:]', '', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
        
    def extract_entities(self, text: str) -> List[Dict[str, Any]]:
        """Extract named entities from text.
        
        Args:
            text: Input text to process
            
        Returns:
            List of extracted entities
        """
        try:
            # Clean text first
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return []
            
            doc = self.nlp(cleaned_text)
            entities = []
            
            for ent in doc.ents:
                entity = {
                    'text': ent.text,
                    'label': ent.label_,
                    'description': spacy.explain(ent.label_),
                    'start': ent.start_char,
                    'end': ent.end_char,
                    'confidence': getattr(ent, 'confidence', None)
                }
                entities.append(entity)
            
            logger.info(f"Extracted {len(entities)} entities from text")
            return entities
            
        except Exception as e:
            logger.error(f"Error extracting entities: {str(e)}")
            return []
        
    def extract_keywords(self, text: str, num_keywords: int = 10) -> List[str]:
        """Extract important keywords from text.
        
        Args:
            text: Input text to process
            num_keywords: Number of keywords to extract
            
        Returns:
            List of extracted keywords
        """
        try:
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return []
            
            doc = self.nlp(cleaned_text)
            
            # Extract noun phrases and named entities as keywords
            keywords = []
            
            # Add noun chunks
            for chunk in doc.noun_chunks:
                if len(chunk.text.strip()) > 2:  # Filter out very short phrases
                    keywords.append(chunk.text.strip())
            
            # Add named entities
            for ent in doc.ents:
                if len(ent.text.strip()) > 2:
                    keywords.append(ent.text.strip())
            
            # Add important tokens (nouns, adjectives)
            for token in doc:
                if (token.pos_ in ['NOUN', 'ADJ'] and
                    not token.is_stop and
                    not token.is_punct and
                    len(token.text.strip()) > 2):
                    keywords.append(token.text.strip())
            
            # Count frequency and return top keywords
            keyword_counts = Counter(keywords)
            top_keywords = [kw for kw, count in keyword_counts.most_common(num_keywords)]
            
            logger.info(f"Extracted {len(top_keywords)} keywords from text")
            return top_keywords
            
        except Exception as e:
            logger.error(f"Error extracting keywords: {str(e)}")
            return []
        
    def summarize(self, text: str, ratio: float = 0.3) -> str:
        """Generate text summary using spaCy's sentence processing.
        
        Args:
            text: Input text to summarize
            ratio: Summary ratio (0.0 to 1.0)
            
        Returns:
            Generated summary text
        """
        try:
            cleaned_text = self.clean_text(text)
            if not cleaned_text:
                return ""
            
            doc = self.nlp(cleaned_text)
            
            # Get sentences
            sentences = list(doc.sents)
            if len(sentences) <= 1:
                return cleaned_text
            
            # Calculate number of sentences to keep
            num_sentences = max(1, int(len(sentences) * ratio))
            
            # Simple approach: keep first sentences (in real implementation,
            # you might want to use more sophisticated summarization)
            summary_sentences = sentences[:num_sentences]
            summary = ' '.join([sent.text.strip() for sent in summary_sentences])
            
            logger.info(f"Generated summary with {num_sentences} sentences")
            return summary
            
        except Exception as e:
            logger.error(f"Error generating summary: {str(e)}")
            return text if text else ""
