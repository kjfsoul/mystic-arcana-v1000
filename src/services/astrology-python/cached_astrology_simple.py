#!/usr/bin/env python3
"""
Simplified Cached Astrology Python Wrapper (without problematic dependencies)
For testing argument parsing and basic functionality
"""

import json
import sys
import argparse
import time
from datetime import datetime
from typing import Dict, Any, Optional

def generate_mock_birth_chart(name: str, birth_date: str, city: str, country: str) -> Dict[str, Any]:
    """Generate a mock birth chart for testing"""
    return {
        "success": True,
        "data": {
            "svg_chart": "<svg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'><circle cx='200' cy='200' r='180' fill='none' stroke='#4F46E5' stroke-width='2'/><text x='200' y='200' text-anchor='middle' fill='#4F46E5' font-size='16'>Mock Chart</text></svg>",
            "sign_summary": f"Mock birth chart for {name}, born {birth_date} in {city}, {country}. This is a test chart with Swiss Ephemeris compatibility verified.",
            "house_breakdown": [
                "House System: Placidus (Mock)",
                "Ascendant: Test Sign at 25°",
                "Midheaven: Test Sign at 15°",
                "Swiss Ephemeris: Available (Mock)"
            ],
            "chart_data": {
                "houses": {
                    "method": "Swiss Ephemeris Placidus",
                    "success": True,
                    "angles": {
                        "ascendant": {"degree": 125.5, "sign": "Leo"},
                        "midheaven": {"degree": 45.2, "sign": "Taurus"}
                    },
                    "house_cusps": {
                        "1": {"degree": 125.5, "sign": "Leo"},
                        "2": {"degree": 155.3, "sign": "Virgo"},
                        "3": {"degree": 185.1, "sign": "Libra"},
                        "4": {"degree": 225.2, "sign": "Scorpio"},
                        "5": {"degree": 265.8, "sign": "Sagittarius"},
                        "6": {"degree": 295.4, "sign": "Capricorn"},
                        "7": {"degree": 305.5, "sign": "Aquarius"},
                        "8": {"degree": 335.3, "sign": "Pisces"},
                        "9": {"degree": 5.1, "sign": "Aries"},
                        "10": {"degree": 45.2, "sign": "Taurus"},
                        "11": {"degree": 85.8, "sign": "Gemini"},
                        "12": {"degree": 115.4, "sign": "Cancer"}
                    }
                },
                "planets": {
                    "sun": {"degree": 353.5, "sign": "Pisces"},
                    "moon": {"degree": 163.1, "sign": "Virgo"},
                    "mercury": {"degree": 340.2, "sign": "Pisces"},
                    "venus": {"degree": 15.8, "sign": "Aries"},
                    "mars": {"degree": 295.3, "sign": "Capricorn"}
                }
            },
            "cache_hit": False,
            "calculation_time_ms": 150,
            "cached_at": datetime.utcnow().isoformat(),
            "test_mode": True
        }
    }

def main():
    """Main entry point for cached astrology calculations"""
    
    # Check if using old positional argument format or new flag format
    if len(sys.argv) >= 2 and not sys.argv[1].startswith('--'):
        # Old format: python script.py action data
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
    else:
        # New format: python script.py --action=ACTION --payload=JSON
        parser = argparse.ArgumentParser(description='Cached Astrology Calculations (Mock Mode)')
        parser.add_argument('--action', required=True, help='Action to perform (birth-chart, synastry, transits, etc.)')
        parser.add_argument('--payload', required=False, help='JSON payload for the action')
        
        try:
            args = parser.parse_args()
            action = args.action
            
            # Parse payload if provided
            data = None
            if args.payload:
                try:
                    data = json.loads(args.payload)
                except json.JSONDecodeError as e:
                    print(json.dumps({'success': False, 'error': f'Invalid JSON payload: {str(e)}'}))
                    sys.exit(1)
        except SystemExit:
            # argparse calls sys.exit on error, we need to handle this gracefully
            print(json.dumps({'success': False, 'error': 'Invalid command line arguments. Use --action=ACTION --payload=JSON'}))
            sys.exit(1)
    
    try:
        if action in ['birth-chart', 'calculate_birth_chart']:
            # Handle both old and new parameter formats
            if 'location' in data:
                # New format with location object
                location = data['location']
                result = generate_mock_birth_chart(
                    data.get('name', 'Unknown'),
                    data['birthDate'],
                    location.get('city', 'Unknown'),
                    location.get('country', '')
                )
            elif 'birthDate' in data:
                # Direct format from calculate endpoint
                result = generate_mock_birth_chart(
                    data.get('name', 'Unknown'),
                    data['birthDate'],
                    data.get('city', 'Unknown'),
                    data.get('country', '')
                )
            else:
                # Legacy format
                result = generate_mock_birth_chart(
                    data['name'],
                    data['birthDate'] if 'birthDate' in data else data.get('date'),
                    data['city'],
                    data.get('country', '')
                )
            print(json.dumps(result))
            
        elif action == 'cache-stats':
            stats = {
                'birth_chart_hits': 5,
                'transit_hits': 2,
                'total_requests': 10,
                'cache_efficiency': 70.0,
                'average_response_time': 250,
                'mock_mode': True
            }
            print(json.dumps({'success': True, 'data': stats}))
            
        elif action == 'clear-cache':
            print(json.dumps({'success': True, 'message': 'Cache cleared successfully (mock mode)'}))
            
        else:
            print(json.dumps({'success': False, 'error': f'Unknown action: {action}'}))
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()