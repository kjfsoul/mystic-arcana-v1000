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
import math
import logging

# Enhanced house calculation imports
try:
    import swisseph as swe
    SWISS_EPHEMERIS_AVAILABLE = True
    print("Swiss Ephemeris available for house calculations", file=sys.stderr)
except ImportError:
    SWISS_EPHEMERIS_AVAILABLE = False
    print("Swiss Ephemeris not available - using fallback calculations", file=sys.stderr)

# Initialize services
geolocator = Nominatim(user_agent="mystic_arcana_v1000")
tf = TimezoneFinder()

# House systems mapping
HOUSE_SYSTEMS = {
    'placidus': 'P',
    'koch': 'K', 
    'whole_sign': 'W',
    'equal': 'E',
    'campanus': 'C',
    'regiomontanus': 'R'
}

def calculate_placidus_houses(julian_day, latitude, longitude, house_system='placidus'):
    """
    Calculate house cusps using Placidus method with Swiss Ephemeris integration
    
    Parameters:
    - julian_day: Julian day number for the birth time
    - latitude: Birth latitude in decimal degrees
    - longitude: Birth longitude in decimal degrees  
    - house_system: House system to use ('placidus', 'koch', 'whole_sign', etc.)
    
    Returns:
    - Dictionary with house cusps and additional data
    """
    try:
        if SWISS_EPHEMERIS_AVAILABLE:
            return _calculate_houses_swiss_ephemeris(julian_day, latitude, longitude, house_system)
        else:
            return _calculate_houses_fallback(julian_day, latitude, longitude, house_system)
    except Exception as e:
        logging.error(f"House calculation error: {e}")
        return _calculate_houses_fallback(julian_day, latitude, longitude, house_system)

def _calculate_houses_swiss_ephemeris(julian_day, latitude, longitude, house_system):
    """Calculate houses using Swiss Ephemeris"""
    try:
        # Set ephemeris path (optional - uses built-in data if not set)
        swe.set_ephe_path(None)
        
        # Get house system flag
        hsys = HOUSE_SYSTEMS.get(house_system, 'P')  # Default to Placidus
        
        # Calculate houses
        # swe.houses() returns (cusps, ascmc)
        # cusps[1-12] are house cusps, ascmc[0] = Ascendant, ascmc[1] = MC
        cusps, ascmc = swe.houses(julian_day, latitude, longitude, hsys.encode('ascii'))
        
        # Calculate additional points
        armc = swe.sidtime(julian_day) + longitude / 15.0  # Right Ascension of MC
        
        # Extract key angles
        ascendant = ascmc[0]  # Ascendant (1st house cusp)
        midheaven = ascmc[1]  # Midheaven (10th house cusp) 
        descendant = (ascendant + 180.0) % 360.0  # Descendant (7th house cusp)
        imum_coeli = (midheaven + 180.0) % 360.0  # IC (4th house cusp)
        
        # Format house cusps (Swiss Ephemeris uses 1-based indexing)
        house_cusps = {}
        for i in range(1, 13):
            house_cusps[f'house_{i}'] = {
                'cusp_degree': cusps[i],
                'sign': _degree_to_sign(cusps[i]),
                'degree_in_sign': cusps[i] % 30.0
            }
        
        return {
            'success': True,
            'method': f'Swiss Ephemeris - {house_system.title()}',
            'house_cusps': house_cusps,
            'angles': {
                'ascendant': {
                    'degree': ascendant,
                    'sign': _degree_to_sign(ascendant),
                    'degree_in_sign': ascendant % 30.0
                },
                'midheaven': {
                    'degree': midheaven, 
                    'sign': _degree_to_sign(midheaven),
                    'degree_in_sign': midheaven % 30.0
                },
                'descendant': {
                    'degree': descendant,
                    'sign': _degree_to_sign(descendant),
                    'degree_in_sign': descendant % 30.0
                },
                'imum_coeli': {
                    'degree': imum_coeli,
                    'sign': _degree_to_sign(imum_coeli),
                    'degree_in_sign': imum_coeli % 30.0
                }
            },
            'metadata': {
                'julian_day': julian_day,
                'latitude': latitude,
                'longitude': longitude,
                'house_system': house_system,
                'armc': armc
            }
        }
        
    except Exception as e:
        logging.error(f"Swiss Ephemeris house calculation failed: {e}")
        return _calculate_houses_fallback(julian_day, latitude, longitude, house_system)

