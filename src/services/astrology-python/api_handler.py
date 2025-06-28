#!/usr/bin/env python3
"""
API handler for astrology calculations
Bridges Next.js API routes with Python astrology services
"""

import sys
import json
from datetime import datetime
from ephemeris_service import EphemerisService
from chart_generator import ChartGeneratorService


def handle_birth_chart(data):
    """Handle birth chart calculation request"""
    try:
        # Parse input data
        name = data['name']
        birth_date = datetime.fromisoformat(data['birthDate'].replace('Z', '+00:00'))
        city = data['city']
        country = data.get('country', '')
        
        # Generate chart using Kerykeion
        chart_service = ChartGeneratorService()
        chart = chart_service.create_birth_chart(name, birth_date, city, country)
        
        # Calculate detailed positions using Swiss Ephemeris
        ephemeris_service = EphemerisService()
        location = chart['subject_data']['location']
        detailed_chart = ephemeris_service.calculate_birth_chart(
            birth_date, location['lat'], location['lng']
        )
        
        # Combine results
        result = {
            'success': True,
            'data': {
                **chart,
                'detailed_positions': detailed_chart['planets'],
                'houses': detailed_chart['houses'],
                'aspects': detailed_chart['aspects']
            }
        }
        
        return result
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def handle_synastry(data):
    """Handle synastry calculation request"""
    try:
        chart_service = ChartGeneratorService()
        
        # Geocode locations for both people
        person1 = data['person1']
        person2 = data['person2']
        
        location1 = chart_service.geocode_location(person1['city'], person1.get('country', ''))
        location2 = chart_service.geocode_location(person2['city'], person2.get('country', ''))
        
        # Add location data
        person1.update({
            'lat': location1['lat'],
            'lng': location1['lng'],
            'timezone': location1['timezone']
        })
        
        person2.update({
            'lat': location2['lat'],
            'lng': location2['lng'],
            'timezone': location2['timezone']
        })
        
        # Generate synastry chart
        synastry = chart_service.create_synastry_chart(person1, person2)
        
        return {
            'success': True,
            'data': synastry
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def handle_transits():
    """Get current planetary transits"""
    try:
        ephemeris_service = EphemerisService()
        transits = ephemeris_service.get_current_transits()
        
        return {
            'success': True,
            'data': transits
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def handle_geocode(data):
    """Geocode a location"""
    try:
        chart_service = ChartGeneratorService()
        location = chart_service.geocode_location(
            data['city'], 
            data.get('country', '')
        )
        
        return {
            'success': True,
            'data': location
        }
        
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def main():
    """Main entry point for API handler"""
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
    
    # Route to appropriate handler
    if action == 'birth-chart':
        result = handle_birth_chart(data)
    elif action == 'synastry':
        result = handle_synastry(data)
    elif action == 'transits':
        result = handle_transits()
    elif action == 'geocode':
        result = handle_geocode(data)
    else:
        result = {'success': False, 'error': f'Unknown action: {action}'}
    
    # Output JSON result
    print(json.dumps(result))


if __name__ == '__main__':
    main()