#!/usr/bin/env python3
"""
Retrograde Motion Detector using Swiss Ephemeris
Detects and analyzes retrograde periods for planetary bodies
"""

import swisseph as swe
import json
import argparse
import sys
from datetime import datetime, timedelta
from math import degrees

# Planet constants
PLANETS = {
    'mercury': swe.MERCURY,
    'venus': swe.VENUS, 
    'mars': swe.MARS,
    'jupiter': swe.JUPITER,
    'saturn': swe.SATURN,
    'uranus': swe.URANUS,
    'neptune': swe.NEPTUNE,
    'pluto': swe.PLUTO
}

ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

# Retrograde shadow period lengths (days before/after station)
SHADOW_PERIODS = {
    'mercury': 14,
    'venus': 21,
    'mars': 30,
    'jupiter': 45,
    'saturn': 60,
    'uranus': 90,
    'neptune': 120,
    'pluto': 150
}

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

def get_zodiac_info(longitude):
    """Get zodiac sign and degree from ecliptic longitude"""
    sign_index = int(longitude // 30)
    degree = longitude % 30
    sign = ZODIAC_SIGNS[sign_index]
    return sign, degree

def get_planet_motion_data(planet_code, julian_day):
    """Get planet position and speed data"""
    try:
        result = swe.calc_ut(julian_day, planet_code, swe.FLG_SPEED)
        if result[1] == swe.OK:
            return {
                'longitude': result[0][0],
                'latitude': result[0][1], 
                'distance': result[0][2],
                'longitude_speed': result[0][3],  # degrees per day
                'latitude_speed': result[0][4],
                'distance_speed': result[0][5],
                'success': True
            }
    except Exception as e:
        print(f"Motion calculation error: {e}", file=sys.stderr)
    
    return {'success': False}

def find_station_point(planet_code, start_julian, end_julian, is_retrograde_station=True):
    """
    Find the exact moment when a planet stations (speed = 0)
    is_retrograde_station: True for direct->retrograde, False for retrograde->direct
    """
    
    # Binary search for station point
    tolerance = 1.0 / 24 / 60  # 1 minute precision
    
    while (end_julian - start_julian) > tolerance:
        mid_julian = (start_julian + end_julian) / 2
        motion_data = get_planet_motion_data(planet_code, mid_julian)
        
        if not motion_data['success']:
            return None
            
        speed = motion_data['longitude_speed']
        
        if abs(speed) < 0.0001:  # Very close to zero speed
            return mid_julian
        
        # Adjust search range based on speed direction
        if is_retrograde_station:
            # Looking for transition from positive to negative speed
            if speed > 0:
                start_julian = mid_julian
            else:
                end_julian = mid_julian
        else:
            # Looking for transition from negative to positive speed
            if speed < 0:
                start_julian = mid_julian
            else:
                end_julian = mid_julian
    
    return (start_julian + end_julian) / 2

def detect_retrograde_periods(planet, start_date, end_date, precision='high'):
    """Detect all retrograde periods for a planet within date range"""
    
    setup_ephemeris()
    
    if planet not in PLANETS:
        return {'error': f'Unknown planet: {planet}'}
    
    planet_code = PLANETS[planet]
    
    start_julian = datetime_to_julian(start_date)
    end_julian = datetime_to_julian(end_date)
    
    # Step size based on precision (days)
    step_sizes = {'low': 5, 'medium': 2, 'high': 1, 'ultra': 0.5}
    step_days = step_sizes.get(precision, 1)
    
    retrogrades = []
    current_julian = start_julian
    previous_motion = None
    in_retrograde = False
    retrograde_start = None
    retrograde_start_longitude = None
    
    while current_julian <= end_julian:
        motion_data = get_planet_motion_data(planet_code, current_julian)
        
        if not motion_data['success']:
            current_julian += step_days
            continue
        
        is_retrograde = motion_data['longitude_speed'] < 0
        
        # Check for retrograde transitions
        if previous_motion is not None:
            was_retrograde = previous_motion['longitude_speed'] < 0
            
            # Retrograde period begins
            if is_retrograde and not was_retrograde and not in_retrograde:
                # Find exact station point
                station_point = find_station_point(
                    planet_code, current_julian - step_days, current_julian, True
                )
                
                if station_point:
                    in_retrograde = True
                    retrograde_start = station_point
                    retrograde_start_longitude = motion_data['longitude']
                    print(f"Retrograde begins: {julian_to_datetime(station_point)}", file=sys.stderr)
            
            # Retrograde period ends
            elif not is_retrograde and was_retrograde and in_retrograde:
                # Find exact station point
                station_point = find_station_point(
                    planet_code, current_julian - step_days, current_julian, False
                )
                
                if station_point and retrograde_start:
                    retrograde_end = station_point
                    retrograde_end_longitude = motion_data['longitude']
                    
                    # Calculate peak (middle of retrograde period)
                    peak_julian = (retrograde_start + retrograde_end) / 2
                    
                    # Get zodiac information
                    start_sign, start_degree = get_zodiac_info(retrograde_start_longitude)
                    end_sign, end_degree = get_zodiac_info(retrograde_end_longitude)
                    
                    # Calculate shadow periods
                    shadow_days = SHADOW_PERIODS.get(planet, 30)
                    pre_shadow = retrograde_start - shadow_days
                    post_shadow = retrograde_end + shadow_days
                    
                    retrograde_period = {
                        'planet': planet,
                        'start_date': julian_to_datetime(retrograde_start).isoformat(),
                        'end_date': julian_to_datetime(retrograde_end).isoformat(),
                        'peak_date': julian_to_datetime(peak_julian).isoformat(),
                        'duration_days': retrograde_end - retrograde_start,
                        'shadow': {
                            'pre': julian_to_datetime(pre_shadow).isoformat(),
                            'post': julian_to_datetime(post_shadow).isoformat()
                        },
                        'zodiac_range': {
                            'start': {'sign': start_sign, 'degree': start_degree},
                            'end': {'sign': end_sign, 'degree': end_degree}
                        },
                        'longitude_range': {
                            'start': retrograde_start_longitude,
                            'end': retrograde_end_longitude
                        }
                    }
                    
                    retrogrades.append(retrograde_period)
                    print(f"Retrograde ends: {julian_to_datetime(station_point)}", file=sys.stderr)
                
                in_retrograde = False
                retrograde_start = None
        
        previous_motion = motion_data
        current_julian += step_days
    
    return {
        'planet': planet,
        'search_period': {
            'start': start_date.isoformat(),
            'end': end_date.isoformat()
        },
        'precision': precision,
        'retrogrades': retrogrades,
        'total_periods': len(retrogrades)
    }

def get_current_retrograde_status(planet, datetime_str):
    """Check if a planet is currently retrograde"""
    
    setup_ephemeris()
    
    if planet not in PLANETS:
        return {'error': f'Unknown planet: {planet}'}
    
    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    julian_day = datetime_to_julian(dt)
    
    motion_data = get_planet_motion_data(PLANETS[planet], julian_day)
    
    if not motion_data['success']:
        return {'error': 'Failed to calculate planet position'}
    
    is_retrograde = motion_data['longitude_speed'] < 0
    sign, degree = get_zodiac_info(motion_data['longitude'])
    
    return {
        'planet': planet,
        'datetime': datetime_str,
        'is_retrograde': is_retrograde,
        'longitude': motion_data['longitude'],
        'longitude_speed': motion_data['longitude_speed'],
        'zodiac_sign': sign,
        'zodiac_degree': degree,
        'motion_description': 'retrograde' if is_retrograde else 'direct'
    }

def main():
    parser = argparse.ArgumentParser(description='Detect retrograde periods using Swiss Ephemeris')
    parser.add_argument('--planet', required=True, choices=list(PLANETS.keys()),
                       help='Planet to analyze')
    parser.add_argument('--start-date', required=True, help='Start date (ISO format)')
    parser.add_argument('--end-date', required=True, help='End date (ISO format)')
    parser.add_argument('--precision', choices=['low', 'medium', 'high', 'ultra'], 
                       default='high', help='Calculation precision')
    parser.add_argument('--current-status', action='store_true',
                       help='Get current retrograde status instead of period detection')
    
    args = parser.parse_args()
    
    try:
        if args.current_status:
            # Just check current status
            result = get_current_retrograde_status(args.planet, args.start_date)
        else:
            # Detect retrograde periods
            start_date = datetime.fromisoformat(args.start_date.replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(args.end_date.replace('Z', '+00:00'))
            
            result = detect_retrograde_periods(args.planet, start_date, end_date, args.precision)
        
        print(json.dumps(result, indent=2 if args.precision in ['high', 'ultra'] else None))
        
    except Exception as e:
        print(json.dumps({'error': f'Retrograde detection error: {str(e)}'}))
        sys.exit(1)

if __name__ == '__main__':
    main()