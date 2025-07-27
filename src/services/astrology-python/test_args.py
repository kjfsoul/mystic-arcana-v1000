#!/usr/bin/env python3
"""
Simple test script to verify argument parsing is working
"""

import json
import sys
import argparse

def main():
    """Test the argument parsing logic"""
    
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
        parser = argparse.ArgumentParser(description='Test Argument Parsing')
        parser.add_argument('--action', required=True, help='Action to perform')
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
    
    # Test the parsing
    print(json.dumps({
        'success': True,
        'parsed_action': action,
        'parsed_data': data,
        'test_status': 'argument_parsing_working'
    }))

if __name__ == '__main__':
    main()