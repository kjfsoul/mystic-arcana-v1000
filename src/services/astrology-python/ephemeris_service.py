"""
Swiss Ephemeris calculation service with Supabase caching
Uses PySwisseph for NASA-grade astronomical calculations
"""

import swisseph as swe
from datetime import datetime
from decimal import Decimal
import json
from typing import Dict, List, Optional, Tuple
import os
from supabase import create_client, Client

# Initialize Supabase client
SUPABASE_URL = os.environ.get('NEXT_PUBLIC_SUPABASE_URL', '')
SUPABASE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY', '')
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Set ephemeris path (download from astro.com)
EPHE_PATH = os.path.join(os.path.dirname(__file__), 'ephemeris')
swe.set_ephe_path(EPHE_PATH)

# Planet constants
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
    'chiron': swe.CHIRON,
    'north_node': swe.TRUE_NODE,
    'lilith': swe.MEAN_APOG,
    'vertex': swe.VERTEX
}

# Zodiac signs
ZODIAC_SIGNS = [
    'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
    'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
]

class EphemerisService:
    """Handles all astronomical calculations with caching"""
    
    @staticmethod
    def datetime_to_julian(dt: datetime) -> float:
        """Convert datetime to Julian Day (UT)"""
        return swe.julday(
            dt.year, dt.month, dt.day,
            dt.hour + dt.minute/60.0 + dt.second/3600.0
        )
    
    @staticmethod
    def get_planet_position(julian_day: float, planet: int, planet_name: str) -> Dict:
        """
        Get planet position with Supabase caching
        Returns: Dict with longitude, latitude, distance, speed
        """
        # Check cache first
        cache_result = supabase.table('ephemeris_cache').select('*').eq(
            'julian_day', julian_day
        ).eq('planet', planet).execute()
        
        if cache_result.data:
            # Return cached data
            cached = cache_result.data[0]
            return {
                'longitude': float(cached['longitude']),
                'latitude': float(cached['latitude']),
                'distance': float(cached['distance']),
                'speed': {
                    'longitude': float(cached['speed_longitude']),
                    'latitude': float(cached['speed_latitude']),
                    'distance': float(cached['speed_distance'])
                }
            }
        
        # Calculate if not cached
        flags = swe.FLG_SWIEPH | swe.FLG_SPEED
        result = swe.calc_ut(julian_day, planet, flags)
        
        if result[0] == swe.ERR:
            raise Exception(f"Error calculating {planet_name}: {result[1]}")
        
        position_data = {
            'longitude': result[0][0],
            'latitude': result[0][1],
            'distance': result[0][2],
            'speed': {
                'longitude': result[0][3],
                'latitude': result[0][4],
                'distance': result[0][5]
            }
        }
        
        # Cache the result
        supabase.table('ephemeris_cache').insert({
            'julian_day': julian_day,
            'planet': planet,
            'planet_name': planet_name,
            'longitude': position_data['longitude'],
            'latitude': position_data['latitude'],
            'distance': position_data['distance'],
            'speed_longitude': position_data['speed']['longitude'],
            'speed_latitude': position_data['speed']['latitude'],
            'speed_distance': position_data['speed']['distance']
        }).execute()
        
        return position_data
    
    @staticmethod
    def calculate_houses(julian_day: float, lat: float, lon: float, 
                        house_system: str = 'P') -> Dict:
        """
        Calculate house cusps
        house_system: 'P' for Placidus, 'K' for Koch, 'E' for Equal
        """
        houses = swe.houses(julian_day, lat, lon, house_system.encode('ascii'))
        
        return {
            'cusps': houses[0],  # 12 house cusps
            'ascendant': houses[1][0],
            'midheaven': houses[1][1],
            'armc': houses[1][2],
            'vertex': houses[1][3]
        }
    
    @classmethod
    def calculate_birth_chart(cls, birth_date: datetime, lat: float, lon: float) -> Dict:
        """Calculate complete birth chart with all planets and houses"""
        julian_day = cls.datetime_to_julian(birth_date)
        
        # Calculate all planet positions
        planets = {}
        for name, planet_id in PLANETS.items():
            try:
                position = cls.get_planet_position(julian_day, planet_id, name)
                
                # Add zodiac sign info
                zodiac_idx = int(position['longitude'] / 30)
                zodiac_degree = position['longitude'] % 30
                
                planets[name] = {
                    **position,
                    'zodiac_sign': ZODIAC_SIGNS[zodiac_idx],
                    'zodiac_degree': zodiac_degree,
                    'retrograde': position['speed']['longitude'] < 0
                }
            except Exception as e:
                print(f"Error calculating {name}: {e}")
                continue
        
        # Calculate houses
        houses = cls.calculate_houses(julian_day, lat, lon)
        
        # Calculate aspects
        aspects = cls.calculate_aspects(planets)
        
        return {
            'julian_day': julian_day,
            'planets': planets,
            'houses': houses,
            'aspects': aspects
        }
    
    @staticmethod
    def calculate_aspects(planets: Dict) -> List[Dict]:
        """Calculate aspects between planets"""
        aspect_types = [
            {'name': 'conjunction', 'angle': 0, 'orb': 10},
            {'name': 'sextile', 'angle': 60, 'orb': 6},
            {'name': 'square', 'angle': 90, 'orb': 8},
            {'name': 'trine', 'angle': 120, 'orb': 8},
            {'name': 'opposition', 'angle': 180, 'orb': 10}
        ]
        
        aspects = []
        planet_names = list(planets.keys())
        
        for i in range(len(planet_names)):
            for j in range(i + 1, len(planet_names)):
                planet1 = planet_names[i]
                planet2 = planet_names[j]
                
                long1 = planets[planet1]['longitude']
                long2 = planets[planet2]['longitude']
                
                # Calculate angle between planets
                angle = abs(long1 - long2)
                if angle > 180:
                    angle = 360 - angle
                
                # Check if this forms an aspect
                for aspect_type in aspect_types:
                    orb = abs(angle - aspect_type['angle'])
                    if orb <= aspect_type['orb']:
                        aspects.append({
                            'planet1': planet1,
                            'planet2': planet2,
                            'type': aspect_type['name'],
                            'angle': angle,
                            'orb': orb,
                            'exact_angle': aspect_type['angle'],
                            'applying': cls._is_aspect_applying(
                                planets[planet1], planets[planet2], angle
                            )
                        })
                        break
        
        return aspects
    
    @staticmethod
    def _is_aspect_applying(planet1: Dict, planet2: Dict, current_angle: float) -> bool:
        """Determine if aspect is applying (getting closer) or separating"""
        # Simplified: faster planet behind slower = applying
        speed1 = abs(planet1['speed']['longitude'])
        speed2 = abs(planet2['speed']['longitude'])
        
        if speed1 > speed2:
            return planet1['longitude'] < planet2['longitude']
        else:
            return planet2['longitude'] < planet1['longitude']
    
    @classmethod
    def get_current_transits(cls) -> Dict:
        """Get current planetary positions"""
        now = datetime.utcnow()
        julian_day = cls.datetime_to_julian(now)
        
        transits = {}
        for name, planet_id in PLANETS.items():
            try:
                position = cls.get_planet_position(julian_day, planet_id, name)
                zodiac_idx = int(position['longitude'] / 30)
                zodiac_degree = position['longitude'] % 30
                
                transits[name] = {
                    **position,
                    'zodiac_sign': ZODIAC_SIGNS[zodiac_idx],
                    'zodiac_degree': zodiac_degree,
                    'retrograde': position['speed']['longitude'] < 0
                }
            except Exception as e:
                print(f"Error calculating transit for {name}: {e}")
                continue
        
        return {
            'timestamp': now.isoformat(),
            'julian_day': julian_day,
            'planets': transits
        }


