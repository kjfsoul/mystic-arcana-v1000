"""
Kerykeion-based chart generation service
Generates SVG birth charts and synastry charts
"""

from kerykeion import AstrologicalSubject, KerykeionChartSVG, SynastryAspects, RelationshipScore
from datetime import datetime
from typing import Dict, Optional, Tuple
import json
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
import pytz
from supabase import create_client, Client
import os

# Initialize services
geolocator = Nominatim(user_agent="mystic_arcana_v1000")
tf = TimezoneFinder()

# Supabase client
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


class ChartGeneratorService:
    """Handles chart generation using Kerykeion"""
    
    @staticmethod
    def geocode_location(city: str, country: str = "") -> Dict:
        """
        Geocode city to coordinates with caching
        Returns: {lat, lng, timezone, formatted_address}
        """
        search_query = f"{city}, {country}".strip(", ")
        
        # Check cache first
        cache_result = supabase.table('location_cache').select('*').eq(
            'search_query', search_query.lower()
        ).execute()
        
        if cache_result.data:
            cached = cache_result.data[0]
            return {
                'lat': float(cached['latitude']),
                'lng': float(cached['longitude']),
                'timezone': cached['timezone'],
                'formatted_address': cached['formatted_address'],
                'city': cached['city'],
                'country': cached['country']
            }
        
        # Geocode if not cached
        try:
            location = geolocator.geocode(search_query, exactly_one=True, language='en')
            if not location:
                raise ValueError(f"Location not found: {search_query}")
            
            # Get timezone
            timezone = tf.timezone_at(lat=location.latitude, lng=location.longitude)
            if not timezone:
                timezone = 'UTC'
            
            # Parse address components
            address_parts = location.raw.get('address', {})
            city_name = (address_parts.get('city') or 
                        address_parts.get('town') or 
                        address_parts.get('village') or 
                        city)
            country_name = address_parts.get('country', '')
            
            location_data = {
                'lat': location.latitude,
                'lng': location.longitude,
                'timezone': timezone,
                'formatted_address': location.address,
                'city': city_name,
                'country': country_name
            }
            
            # Cache the result
            supabase.table('location_cache').insert({
                'search_query': search_query.lower(),
                'latitude': location_data['lat'],
                'longitude': location_data['lng'],
                'timezone': location_data['timezone'],
                'formatted_address': location_data['formatted_address'],
                'city': location_data['city'],
                'country': location_data['country']
            }).execute()
            
            return location_data
            
        except Exception as e:
            raise ValueError(f"Geocoding error for {search_query}: {str(e)}")
    
    @classmethod
    def create_birth_chart(cls, name: str, birth_date: datetime, 
                          city: str, country: str = "") -> Dict:
        """
        Create birth chart using Kerykeion
        Returns: {subject_data, svg_chart, chart_data}
        """
        # Geocode location
        location = cls.geocode_location(city, country)
        
        # Convert datetime to timezone-aware
        tz = pytz.timezone(location['timezone'])
        birth_date_local = tz.localize(birth_date)
        
        # Create Kerykeion subject
        subject = AstrologicalSubject(
            name=name,
            year=birth_date.year,
            month=birth_date.month,
            day=birth_date.day,
            hour=birth_date.hour,
            minute=birth_date.minute,
            lat=location['lat'],
            lng=location['lng'],
            tz_str=location['timezone'],
            city=location['city']
        )
        
        # Generate SVG chart
        chart = KerykeionChartSVG(subject)
        svg_string = chart.makeTemplate()
        
        # Extract chart data
        chart_data = {
            'sun': {'sign': subject.sun['sign'], 'degree': subject.sun['position']},
            'moon': {'sign': subject.moon['sign'], 'degree': subject.moon['position']},
            'mercury': {'sign': subject.mercury['sign'], 'degree': subject.mercury['position']},
            'venus': {'sign': subject.venus['sign'], 'degree': subject.venus['position']},
            'mars': {'sign': subject.mars['sign'], 'degree': subject.mars['position']},
            'jupiter': {'sign': subject.jupiter['sign'], 'degree': subject.jupiter['position']},
            'saturn': {'sign': subject.saturn['sign'], 'degree': subject.saturn['position']},
            'uranus': {'sign': subject.uranus['sign'], 'degree': subject.uranus['position']},
            'neptune': {'sign': subject.neptune['sign'], 'degree': subject.neptune['position']},
            'pluto': {'sign': subject.pluto['sign'], 'degree': subject.pluto['position']},
            'chiron': {'sign': subject.chiron['sign'], 'degree': subject.chiron['position']},
            'north_node': {'sign': subject.north_node['sign'], 'degree': subject.north_node['position']},
            'houses': subject.houses_list,
            'ascendant': {'sign': subject.first_house['sign'], 'degree': subject.first_house['position']},
            'midheaven': {'sign': subject.tenth_house['sign'], 'degree': subject.tenth_house['position']}
        }
        
        return {
            'subject_data': {
                'name': name,
                'birth_date': birth_date_local.isoformat(),
                'location': location,
                'julian_day': subject.julian_day
            },
            'svg_chart': svg_string,
            'chart_data': chart_data,
            'aspects': cls._extract_aspects(subject)
        }
    
    @staticmethod
    def _extract_aspects(subject: AstrologicalSubject) -> list:
        """Extract aspect data from Kerykeion subject"""
        aspects = []
        
        # Kerykeion stores aspects in the subject object
        if hasattr(subject, 'aspects'):
            for aspect in subject.aspects:
                aspects.append({
                    'planet1': aspect['p1_name'],
                    'planet2': aspect['p2_name'],
                    'type': aspect['aspect'],
                    'angle': aspect['orbit'],
                    'orb': aspect['diff'],
                    'aid': aspect['aid']
                })
        
        return aspects
    
    @classmethod
    def create_synastry_chart(cls, person1_data: Dict, person2_data: Dict) -> Dict:
        """
        Create synastry (compatibility) chart between two people
        """
        # Create subjects from data
        subject1 = AstrologicalSubject(
            name=person1_data['name'],
            year=person1_data['year'],
            month=person1_data['month'],
            day=person1_data['day'],
            hour=person1_data['hour'],
            minute=person1_data['minute'],
            lat=person1_data['lat'],
            lng=person1_data['lng'],
            tz_str=person1_data['timezone'],
            city=person1_data['city']
        )
        
        subject2 = AstrologicalSubject(
            name=person2_data['name'],
            year=person2_data['year'],
            month=person2_data['month'],
            day=person2_data['day'],
            hour=person2_data['hour'],
            minute=person2_data['minute'],
            lat=person2_data['lat'],
            lng=person2_data['lng'],
            tz_str=person2_data['timezone'],
            city=person2_data['city']
        )
        
        # Calculate synastry aspects
        synastry = SynastryAspects(subject1, subject2)
        
        # Calculate relationship score (Discepolo method)
        score = RelationshipScore(subject1, subject2)
        
        # Generate synastry chart SVG
        chart = KerykeionChartSVG(subject1, "Synastry", subject2)
        svg_string = chart.makeTemplate()
        
        return {
            'svg_chart': svg_string,
            'synastry_aspects': synastry.all_aspects,
            'compatibility_score': score.score,
            'score_description': score.description,
            'relevant_aspects': synastry.relevant_aspects
        }
    
    @classmethod
    def save_user_chart(cls, user_id: str, chart_data: Dict) -> Dict:
        """Save generated chart to Supabase"""
        # Check if user already has a chart
        existing = supabase.table('user_charts').select('id').eq(
            'user_id', user_id
        ).execute()
        
        chart_record = {
            'user_id': user_id,
            'birth_date': chart_data['subject_data']['birth_date'],
            'birth_location': chart_data['subject_data']['location'],
            'julian_day': chart_data['subject_data']['julian_day'],
            'chart_data': chart_data['chart_data'],
            'svg_chart': chart_data['svg_chart']
        }
        
        if existing.data:
            # Update existing chart
            result = supabase.table('user_charts').update(chart_record).eq(
                'user_id', user_id
            ).execute()
        else:
            # Insert new chart
            result = supabase.table('user_charts').insert(chart_record).execute()
        
        return result.data[0] if result.data else None


