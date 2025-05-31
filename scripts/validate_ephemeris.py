#!/usr/bin/env python3
import swisseph as swe
from datetime import datetime, timezone
import sys

def validate_ephemeris():
    """Validate Swiss Ephemeris installation and basic calculations"""
    try:
        # Set ephemeris path
        swe.set_ephe_path('/usr/share/swisseph:/home/ubuntu/data/ephemeris')
        
        # Test basic planetary calculation
        julian_day = swe.julday(2024, 1, 1, 12.0)
        result = swe.calc_ut(julian_day, swe.SUN)
        
        if result[1] == swe.OK:
            print(f"✓ Ephemeris validation successful. Sun position: {result[0][0]:.4f}°")
            return True
        else:
            print(f"✗ Ephemeris calculation failed: {result}")
            return False
            
    except Exception as e:
        print(f"✗ Ephemeris validation error: {e}")
        return False

if __name__ == "__main__":
    if not validate_ephemeris():
        sys.exit(1)
    print("Astronomical calculation system ready for spiritual technology development.")