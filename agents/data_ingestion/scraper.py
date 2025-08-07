"""
Web scraping module using BeautifulSoup and Requests.
"""
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Any
import time
import logging
from urllib.parse import urljoin, urlparse
import random
from .config import config
from .utils import sanitize_text

# Set up logging
logger = logging.getLogger(__name__)


class WebScraper:
    """Web scraper for extracting content from web pages."""
    
    def __init__(self, rate_limit_delay: float = None, respect_robots_txt: bool = None):
        """Initialize the web scraper.
        
        Args:
            rate_limit_delay: Delay between requests in seconds
            respect_robots_txt: Whether to respect robots.txt rules
        """
        self.rate_limit_delay = rate_limit_delay or config.rate_limit_delay
        self.respect_robots_txt = respect_robots_txt or config.respect_robots_txt
        self.session = requests.Session()
        # Set a user agent to avoid being blocked
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def scrape_url(self, url: str) -> Dict[str, Any]:
        """Scrape content from a URL using BeautifulSoup.
        
        Args:
            url: The URL to scrape
            
        Returns:
            Dictionary containing scraped content and metadata
        """
        try:
            logger.info(f"Scraping URL: {url}")
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract title
            title = ""
            title_tag = soup.find('title')
            if title_tag:
                title = title_tag.get_text().strip()
            
            # Extract main content (try common content selectors)
            content_selectors = [
                'article', 'main', '.content', '#content', '.post', '.entry-content',
                '.article-content', '.post-content', 'div[itemprop="articleBody"]'
            ]
            
            content_text = ""
            for selector in content_selectors:
                content_element = soup.select_one(selector)
                if content_element:
                    content_text = content_element.get_text(separator=' ', strip=True)
                    break
            
            # If no specific content found, get body text
            if not content_text:
                body = soup.find('body')
                if body:
                    content_text = body.get_text(separator=' ', strip=True)
            
            # Extract links
            links = []
            for link in soup.find_all('a', href=True):
                full_url = urljoin(url, link['href'])
                links.append({
                    'text': link.get_text().strip(),
                    'url': full_url
                })
            
            result = {
                'url': url,
                'title': title,
                'content': sanitize_text(content_text),
                'links': links,
                'status_code': response.status_code,
                'scraped_at': time.time()
            }
            
            # Rate limiting
            time.sleep(self.rate_limit_delay)
            
            return result
            
        except requests.RequestException as e:
            logger.error(f"Error scraping {url}: {str(e)}")
            return {
                'url': url,
                'error': str(e),
                'status_code': getattr(e.response, 'status_code', None) if hasattr(e, 'response') else None
            }
        except Exception as e:
            logger.error(f"Unexpected error scraping {url}: {str(e)}")
            return {
                'url': url,
                'error': str(e)
            }
        
    def scrape_multiple(self, urls: List[str]) -> List[Dict[str, Any]]:
        """Scrape multiple URLs with rate limiting.
        
        Args:
            urls: List of URLs to scrape
            
        Returns:
            List of dictionaries containing scraped content
        """
        results = []
        for url in urls:
            result = self.scrape_url(url)
            results.append(result)
        return results


class TarotScraper(WebScraper):
    """Specialized scraper for tarot card meanings and interpretations."""
    
    def __init__(self, rate_limit_delay: float = None, respect_robots_txt: bool = None):
        """Initialize the tarot scraper."""
        super().__init__(rate_limit_delay, respect_robots_txt)
        self.tarot_sites = [
            'https://www.tarot.com',
            'https://www.biddytarot.com',
            'https://www.learntarot.com'
        ]
    
    def scrape_tarot_card(self, card_name: str) -> Dict[str, Any]:
        """Scrape information about a specific tarot card.
        
        Args:
            card_name: Name of the tarot card
            
        Returns:
            Dictionary containing tarot card information
        """
        # This would typically involve searching for the card on various sites
        # For now, we'll return a basic structure
        return {
            'card_name': card_name,
            'type': 'tarot_card',
            'upright_meaning': '',
            'reversed_meaning': '',
            'keywords': [],
            'astrology': '',
            'element': '',
            'archetype': ''
        }
    
    def scrape_tarot_spread(self, spread_name: str) -> Dict[str, Any]:
        """Scrape information about a tarot spread.
        
        Args:
            spread_name: Name of the tarot spread
            
        Returns:
            Dictionary containing tarot spread information
        """
        return {
            'spread_name': spread_name,
            'type': 'tarot_spread',
            'card_positions': [],
            'interpretation': '',
            'difficulty': ''
        }


class AstrologyScraper(WebScraper):
    """Specialized scraper for astrological interpretations and data."""
    
    def __init__(self, rate_limit_delay: float = None, respect_robots_txt: bool = None):
        """Initialize the astrology scraper."""
        super().__init__(rate_limit_delay, respect_robots_txt)
        self.astrology_sites = [
            'https://www.astro.com',
            'https://www.astrology.com',
            'https://www.cafeastrology.com'
        ]
    
    def scrape_zodiac_sign(self, sign_name: str) -> Dict[str, Any]:
        """Scrape information about a zodiac sign.
        
        Args:
            sign_name: Name of the zodiac sign
            
        Returns:
            Dictionary containing zodiac sign information
        """
        return {
            'sign_name': sign_name,
            'type': 'zodiac_sign',
            'element': '',
            'quality': '',
            'ruling_planet': '',
            'symbol': '',
            'key_traits': [],
            'strengths': [],
            'weaknesses': [],
            'compatibility': []
        }
    
    def scrape_planet_info(self, planet_name: str) -> Dict[str, Any]:
        """Scrape information about an astrological planet.
        
        Args:
            planet_name: Name of the planet
            
        Returns:
            Dictionary containing planet information
        """
        return {
            'planet_name': planet_name,
            'type': 'planet',
            'keywords': [],
            'archetype': '',
            'expression': '',
            'challenges': ''
        }


class PsychologyScraper(WebScraper):
    """Specialized scraper for psychology concepts and theories."""
    
    def __init__(self, rate_limit_delay: float = None, respect_robots_txt: bool = None):
        """Initialize the psychology scraper."""
        super().__init__(rate_limit_delay, respect_robots_txt)
        self.psychology_sites = [
            'https://www.psychologytoday.com',
            'https://www.simplypsychology.org',
            'https://www.apa.org'
        ]
    
    def scrape_psychology_concept(self, concept_name: str) -> Dict[str, Any]:
        """Scrape information about a psychology concept.
        
        Args:
            concept_name: Name of the psychology concept
            
        Returns:
            Dictionary containing psychology concept information
        """
        return {
            'concept_name': concept_name,
            'type': 'psychology_concept',
            'definition': '',
            'theorists': [],
            'applications': [],
            'related_concepts': [],
            'research_findings': []
        }
    
    def scrape_theory_info(self, theory_name: str) -> Dict[str, Any]:
        """Scrape information about a psychological theory.
        
        Args:
            theory_name: Name of the psychological theory
            
        Returns:
            Dictionary containing theory information
        """
        return {
            'theory_name': theory_name,
            'type': 'psychological_theory',
            'proponent': '',
            'key_principles': [],
            'applications': [],
            'criticisms': [],
            'related_theories': []
        }
