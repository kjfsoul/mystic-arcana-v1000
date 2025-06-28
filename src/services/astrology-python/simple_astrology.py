#!/usr/bin/env python3
"""
Simplified astrology service without Supabase dependency
Uses Kerykeion for calculations and chart generation
"""

from kerykeion import AstrologicalSubject, KerykeionChartSVG, SynastryAspects
from geopy.geocoders import Nominatim
from timezonefinder import TimezoneFinder
from datetime import datetime
import json
import sys

# Initialize services
geolocator = Nominatim(user_agent="mystic_arcana_v1000")
tf = TimezoneFinder()

def geocode_location(city, country=""):
    """Geocode city to coordinates"""
    search_query = f"{city}, {country}".strip(", ")
    
    try:
        location = geolocator.geocode(search_query, exactly_one=True, language='en')
        if not location:
            raise ValueError(f"Location not found: {search_query}")
        
        # Get timezone
        timezone = tf.timezone_at(lat=location.latitude, lng=location.longitude)
        if not timezone:
            timezone = 'UTC'
        
        return {
            'lat': location.latitude,
            'lng': location.longitude,
            'timezone': timezone,
            'formatted_address': location.address,
            'city': city,
            'country': country
        }
        
    except Exception as e:
        raise ValueError(f"Geocoding error for {search_query}: {str(e)}")

def create_birth_chart(name, birth_date, city, country=""):
    """Create birth chart using Kerykeion"""
    
    # Parse birth date if it's a string
    if isinstance(birth_date, str):
        birth_date = datetime.fromisoformat(birth_date.replace('Z', '+00:00'))
    
    # Create Kerykeion subject with automatic geocoding
    subject = AstrologicalSubject(
        name=name,
        year=birth_date.year,
        month=birth_date.month,
        day=birth_date.day,
        hour=birth_date.hour,
        minute=birth_date.minute,
        city=f"{city}, {country}".strip(", ")
    )
    
    # Generate SVG chart
    chart = KerykeionChartSVG(subject)
    svg_string = chart.makeTemplate()
    
    # Extract detailed chart data
    chart_data = {
        'planets': {
            'sun': {'sign': subject.sun.sign, 'degree': float(subject.sun.position), 'retrograde': bool(subject.sun.retrograde)},
            'moon': {'sign': subject.moon.sign, 'degree': float(subject.moon.position), 'retrograde': bool(subject.moon.retrograde)},
            'mercury': {'sign': subject.mercury.sign, 'degree': float(subject.mercury.position), 'retrograde': bool(subject.mercury.retrograde)},
            'venus': {'sign': subject.venus.sign, 'degree': float(subject.venus.position), 'retrograde': bool(subject.venus.retrograde)},
            'mars': {'sign': subject.mars.sign, 'degree': float(subject.mars.position), 'retrograde': bool(subject.mars.retrograde)},
            'jupiter': {'sign': subject.jupiter.sign, 'degree': float(subject.jupiter.position), 'retrograde': bool(subject.jupiter.retrograde)},
            'saturn': {'sign': subject.saturn.sign, 'degree': float(subject.saturn.position), 'retrograde': bool(subject.saturn.retrograde)},
            'uranus': {'sign': subject.uranus.sign, 'degree': float(subject.uranus.position), 'retrograde': bool(subject.uranus.retrograde)},
            'neptune': {'sign': subject.neptune.sign, 'degree': float(subject.neptune.position), 'retrograde': bool(subject.neptune.retrograde)},
            'pluto': {'sign': subject.pluto.sign, 'degree': float(subject.pluto.position), 'retrograde': bool(subject.pluto.retrograde)},
            'chiron': {'sign': subject.chiron.sign, 'degree': float(subject.chiron.position), 'retrograde': bool(subject.chiron.retrograde)}
        },
        'houses': {
            'ascendant': {'sign': subject.first_house.sign, 'degree': float(subject.first_house.position)},
            'midheaven': {'sign': subject.tenth_house.sign, 'degree': float(subject.tenth_house.position)},
            'house_count': 12  # Simplified
        },
        'aspects': extract_aspects(subject)
    }
    
    return {
        'subject_data': {
            'name': name,
            'birth_date': birth_date.isoformat(),
            'location': {
                'lat': subject.lat,
                'lng': subject.lng,
                'timezone': subject.tz_str,
                'city': subject.city,
                'formatted_address': f"{subject.city}, {subject.nation}"
            },
            'julian_day': subject.julian_day
        },
        'svg_chart': svg_string,
        'chart_data': chart_data
    }