# Validation function
def validate_calculations():
    """Test calculations against known data"""
    # Einstein's birth data
    einstein_date = datetime(1879, 3, 14, 11, 30, 0)
    einstein_lat = 48.4
    einstein_lon = 10.0
    
    print("Testing Swiss Ephemeris calculations...")
    print(f"Einstein birth date: {einstein_date}")
    
    service = EphemerisService()
    chart = service.calculate_birth_chart(einstein_date, einstein_lat, einstein_lon)
    
    print("\nPlanetary Positions:")
    for planet, data in chart['planets'].items():
        print(f"{planet.upper():12} {data['zodiac_sign']:12} {data['zodiac_degree']:6.2f}° "
              f"{'(R)' if data['retrograde'] else ''}")
    
    print(f"\nFound {len(chart['aspects'])} aspects")
    print("\nFirst 5 aspects:")
    for aspect in chart['aspects'][:5]:
        print(f"{aspect['planet1']} {aspect['type']} {aspect['planet2']} "
              f"(angle: {aspect['angle']:.2f}°, orb: {aspect['orb']:.2f}°)")
    
    # Expected: Sun around 23° Pisces
    sun = chart['planets']['sun']
    print(f"\nValidation: Sun at {sun['zodiac_sign']} {sun['zodiac_degree']:.2f}°")
    print("Expected: Sun at Pisces ~23°")


if __name__ == "__main__":
    validate_calculations()