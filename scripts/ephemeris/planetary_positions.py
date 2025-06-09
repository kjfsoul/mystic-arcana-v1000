#!/usr/bin/env python3
"""
Planetary Position Calculator using Swiss Ephemeris
Provides high-precision planetary positions for Mystic Arcana
"""

import swisseph as swe
import json
import argparse
import sys
from datetime import datetime
from math import degrees, radians, sin, cos, atan2, sqrt

# Planet constants for Swiss Ephemeris
PLANETS = {
    'sun': swe.SUN,
    'moon': swe.MOON,
    'mercury': swe.MERCURY,
    'venus': swe.VENUS,
    'mars': swe.MARS,
    'jupiter': swe.JUPITER,
    'saturn': swe.SATURN,
    'uranus': swe.URANUS,
    'neptune': swe.NEPTUNE,
    'pluto': swe.PLUTO,
    'north_node': swe.TRUE_NODE,
    'south_node': swe.TRUE_NODE,  # Will be calculated as opposite
    'chiron': swe.CHIRON,
    'lilith': swe.MEAN_APOG
}

ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

PLANET_SYMBOLS = {
    'sun': '☉', 'moon': '☽', 'mercury': '☿', 'venus': '♀', 'mars': '♂',
    'jupiter': '♃', 'saturn': '♄', 'uranus': '♅', 'neptune': '♆',
    'pluto': '♇', 'north_node': '☊', 'south_node': '☋',
    'chiron': '⚷', 'lilith': '⚸'
}

def setup_ephemeris():
    """Configure Swiss Ephemeris with data path"""
    # Set ephemeris data path
    swe.set_ephe_path('/usr/share/swisseph:/home/ubuntu/data/ephemeris')
    
def datetime_to_julian(dt):
    """Convert datetime to Julian day number"""
    return swe.julday(dt.year, dt.month, dt.day, 
                      dt.hour + dt.minute/60.0 + dt.second/3600.0)