def _calculate_houses_fallback(julian_day, latitude, longitude, house_system):
    """Fallback house calculation using mathematical approximations"""
    try:
        # Calculate Local Sidereal Time
        gst = _julian_day_to_gst(julian_day)  # Greenwich Sidereal Time
        lst = gst + (longitude / 15.0)  # Local Sidereal Time
        lst = lst % 24.0
        
        # Convert to degrees  
        lst_degrees = lst * 15.0
        
        # Calculate ARMC (Right Ascension of Midheaven)
        armc = lst_degrees
        
        # Calculate Midheaven using spherical trigonometry
        lat_rad = math.radians(latitude)
        armc_rad = math.radians(armc)
        
        # MC longitude calculation
        mc_longitude = math.degrees(math.atan2(math.sin(armc_rad), 
                                             math.cos(armc_rad) * math.cos(lat_rad)))
        mc_longitude = (mc_longitude + 360.0) % 360.0
        
        # Calculate Ascendant using approximation
        # This is a simplified calculation - real Placidus requires iterative solutions
        obliquity = 23.43929  # Mean obliquity of ecliptic for J2000.0
        obl_rad = math.radians(obliquity)
        
        asc_longitude = math.degrees(math.atan2(math.cos(armc_rad), 
                                              -math.sin(obl_rad) * math.tan(lat_rad) + 
                                               math.cos(obl_rad) * math.sin(armc_rad)))
        asc_longitude = (asc_longitude + 360.0) % 360.0
        
        # Calculate other angles
        descendant = (asc_longitude + 180.0) % 360.0
        imum_coeli = (mc_longitude + 180.0) % 360.0
        
        # For Placidus system, calculate intermediate cusps
        # This is a simplified approximation - true Placidus requires complex calculations
        house_cusps = {}
        
        if house_system == 'placidus':
            # Approximate Placidus cusps using angular divisions
            cusps = _calculate_placidus_cusps_approximation(asc_longitude, mc_longitude, latitude)
        elif house_system == 'equal':
            # Equal house system - 30° intervals from Ascendant
            cusps = [(asc_longitude + i * 30.0) % 360.0 for i in range(12)]
        else:
            # Default to equal house for other systems
            cusps = [(asc_longitude + i * 30.0) % 360.0 for i in range(12)]
        
        # Format house cusps
        for i in range(12):
            house_cusps[f'house_{i+1}'] = {
                'cusp_degree': cusps[i],
                'sign': _degree_to_sign(cusps[i]), 
                'degree_in_sign': cusps[i] % 30.0
            }
        
        return {
            'success': True,
            'method': f'Mathematical Fallback - {house_system.title()}',
            'house_cusps': house_cusps,
            'angles': {
                'ascendant': {
                    'degree': asc_longitude,
                    'sign': _degree_to_sign(asc_longitude),
                    'degree_in_sign': asc_longitude % 30.0
                },
                'midheaven': {
                    'degree': mc_longitude,
                    'sign': _degree_to_sign(mc_longitude), 
                    'degree_in_sign': mc_longitude % 30.0
                },
                'descendant': {
                    'degree': descendant,
                    'sign': _degree_to_sign(descendant),
                    'degree_in_sign': descendant % 30.0
                },
                'imum_coeli': {
                    'degree': imum_coeli,
                    'sign': _degree_to_sign(imum_coeli),
                    'degree_in_sign': imum_coeli % 30.0
                }
            },
            'metadata': {
                'julian_day': julian_day,
                'latitude': latitude,
                'longitude': longitude,
                'house_system': house_system,
                'armc': armc,
                'fallback_mode': True
            }
        }
        
    except Exception as e:
        logging.error(f"Fallback house calculation failed: {e}")
        # Emergency fallback - equal houses from 0° Aries
        return _emergency_house_fallback()

def _calculate_placidus_cusps_approximation(asc, mc, latitude):
    """Approximate Placidus cusp calculation"""
    cusps = [0.0] * 12
    
    # Fixed angles
    cusps[0] = asc  # 1st house (Ascendant)
    cusps[3] = (mc + 180.0) % 360.0  # 4th house (IC)
    cusps[6] = (asc + 180.0) % 360.0  # 7th house (Descendant) 
    cusps[9] = mc  # 10th house (MC)
    
    # Intermediate cusps - simplified approximation
    # In true Placidus, these require iterative calculation of trisection points
    lat_factor = abs(latitude) / 90.0  # Latitude adjustment factor
    
    # Houses 2, 3 (morning houses)
    house_arc_23 = ((cusps[3] - cusps[0]) + 360.0) % 360.0 / 3.0
    cusps[1] = (cusps[0] + house_arc_23 * (1 + lat_factor * 0.1)) % 360.0
    cusps[2] = (cusps[0] + house_arc_23 * (2 + lat_factor * 0.2)) % 360.0
    
    # Houses 5, 6 (afternoon houses)  
    house_arc_56 = ((cusps[6] - cusps[3]) + 360.0) % 360.0 / 3.0
    cusps[4] = (cusps[3] + house_arc_56 * (1 + lat_factor * 0.1)) % 360.0
    cusps[5] = (cusps[3] + house_arc_56 * (2 + lat_factor * 0.2)) % 360.0
    
    # Houses 8, 9 (evening houses)
    house_arc_89 = ((cusps[9] - cusps[6]) + 360.0) % 360.0 / 3.0
    cusps[7] = (cusps[6] + house_arc_89 * (1 + lat_factor * 0.1)) % 360.0
    cusps[8] = (cusps[6] + house_arc_89 * (2 + lat_factor * 0.2)) % 360.0
    
    # Houses 11, 12 (night houses)
    house_arc_1112 = ((cusps[0] - cusps[9]) + 360.0) % 360.0 / 3.0
    cusps[10] = (cusps[9] + house_arc_1112 * (1 + lat_factor * 0.1)) % 360.0
    cusps[11] = (cusps[9] + house_arc_1112 * (2 + lat_factor * 0.2)) % 360.0
    
    return cusps

