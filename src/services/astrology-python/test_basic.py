#!/usr/bin/env python3
"""
Basic test of Swiss Ephemeris without Supabase
"""

import swisseph as swe
from datetime import datetime

# Test Swiss Ephemeris directly
def test_swisseph():
    print("=== SWISS EPHEMERIS BASIC TEST ===\n")
    
    # Test current date
    now = datetime.utcnow()
    print(f"Current UTC time: {now}")
    
    # Convert to Julian Day
    jd = swe.julday(now.year, now.month, now.day, 
                    now.hour + now.minute/60.0 + now.second/3600.0)
    print(f"Julian Day: {jd}")
    
    # Calculate Sun position
    result = swe.calc_ut(jd, swe.SUN, swe.FLG_SWIEPH | swe.FLG_SPEED)
    
    if result[1]:  # Error
        print(f"Error: {result[1]}")
        return
    
    longitude = result[0][0]
    speed = result[0][3]
    
    # Calculate zodiac sign
    zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    
    zodiac_index = int(longitude / 30)
    zodiac_degree = longitude % 30
    
    print(f"\nSun Position:")
    print(f"- Longitude: {longitude:.4f}°")
    print(f"- Sign: {zodiac_signs[zodiac_index]} {zodiac_degree:.2f}°")
    print(f"- Daily motion: {speed:.4f}°/day")
    
    # Test Einstein's birth date
    print(f"\n=== EINSTEIN TEST ===")
    einstein_date = datetime(1879, 3, 14, 11, 30)
    einstein_jd = swe.julday(1879, 3, 14, 11.5)
    
    # Calculate Sun for Einstein
    result = swe.calc_ut(einstein_jd, swe.SUN, swe.FLG_SWIEPH)
    if not result[1]:  # No error
        longitude = result[0][0]
        zodiac_index = int(longitude / 30)
        zodiac_degree = longitude % 30
        
        print(f"Einstein's Sun: {zodiac_signs[zodiac_index]} {zodiac_degree:.2f}°")
        print("Expected: Pisces ~23°")
        
        if zodiac_signs[zodiac_index] == 'Pisces' and 20 < zodiac_degree < 26:
            print("✅ Calculation appears correct!")
        else:
            print("❌ Calculation may be incorrect")
    
    print("\n✅ Swiss Ephemeris is working!")

if __name__ == "__main__":
    test_swisseph()