#!/usr/bin/env python3
"""
Aspect Calculator using Swiss Ephemeris
Calculates precise astrological aspects between planetary bodies
"""

import swisseph as swe
import json
import argparse
import sys
from datetime import datetime, timedelta
from math import abs as math_abs

# Import planetary position calculator
try:
    from planetary_positions import calculate_planetary_positions, PLANETS, PLANET_SYMBOLS
except ImportError:
    # If running standalone, define minimal required constants
    PLANETS = {
        'sun': swe.SUN, 'moon': swe.MOON, 'mercury': swe.MERCURY,
        'venus': swe.VENUS, 'mars': swe.MARS, 'jupiter': swe.JUPITER,
        'saturn': swe.SATURN, 'uranus': swe.URANUS, 'neptune': swe.NEPTUNE,
        'pluto': swe.PLUTO, 'north_node': swe.TRUE_NODE
    }

# Aspect definitions with exact angles and typical orbs
ASPECTS = {
    'conjunction': {'angle': 0, 'orb': 8, 'type': 'major', 'influence': 'neutral'},
    'semisextile': {'angle': 30, 'orb': 2, 'type': 'minor', 'influence': 'neutral'},
    'sextile': {'angle': 60, 'orb': 6, 'type': 'major', 'influence': 'harmonious'},
    'square': {'angle': 90, 'orb': 8, 'type': 'major', 'influence': 'challenging'},
    'trine': {'angle': 120, 'orb': 8, 'type': 'major', 'influence': 'harmonious'},
    'quincunx': {'angle': 150, 'orb': 2, 'type': 'minor', 'influence': 'challenging'},
    'opposition': {'angle': 180, 'orb': 8, 'type': 'major', 'influence': 'challenging'},
    'semisquare': {'angle': 45, 'orb': 2, 'type': 'minor', 'influence': 'challenging'},
    'sesquiquadrate': {'angle': 135, 'orb': 2, 'type': 'minor', 'influence': 'challenging'}
}

# Planet strength weights for aspect strength calculation
PLANET_WEIGHTS = {
    'sun': 1.0, 'moon': 1.0, 'mercury': 0.8, 'venus': 0.8, 'mars': 0.9,
    'jupiter': 0.9, 'saturn': 0.9, 'uranus': 0.7, 'neptune': 0.6,
    'pluto': 0.7, 'north_node': 0.5, 'south_node': 0.5
}

def setup_ephemeris():
    """Configure Swiss Ephemeris with data path"""
    swe.set_ephe_path('/usr/share/swisseph:/home/ubuntu/data/ephemeris')

def normalize_longitude_difference(angle1, angle2):
    """Calculate the shortest angular distance between two longitudes"""
    diff = math_abs(angle1 - angle2)
    if diff > 180:
        diff = 360 - diff
    return diff

def is_aspect_applying(planet1_speed, planet2_speed, current_separation, exact_angle):
    """
    Determine if an aspect is applying (forming) or separating
    Returns True if the aspect is getting closer to exact
    """
    # Calculate relative speed (how fast the angle is changing)
    relative_speed = planet1_speed - planet2_speed
    
    # If the separation is currently larger than exact, and relative speed
    # is bringing them together, the aspect is applying
    if current_separation > exact_angle:
        return relative_speed < 0
    else:
        return relative_speed > 0

def calculate_aspect_strength(planet1, planet2, orb, max_orb, aspect_type):
    """
    Calculate the strength of an aspect based on:
    - Orb (closer to exact = stronger)
    - Planet weights
    - Aspect type importance
    """
    # Orb strength (closer to exact = stronger)
    orb_strength = 1.0 - (orb / max_orb)
    
    # Planet weight (average of both planets)
    planet1_weight = PLANET_WEIGHTS.get(planet1, 0.5)
    planet2_weight = PLANET_WEIGHTS.get(planet2, 0.5)
    planet_strength = (planet1_weight + planet2_weight) / 2
    
    # Aspect type weight
    aspect_weight = 1.0 if aspect_type == 'major' else 0.7
    
    return orb_strength * planet_strength * aspect_weight

def find_aspects_between_planets(planet1_data, planet2_data, orb_tolerance, precision='high'):
    """Find all aspects between two planets"""
    aspects_found = []
    
    planet1_lon = planet1_data['longitude']
    planet2_lon = planet2_data['longitude']
    planet1_speed = planet1_data.get('speed', 0)
    planet2_speed = planet2_data.get('speed', 0)
    
    current_separation = normalize_longitude_difference(planet1_lon, planet2_lon)
    
    # Check each possible aspect
    for aspect_name, aspect_info in ASPECTS.items():
        exact_angle = aspect_info['angle']
        max_orb = min(aspect_info['orb'], orb_tolerance)
        
        # Calculate how far we are from the exact aspect
        orb = math_abs(current_separation - exact_angle)
        
        # Handle the case where we might be close to 0° (conjunction) from the 360° side
        if exact_angle == 0:
            orb = min(orb, math_abs(current_separation - 360))
        
        # If within orb, we have an aspect
        if orb <= max_orb:
            is_applying = is_aspect_applying(planet1_speed, planet2_speed, current_separation, exact_angle)
            is_exact = orb < 1.0  # Within 1 degree considered exact
            
            strength = calculate_aspect_strength(
                planet1_data['name'], planet2_data['name'], 
                orb, max_orb, aspect_info['type']
            )
            
            aspect = {
                'planet1': planet1_data['name'],
                'planet2': planet2_data['name'],
                'planet1_symbol': planet1_data.get('symbol', '?'),
                'planet2_symbol': planet2_data.get('symbol', '?'),
                'type': aspect_name,
                'angle': exact_angle,
                'current_separation': current_separation,
                'orb': orb,
                'exact': is_exact,
                'applying': is_applying,
                'influence': aspect_info['influence'],
                'strength': strength,
                'aspect_type': aspect_info['type'],  # major/minor
                'planet1_longitude': planet1_lon,
                'planet2_longitude': planet2_lon,
                'planet1_speed': planet1_speed,
                'planet2_speed': planet2_speed
            }
            
            aspects_found.append(aspect)
    
    return aspects_found