def get_zodiac_info(longitude):
    """Get zodiac sign and degree from ecliptic longitude"""
    sign_index = int(longitude // 30)
    degree = longitude % 30
    sign = ZODIAC_SIGNS[sign_index]
    return sign, degree

def calculate_house_system(julian_day, latitude, longitude, house_system='P'):
    """Calculate astrological houses"""
    try:
        houses, ascmc = swe.houses(julian_day, latitude, longitude, house_system.encode())
        return {
            'houses': list(houses),
            'ascendant': ascmc[0],
            'midheaven': ascmc[1],
            'armc': ascmc[2],
            'vertex': ascmc[3],
            'equatorial_ascendant': ascmc[4],
            'co_ascendant': ascmc[5]
        }
    except Exception as e:
        print(f"House calculation error: {e}", file=sys.stderr)
        return None

def get_planet_house(planet_longitude, houses):
    """Determine which house a planet is in"""
    if not houses or len(houses['houses']) < 12:
        return None
    
    house_cusps = houses['houses']
    
    # Find which house the planet is in
    for i in range(12):
        cusp_start = house_cusps[i]
        cusp_end = house_cusps[(i + 1) % 12]
        
        # Handle zodiac wrap-around
        if cusp_start > cusp_end:  # House crosses 0° Aries
            if planet_longitude >= cusp_start or planet_longitude < cusp_end:
                return i + 1
        else:
            if cusp_start <= planet_longitude < cusp_end:
                return i + 1
    
    return 1  # Default to first house

def is_retrograde(planet_code, julian_day):
    """Check if planet is retrograde by comparing speeds"""
    try:
        # Calculate position at current time
        current = swe.calc_ut(julian_day, planet_code, swe.FLG_SPEED)
        if current[1] != swe.OK:
            return False
        
        # Speed is in longitude degrees per day
        longitude_speed = current[0][3]  # Daily motion in longitude
        
        # Planet is retrograde if longitude speed is negative
        return longitude_speed < 0
        
    except Exception:
        return False

def calculate_planetary_positions(datetime_str, latitude, longitude, planets_list, 
                                precision='high', include_retrograde=False, 
                                calculate_aspects=False, include_houses=False,
                                heliocentric=False):
    """Calculate positions for specified planets"""
    
    setup_ephemeris()
    
    try:
        dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
        julian_day = datetime_to_julian(dt)
        
        # Calculate houses if requested
        houses = None
        if include_houses:
            houses = calculate_house_system(julian_day, latitude, longitude)
        
        results = {
            'timestamp': datetime_str,
            'julian_day': julian_day,
            'location': {'latitude': latitude, 'longitude': longitude},
            'planets': [],
            'houses': houses,
            'precision': precision
        }
        
        # Set calculation flags based on precision
        flags = swe.FLG_SPEED  # Always include speed
        if precision == 'ultra':
            flags |= swe.FLG_TOPOCTR  # Topocentric
        if heliocentric:
            flags |= swe.FLG_HELCTR
        
        for planet_name in planets_list:
            if planet_name not in PLANETS:
                continue
                
            planet_code = PLANETS[planet_name]
            
            try:
                # Calculate planet position
                result = swe.calc_ut(julian_day, planet_code, flags)
                
                if result[1] != swe.OK:
                    print(f"Calculation failed for {planet_name}: {result[1]}", file=sys.stderr)
                    continue
                
                longitude = result[0][0]
                latitude_ecl = result[0][1]
                distance = result[0][2]
                longitude_speed = result[0][3]
                latitude_speed = result[0][4]
                distance_speed = result[0][5]
                
                # Handle south node (opposite of north node)
                if planet_name == 'south_node':
                    longitude = (longitude + 180) % 360
                
                # Get zodiac sign and degree
                zodiac_sign, zodiac_degree = get_zodiac_info(longitude)
                
                # Calculate equatorial coordinates (RA/Dec)
                equatorial = swe.cotrans(longitude, latitude_ecl, 1.0, -swe.get_ayanamsa(julian_day))
                ra = equatorial[0]
                dec = equatorial[1]
                
                # Check retrograde status
                retrograde = False
                if include_retrograde:
                    retrograde = is_retrograde(planet_code, julian_day)
                
                # Calculate house position
                house = None
                if houses:
                    house = get_planet_house(longitude, houses)
                
                # Get additional planet info
                magnitude = None
                phase = None
                angular_size = None
                
                # For visible planets, get visual magnitude and phase
                if planet_name in ['mercury', 'venus', 'mars', 'jupiter', 'saturn']:
                    try:
                        vis_data = swe.vis_limit_mag(julian_day, [longitude, latitude], [0, 0], [0, 0, 0, 0], 0, planet_code)
                        if vis_data[1] == swe.OK:
                            magnitude = vis_data[0]
                    except:
                        pass
                
                # For Moon, calculate phase
                if planet_name == 'moon':
                    sun_result = swe.calc_ut(julian_day, swe.SUN, flags)
                    if sun_result[1] == swe.OK:
                        sun_longitude = sun_result[0][0]
                        moon_phase_angle = abs(longitude - sun_longitude)
                        if moon_phase_angle > 180:
                            moon_phase_angle = 360 - moon_phase_angle
                        phase = (1 + cos(radians(moon_phase_angle))) / 2
                
                planet_data = {
                    'name': planet_name,
                    'symbol': PLANET_SYMBOLS.get(planet_name, '?'),
                    'longitude': longitude,
                    'latitude': latitude_ecl,
                    'distance': distance,
                    'ra': ra,
                    'dec': dec,
                    'speed': longitude_speed,
                    'latitude_speed': latitude_speed,
                    'distance_speed': distance_speed,
                    'zodiac_sign': zodiac_sign,
                    'zodiac_degree': zodiac_degree,
                    'house': house,
                    'retrograde': retrograde,
                    'magnitude': magnitude,
                    'phase': phase,
                    'angular_size': angular_size
                }
                
                results['planets'].append(planet_data)
                
            except Exception as e:
                print(f"Error calculating {planet_name}: {e}", file=sys.stderr)
                continue
        
        return results
        
    except Exception as e:
        print(f"Planetary calculation error: {e}", file=sys.stderr)
        return {'error': str(e)}

def main():
    parser = argparse.ArgumentParser(description='Calculate planetary positions using Swiss Ephemeris')
    parser.add_argument('--datetime', required=True, help='ISO datetime string')
    parser.add_argument('--latitude', type=float, required=True, help='Observer latitude')
    parser.add_argument('--longitude', type=float, required=True, help='Observer longitude')
    parser.add_argument('--planets', required=True, help='Comma-separated list of planets')
    parser.add_argument('--precision', choices=['low', 'medium', 'high', 'ultra'], default='high')
    parser.add_argument('--include-retrograde', action='store_true')
    parser.add_argument('--calculate-aspects', action='store_true')
    parser.add_argument('--include-houses', action='store_true')
    parser.add_argument('--heliocentric', action='store_true')
    
    args = parser.parse_args()
    
    planets_list = [p.strip().lower() for p in args.planets.split(',')]
    
    result = calculate_planetary_positions(
        args.datetime, args.latitude, args.longitude, planets_list,
        args.precision, args.include_retrograde, args.calculate_aspects,
        args.include_houses, args.heliocentric
    )
    
    print(json.dumps(result, indent=2 if args.precision in ['high', 'ultra'] else None))

if __name__ == '__main__':
    main()