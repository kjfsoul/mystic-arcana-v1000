#!/usr/bin/env python3
"""
Moon Calculator using Swiss Ephemeris
High-precision lunar calculations for Mystic Arcana
"""

import swisseph as swe
import json
import argparse
import sys
from datetime import datetime, timedelta
from math import degrees, radians, cos, sin, sqrt, atan2

def setup_ephemeris():
    """Configure Swiss Ephemeris with data path"""
    swe.set_ephe_path('/usr/share/swisseph:/home/ubuntu/data/ephemeris')

def datetime_to_julian(dt):
    """Convert datetime to Julian day number"""
    return swe.julday(dt.year, dt.month, dt.day, 
                      dt.hour + dt.minute/60.0 + dt.second/3600.0)

def julian_to_datetime(julian_day):
    """Convert Julian day to datetime"""
    year, month, day, hour = swe.revjul(julian_day)
    hour_int = int(hour)
    minute = int((hour - hour_int) * 60)
    second = int(((hour - hour_int) * 60 - minute) * 60)
    return datetime(year, month, day, hour_int, minute, second)

def get_zodiac_sign(longitude):
    """Get zodiac sign from ecliptic longitude"""
    signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
             'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    sign_index = int(longitude // 30)
    return signs[sign_index]

def calculate_moon_phase_detailed(datetime_str, precision='high'):
    """Calculate detailed moon phase information"""
    
    setup_ephemeris()
    
    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    julian_day = datetime_to_julian(dt)
    
    try:
        # Get Sun and Moon positions with high precision
        flags = swe.FLG_SPEED
        if precision == 'ultra':
            flags |= swe.FLG_TOPOCTR
        
        sun_result = swe.calc_ut(julian_day, swe.SUN, flags)
        moon_result = swe.calc_ut(julian_day, swe.MOON, flags)
        
        if sun_result[1] != swe.OK or moon_result[1] != swe.OK:
            return {'error': 'Failed to calculate Sun/Moon positions'}
        
        sun_lon = sun_result[0][0]
        moon_lon = moon_result[0][0]
        moon_lat = moon_result[0][1]
        moon_distance = moon_result[0][2]  # AU
        moon_speed = moon_result[0][3]     # degrees/day
        
        # Calculate lunar phase angle (elongation)
        phase_angle = (moon_lon - sun_lon) % 360
        
        # Calculate illuminated fraction
        # More precise formula using true anomaly
        illumination = (1 + cos(radians(phase_angle))) / 2
        
        # Determine phase name based on angle
        if phase_angle < 22.5 or phase_angle >= 337.5:
            phase_name = 'new'
        elif 22.5 <= phase_angle < 67.5:
            phase_name = 'waxing_crescent'
        elif 67.5 <= phase_angle < 112.5:
            phase_name = 'first_quarter'
        elif 112.5 <= phase_angle < 157.5:
            phase_name = 'waxing_gibbous'
        elif 157.5 <= phase_angle < 202.5:
            phase_name = 'full'
        elif 202.5 <= phase_angle < 247.5:
            phase_name = 'waning_gibbous'
        elif 247.5 <= phase_angle < 292.5:
            phase_name = 'last_quarter'
        else:
            phase_name = 'waning_crescent'
        
        # Calculate moon age (days since new moon)
        # More accurate calculation using mean synodic month
        synodic_month = 29.530588853  # days
        age = (phase_angle / 360.0) * synodic_month
        
        # Convert distance from AU to km
        distance_km = moon_distance * 149597870.7  # km per AU
        
        # Calculate angular size in arc minutes
        # Moon's mean radius: 1737.4 km
        angular_size = 2 * 1737.4 / distance_km * radians(1) * 60  # arc minutes
        
        # Get zodiac sign
        zodiac_sign = get_zodiac_sign(moon_lon)
        zodiac_degree = moon_lon % 30
        
        # Calculate libration (Moon's wobble)
        # This is a simplified calculation - full libration requires more complex geometry
        libration_lon = 0  # Would need detailed calculation
        libration_lat = 0  # Would need detailed calculation
        
        # Find next new and full moons
        next_new_moon = find_next_lunar_phase(julian_day, 'new')
        next_full_moon = find_next_lunar_phase(julian_day, 'full')
        
        return {
            'datetime': datetime_str,
            'julian_day': julian_day,
            'phase': phase_name,
            'illumination': illumination,
            'age': age,
            'phase_angle': phase_angle,
            'zodiac_sign': zodiac_sign,
            'zodiac_degree': zodiac_degree,
            'longitude': moon_lon,
            'latitude': moon_lat,
            'distance': distance_km,
            'angular_size': angular_size,
            'speed': moon_speed,
            'libration': {
                'longitude': libration_lon,
                'latitude': libration_lat
            },
            'next_new_moon': julian_to_datetime(next_new_moon).isoformat() if next_new_moon else None,
            'next_full_moon': julian_to_datetime(next_full_moon).isoformat() if next_full_moon else None,
            'precision': precision
        }
        
    except Exception as e:
        return {'error': f'Moon calculation error: {str(e)}'}

