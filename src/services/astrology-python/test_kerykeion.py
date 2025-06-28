#!/usr/bin/env python3
"""
Test Kerykeion functionality
"""

from kerykeion import AstrologicalSubject, KerykeionChartSVG
from datetime import datetime

def test_kerykeion():
    print("=== KERYKEION TEST ===\n")
    
    try:
        # Create a test subject (Einstein)
        subject = AstrologicalSubject(
            name="Albert Einstein",
            year=1879,
            month=3,
            day=14,
            hour=11,
            minute=30,
            city="Ulm, Germany"
        )
        
        print(f"Subject created: {subject.name}")
        print(f"Birth location: {subject.city}")
        print(f"Julian Day: {subject.julian_day}")
        
        # Check planetary positions
        print(f"\nPlanetary Positions:")
        print(f"Sun: {subject.sun['sign']} {subject.sun['position']:.2f}°")
        print(f"Moon: {subject.moon['sign']} {subject.moon['position']:.2f}°")
        print(f"Mercury: {subject.mercury['sign']} {subject.mercury['position']:.2f}°")
        print(f"Venus: {subject.venus['sign']} {subject.venus['position']:.2f}°")
        print(f"Mars: {subject.mars['sign']} {subject.mars['position']:.2f}°")
        
        # Generate SVG chart
        chart = KerykeionChartSVG(subject)
        svg_content = chart.makeTemplate()
        
        print(f"\nChart generated:")
        print(f"SVG length: {len(svg_content)} characters")
        
        if len(svg_content) > 1000:
            print("✅ Kerykeion is working! Chart generated successfully.")
        else:
            print("❌ Chart generation may have failed.")
            
    except Exception as e:
        print(f"❌ Error: {e}")
        print("This might be due to missing location data or internet connection.")

if __name__ == "__main__":
    test_kerykeion()