def calculate_all_aspects(planets_data, orb_tolerance, precision='high'):
    """Calculate all aspects between all planet pairs"""
    all_aspects = []
    
    # Get all planet pairs
    for i, planet1 in enumerate(planets_data):
        for j, planet2 in enumerate(planets_data[i+1:], i+1):
            aspects = find_aspects_between_planets(planet1, planet2, orb_tolerance, precision)
            all_aspects.extend(aspects)
    
    # Sort by strength (strongest first)
    all_aspects.sort(key=lambda x: x['strength'], reverse=True)
    
    return all_aspects

def calculate_aspect_patterns(aspects):
    """
    Identify special aspect patterns like:
    - Grand Trines
    - T-Squares  
    - Grand Crosses
    - Yods
    - Stelliums
    """
    patterns = []
    
    # Group aspects by type for pattern detection
    trines = [a for a in aspects if a['type'] == 'trine']
    squares = [a for a in aspects if a['type'] == 'square']
    sextiles = [a for a in aspects if a['type'] == 'sextile']
    oppositions = [a for a in aspects if a['type'] == 'opposition']
    quincunxes = [a for a in aspects if a['type'] == 'quincunx']
    
    # Look for Grand Trines (3 planets in trine aspect forming a triangle)
    if len(trines) >= 3:
        # This is a simplified check - full implementation would be more complex
        trine_planets = set()
        for trine in trines:
            trine_planets.add(trine['planet1'])
            trine_planets.add(trine['planet2'])
        
        if len(trine_planets) >= 3:
            patterns.append({
                'type': 'grand_trine',
                'planets': list(trine_planets)[:3],
                'description': 'Grand Trine - harmonious energy flow',
                'strength': sum(t['strength'] for t in trines[:3]) / 3
            })
    
    # Look for T-Squares (two squares + one opposition)
    if len(squares) >= 2 and len(oppositions) >= 1:
        patterns.append({
            'type': 't_square',
            'description': 'T-Square - dynamic tension requiring action',
            'strength': (sum(s['strength'] for s in squares[:2]) + oppositions[0]['strength']) / 3
        })
    
    return patterns

def main():
    parser = argparse.ArgumentParser(description='Calculate astrological aspects using Swiss Ephemeris')
    parser.add_argument('--datetime', required=True, help='ISO datetime string')
    parser.add_argument('--planets', required=True, help='Comma-separated list of planets')
    parser.add_argument('--orb-tolerance', type=float, default=8.0, help='Maximum orb in degrees')
    parser.add_argument('--precision', choices=['low', 'medium', 'high', 'ultra'], default='high')
    parser.add_argument('--include-patterns', action='store_true', help='Include aspect pattern detection')
    parser.add_argument('--latitude', type=float, default=0.0, help='Observer latitude')
    parser.add_argument('--longitude', type=float, default=0.0, help='Observer longitude')
    
    args = parser.parse_args()
    
    setup_ephemeris()
    
    try:
        planets_list = [p.strip().lower() for p in args.planets.split(',')]
        
        # Get planetary positions first
        positions_result = calculate_planetary_positions(
            args.datetime, args.latitude, args.longitude, planets_list,
            args.precision, include_retrograde=True
        )
        
        if 'error' in positions_result:
            print(json.dumps({'error': positions_result['error']}))
            return
        
        planets_data = positions_result['planets']
        
        # Calculate aspects
        aspects = calculate_all_aspects(planets_data, args.orb_tolerance, args.precision)
        
        # Categorize aspects
        major_aspects = [a for a in aspects if a['aspect_type'] == 'major']
        minor_aspects = [a for a in aspects if a['aspect_type'] == 'minor']
        applying_aspects = [a for a in aspects if a['applying']]
        exact_aspects = [a for a in aspects if a['exact']]
        
        result = {
            'timestamp': args.datetime,
            'orb_tolerance': args.orb_tolerance,
            'precision': args.precision,
            'total_aspects': len(aspects),
            'aspects': {
                'all': aspects,
                'major': major_aspects,
                'minor': minor_aspects,
                'applying': applying_aspects,
                'exact': exact_aspects
            },
            'summary': {
                'total_count': len(aspects),
                'major_count': len(major_aspects),
                'minor_count': len(minor_aspects),
                'applying_count': len(applying_aspects),
                'exact_count': len(exact_aspects),
                'strongest_aspect': aspects[0] if aspects else None
            }
        }
        
        # Add aspect patterns if requested
        if args.include_patterns:
            patterns = calculate_aspect_patterns(aspects)
            result['patterns'] = patterns
            result['summary']['patterns_found'] = len(patterns)
        
        print(json.dumps(result, indent=2 if args.precision in ['high', 'ultra'] else None))
        
    except Exception as e:
        print(json.dumps({'error': f'Aspect calculation error: {str(e)}'}))
        sys.exit(1)

if __name__ == '__main__':
    main()