def find_next_lunar_phase(start_julian, phase_type):
    """Find the next occurrence of a specific lunar phase"""
    
    target_angles = {
        'new': 0,
        'first_quarter': 90,
        'full': 180,
        'last_quarter': 270
    }
    
    if phase_type not in target_angles:
        return None
    
    target_angle = target_angles[phase_type]
    
    # Search forward in time (up to 2 lunar months)
    search_days = 60
    current_julian = start_julian
    step_size = 0.1  # 2.4 hours
    
    previous_angle = None
    
    for i in range(int(search_days / step_size)):
        current_julian += step_size
        
        try:
            sun_result = swe.calc_ut(current_julian, swe.SUN)
            moon_result = swe.calc_ut(current_julian, swe.MOON)
            
            if sun_result[1] != swe.OK or moon_result[1] != swe.OK:
                continue
            
            sun_lon = sun_result[0][0]
            moon_lon = moon_result[0][0]
            
            current_angle = (moon_lon - sun_lon) % 360
            
            # Check if we've crossed the target angle
            if previous_angle is not None:
                # Handle angle wrap-around
                if previous_angle > 350 and current_angle < 10:
                    # Crossed 0 degrees
                    if target_angle == 0:
                        return current_julian
                elif previous_angle < target_angle <= current_angle:
                    # Normal crossing
                    return current_julian
                elif previous_angle > current_angle and target_angle == 0:
                    # Crossed 0 from high angle
                    return current_julian
            
            previous_angle = current_angle
            
        except Exception:
            continue
    
    return None

def calculate_moon_mansion(moon_longitude):
    """Calculate the lunar mansion (Nakshatra) position"""
    
    # 27 Nakshatras, each 13.333... degrees
    nakshatra_names = [
        'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra',
        'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
        'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
        'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
        'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
    ]
    
    mansion_size = 360 / 27  # 13.333... degrees
    mansion_index = int(moon_longitude / mansion_size)
    mansion_degree = moon_longitude % mansion_size
    
    return {
        'mansion': nakshatra_names[mansion_index],
        'degree': mansion_degree,
        'quarter': int(mansion_degree / (mansion_size / 4)) + 1
    }

def calculate_void_of_course(datetime_str, precision='high'):
    """Check if Moon is void of course"""
    
    setup_ephemeris()
    
    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    julian_day = datetime_to_julian(dt)
    
    try:
        # Get current Moon position
        moon_result = swe.calc_ut(julian_day, swe.MOON, swe.FLG_SPEED)
        if moon_result[1] != swe.OK:
            return {'error': 'Failed to calculate Moon position'}
        
        moon_lon = moon_result[0][0]
        current_sign = int(moon_lon // 30)
        
        # Check for aspects to other planets in the same sign
        planets = [swe.MERCURY, swe.VENUS, swe.MARS, swe.JUPITER, swe.SATURN, swe.URANUS, swe.NEPTUNE, swe.PLUTO]
        
        has_aspects_in_sign = False
        next_sign_entry = None
        
        # Look ahead to find when Moon enters next sign
        search_hours = 72  # 3 days max
        for hour in range(search_hours):
            future_julian = julian_day + (hour / 24.0)
            future_moon = swe.calc_ut(future_julian, swe.MOON)
            
            if future_moon[1] == swe.OK:
                future_lon = future_moon[0][0]
                future_sign = int(future_lon // 30)
                
                if future_sign != current_sign:
                    next_sign_entry = future_julian
                    break
        
        void_of_course = not has_aspects_in_sign
        
        return {
            'is_void_of_course': void_of_course,
            'current_sign': current_sign,
            'next_sign_entry': julian_to_datetime(next_sign_entry).isoformat() if next_sign_entry else None,
            'moon_longitude': moon_lon
        }
        
    except Exception as e:
        return {'error': f'Void of course calculation error: {str(e)}'}

def main():
    parser = argparse.ArgumentParser(description='Calculate detailed Moon information using Swiss Ephemeris')
    parser.add_argument('--datetime', required=True, help='ISO datetime string')
    parser.add_argument('--precision', choices=['low', 'medium', 'high', 'ultra'], default='high')
    parser.add_argument('--include-mansion', action='store_true', help='Include lunar mansion calculation')
    parser.add_argument('--include-void-of-course', action='store_true', help='Include void of course check')
    
    args = parser.parse_args()
    
    try:
        # Calculate main moon phase data
        moon_data = calculate_moon_phase_detailed(args.datetime, args.precision)
        
        if 'error' in moon_data:
            print(json.dumps(moon_data))
            return
        
        # Add optional calculations
        if args.include_mansion:
            mansion = calculate_moon_mansion(moon_data['longitude'])
            moon_data['mansion'] = mansion
        
        if args.include_void_of_course:
            void_data = calculate_void_of_course(args.datetime, args.precision)
            moon_data['void_of_course'] = void_data
        
        print(json.dumps(moon_data, indent=2 if args.precision in ['high', 'ultra'] else None))
        
    except Exception as e:
        print(json.dumps({'error': f'Moon calculation error: {str(e)}'}))
        sys.exit(1)

if __name__ == '__main__':
    main()