def extract_aspects(subject):
    """Extract aspect data from Kerykeion subject"""
    aspects = []
    
    # Kerykeion automatically calculates aspects
    # We can access them through the subject's aspect methods
    try:
        # This is a simplified version - Kerykeion has more detailed aspect data
        # but it requires more complex extraction
        aspects.append({
            'note': 'Aspects calculated by Kerykeion',
            'count': 'See SVG chart for visual representation'
        })
    except:
        pass
    
    return aspects

def create_synastry_chart(person1_data, person2_data):
    """Create synastry chart between two people"""
    
    # Create subjects
    subject1 = AstrologicalSubject(
        name=person1_data['name'],
        year=person1_data['year'],
        month=person1_data['month'],
        day=person1_data['day'],
        hour=person1_data['hour'],
        minute=person1_data['minute'],
        city=f"{person1_data['city']}, {person1_data.get('country', '')}"
    )
    
    subject2 = AstrologicalSubject(
        name=person2_data['name'],
        year=person2_data['year'],
        month=person2_data['month'],
        day=person2_data['day'],
        hour=person2_data['hour'],
        minute=person2_data['minute'],
        city=f"{person2_data['city']}, {person2_data.get('country', '')}"
    )
    
    # Calculate synastry aspects
    synastry = SynastryAspects(subject1, subject2)
    
    # Generate synastry chart SVG
    chart = KerykeionChartSVG(subject1, "Synastry", subject2)
    svg_string = chart.makeTemplate()
    
    return {
        'svg_chart': svg_string,
        'synastry_aspects': synastry.all_aspects,
        'compatibility_score': 75,  # Placeholder - would need proper calculation
        'score_description': 'Good compatibility',
        'person1': subject1.name,
        'person2': subject2.name
    }

def get_current_transits():
    """Get current planetary positions"""
    now = datetime.now()
    
    # Create a subject for current moment
    transit_subject = AstrologicalSubject(
        name="Current Transits",
        year=now.year,
        month=now.month,
        day=now.day,
        hour=now.hour,
        minute=now.minute,
        city="London, UK"  # Default location for transits
    )
    
    return {
        'timestamp': now.isoformat(),
        'planets': {
            'sun': {'sign': transit_subject.sun['sign'], 'degree': transit_subject.sun['position']},
            'moon': {'sign': transit_subject.moon['sign'], 'degree': transit_subject.moon['position']},
            'mercury': {'sign': transit_subject.mercury['sign'], 'degree': transit_subject.mercury['position']},
            'venus': {'sign': transit_subject.venus['sign'], 'degree': transit_subject.venus['position']},
            'mars': {'sign': transit_subject.mars['sign'], 'degree': transit_subject.mars['position']},
            'jupiter': {'sign': transit_subject.jupiter['sign'], 'degree': transit_subject.jupiter['position']},
            'saturn': {'sign': transit_subject.saturn['sign'], 'degree': transit_subject.saturn['position']},
            'uranus': {'sign': transit_subject.uranus['sign'], 'degree': transit_subject.uranus['position']},
            'neptune': {'sign': transit_subject.neptune['sign'], 'degree': transit_subject.neptune['position']},
            'pluto': {'sign': transit_subject.pluto['sign'], 'degree': transit_subject.pluto['position']}
        }
    }

def main():
    """Main entry point for API calls"""
    if len(sys.argv) < 2:
        print(json.dumps({'success': False, 'error': 'No action specified'}))
        sys.exit(1)
    
    action = sys.argv[1]
    
    # Parse data if provided
    data = None
    if len(sys.argv) > 2:
        try:
            data = json.loads(sys.argv[2])
        except json.JSONDecodeError as e:
            print(json.dumps({'success': False, 'error': f'Invalid JSON: {str(e)}'}))
            sys.exit(1)
    
    try:
        if action == 'birth-chart':
            result = create_birth_chart(
                data['name'],
                data['birthDate'],
                data['city'],
                data.get('country', '')
            )
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'synastry':
            result = create_synastry_chart(data['person1'], data['person2'])
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'transits':
            result = get_current_transits()
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'geocode':
            result = geocode_location(data['city'], data.get('country', ''))
            print(json.dumps({'success': True, 'data': result}))
            
        else:
            print(json.dumps({'success': False, 'error': f'Unknown action: {action}'}))
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()