# Validation function
def validate_kerykeion():
    """Test Kerykeion chart generation"""
    print("Testing Kerykeion chart generation...")
    
    service = ChartGeneratorService()
    
    # Test with Einstein's data
    chart = service.create_birth_chart(
        name="Albert Einstein",
        birth_date=datetime(1879, 3, 14, 11, 30),
        city="Ulm",
        country="Germany"
    )
    
    print(f"\nGenerated chart for: {chart['subject_data']['name']}")
    print(f"Location: {chart['subject_data']['location']['formatted_address']}")
    print(f"Timezone: {chart['subject_data']['location']['timezone']}")
    print(f"SVG Chart length: {len(chart['svg_chart'])} characters")
    
    print("\nPlanetary Positions:")
    for planet, data in chart['chart_data'].items():
        if isinstance(data, dict) and 'sign' in data:
            print(f"{planet.upper():12} {data['sign']:12} {data['degree']:.2f}°")
    
    print(f"\nFound {len(chart['aspects'])} aspects")
    
    # Test synastry
    print("\n\nTesting Synastry Chart...")
    person1 = {
        'name': 'Person 1',
        'year': 1990, 'month': 6, 'day': 15,
        'hour': 10, 'minute': 30,
        'lat': 40.7128, 'lng': -74.0060,
        'timezone': 'America/New_York',
        'city': 'New York'
    }
    
    person2 = {
        'name': 'Person 2',
        'year': 1992, 'month': 3, 'day': 20,
        'hour': 15, 'minute': 45,
        'lat': 51.5074, 'lng': -0.1278,
        'timezone': 'Europe/London',
        'city': 'London'
    }
    
    synastry = service.create_synastry_chart(person1, person2)
    print(f"Compatibility Score: {synastry['compatibility_score']}")
    print(f"Description: {synastry['score_description']}")
    print(f"Synastry aspects: {len(synastry['synastry_aspects'])}")


if __name__ == "__main__":
    validate_kerykeion()