def _julian_day_to_gst(julian_day):
    """Convert Julian Day to Greenwich Sidereal Time"""
    # J2000.0
    j2000 = 2451545.0
    
    # Days since J2000.0
    t = (julian_day - j2000) / 36525.0
    
    # Greenwich Sidereal Time at 0h UT
    gst0 = 6.697374558 + 2400.051336 * t + 0.000025862 * t * t
    
    # Reduce to 0-24 hours
    gst0 = gst0 % 24.0
    
    # For simplicity, assume we want GST at the exact time
    # In practice, we'd need to add the UT fraction of the day
    fraction = (julian_day % 1.0)
    gst = gst0 + fraction * 24.0 * 1.00273790935  # Sidereal day conversion
    
    return gst % 24.0

def _degree_to_sign(degree):
    """Convert ecliptic longitude to zodiac sign"""
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
             'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    sign_index = int((degree % 360.0) // 30)
    return signs[sign_index]

def _emergency_house_fallback():
    """Emergency fallback - simple equal houses from 0° Aries"""
    house_cusps = {}
    for i in range(12):
        degree = i * 30.0
        house_cusps[f'house_{i+1}'] = {
            'cusp_degree': degree,
            'sign': _degree_to_sign(degree),
            'degree_in_sign': degree % 30.0
        }
    
    return {
        'success': False,
        'method': 'Emergency Fallback - Equal Houses from 0° Aries',
        'house_cusps': house_cusps,
        'angles': {
            'ascendant': {'degree': 0.0, 'sign': 'Aries', 'degree_in_sign': 0.0},
            'midheaven': {'degree': 270.0, 'sign': 'Capricorn', 'degree_in_sign': 0.0},
            'descendant': {'degree': 180.0, 'sign': 'Libra', 'degree_in_sign': 0.0},
            'imum_coeli': {'degree': 90.0, 'sign': 'Cancer', 'degree_in_sign': 0.0}
        },
        'metadata': {
            'fallback_mode': True,
            'emergency_mode': True
        }
    }

def create_enhanced_houses(subject):
    """Create enhanced house data using Placidus calculations with fallback"""
    try:
        # Calculate Placidus houses using the enhanced system
        house_data = calculate_placidus_houses(
            subject.julian_day,
            subject.lat,
            subject.lng,
            'placidus'
        )
        
        # Merge with existing Kerykeion house data as fallback
        kerykeion_houses = {
            'ascendant': {'sign': subject.first_house.sign, 'degree': float(subject.first_house.position)},
            'midheaven': {'sign': subject.tenth_house.sign, 'degree': float(subject.tenth_house.position)},
            'house_count': 12,
            'method': 'Kerykeion Default'
        }
        
        if house_data['success']:
            # Use enhanced calculations
            return {
                **house_data,
                'kerykeion_fallback': kerykeion_houses,
                'house_count': 12
            }
        else:
            # Use Kerykeion as fallback
            return {
                **kerykeion_houses,
                'enhanced_calculation_failed': True,
                'error': 'Enhanced house calculation failed, using Kerykeion fallback'
            }
            
    except Exception as e:
        # Emergency fallback to Kerykeion
        logging.error(f"Enhanced house creation failed: {e}")
        return {
            'ascendant': {'sign': subject.first_house.sign, 'degree': float(subject.first_house.position)},
            'midheaven': {'sign': subject.tenth_house.sign, 'degree': float(subject.tenth_house.position)},
            'house_count': 12,
            'method': 'Kerykeion Emergency Fallback',
            'error': str(e)
        }

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
        'houses': create_enhanced_houses(subject),
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
            
        elif action == 'placidus-houses':
            # Direct house calculation for testing
            result = calculate_placidus_houses(
                data['julian_day'],
                data['latitude'],
                data['longitude'],
                data.get('house_system', 'placidus')
            )
            print(json.dumps({'success': True, 'data': result}))
            
        else:
            print(json.dumps({'success': False, 'error': f'Unknown action: {action}'}))
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()