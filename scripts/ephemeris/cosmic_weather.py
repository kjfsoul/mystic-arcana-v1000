#!/usr/bin/env python3
"""
Cosmic Weather Calculator for Mystic Arcana
Combines astronomical data with spiritual interpretations
"""

import swisseph as swe
import json
import argparse
import sys
from datetime import datetime, timedelta
from math import floor, cos, radians

# Import other calculators
try:
    from planetary_positions import calculate_planetary_positions
    from aspect_calculator import calculate_all_aspects
    from retrograde_detector import get_current_retrograde_status, PLANETS
except ImportError:
    print("Required calculator modules not found", file=sys.stderr)
    sys.exit(1)

# Planetary hour system
PLANETARY_HOUR_SEQUENCE = [
    'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'moon'
]

DAY_RULERS = {
    0: 'moon',      # Monday
    1: 'mars',      # Tuesday  
    2: 'mercury',   # Wednesday
    3: 'jupiter',   # Thursday
    4: 'venus',     # Friday
    5: 'saturn',    # Saturday
    6: 'sun'        # Sunday
}

# Spiritual influences based on cosmic conditions
MOON_PHASE_INFLUENCES = {
    'new': {
        'energy': 'new_beginnings',
        'optimal_activities': ['intention_setting', 'planning', 'meditation'],
        'avoid': ['major_decisions', 'confrontations'],
        'spiritual_focus': 'inner_reflection'
    },
    'waxing_crescent': {
        'energy': 'building_momentum', 
        'optimal_activities': ['starting_projects', 'manifestation_work'],
        'avoid': ['letting_go_rituals'],
        'spiritual_focus': 'growth_and_expansion'
    },
    'first_quarter': {
        'energy': 'taking_action',
        'optimal_activities': ['decision_making', 'overcoming_obstacles'],
        'avoid': ['passive_activities'],
        'spiritual_focus': 'courage_and_determination'
    },
    'waxing_gibbous': {
        'energy': 'refinement',
        'optimal_activities': ['fine_tuning', 'preparation'],
        'avoid': ['rushing_to_completion'],
        'spiritual_focus': 'patience_and_perseverance'
    },
    'full': {
        'energy': 'culmination',
        'optimal_activities': ['celebration', 'gratitude', 'release_work'],
        'avoid': ['starting_new_ventures'],
        'spiritual_focus': 'illumination_and_clarity'
    },
    'waning_gibbous': {
        'energy': 'sharing_wisdom',
        'optimal_activities': ['teaching', 'healing', 'giving_back'],
        'avoid': ['hoarding_energy'],
        'spiritual_focus': 'service_and_compassion'
    },
    'last_quarter': {
        'energy': 'letting_go',
        'optimal_activities': ['release_rituals', 'forgiveness'],
        'avoid': ['clinging_to_past'],
        'spiritual_focus': 'surrender_and_acceptance'
    },
    'waning_crescent': {
        'energy': 'rest_and_reflect',
        'optimal_activities': ['rest', 'introspection', 'healing'],
        'avoid': ['overexertion'],
        'spiritual_focus': 'preparation_for_renewal'
    }
}

RETROGRADE_INFLUENCES = {
    'mercury': {
        'areas': ['communication', 'technology', 'travel', 'contracts'],
        'advice': 'Review, revise, and reflect rather than starting new ventures',
        'spiritual_lesson': 'inner_communication_and_intuition'
    },
    'venus': {
        'areas': ['relationships', 'finances', 'creativity', 'values'],
        'advice': 'Reassess relationships and values, avoid major purchases',
        'spiritual_lesson': 'self_love_and_authentic_expression'
    },
    'mars': {
        'areas': ['action', 'energy', 'conflict', 'motivation'],
        'advice': 'Channel energy inward, avoid aggressive actions',
        'spiritual_lesson': 'strategic_patience_and_inner_strength'
    },
    'jupiter': {
        'areas': ['expansion', 'beliefs', 'philosophy', 'higher_learning'],
        'advice': 'Question beliefs and philosophies, seek inner wisdom',
        'spiritual_lesson': 'authentic_truth_and_wisdom'
    },
    'saturn': {
        'areas': ['structure', 'responsibility', 'limitations', 'karma'],
        'advice': 'Review commitments and structures, release outdated patterns',
        'spiritual_lesson': 'karmic_clearing_and_restructuring'
    },
    'uranus': {
        'areas': ['innovation', 'freedom', 'rebellion', 'awakening'],
        'advice': 'Internal revolution and awakening, avoid hasty changes',
        'spiritual_lesson': 'authentic_individuality_and_freedom'
    },
    'neptune': {
        'areas': ['spirituality', 'illusion', 'dreams', 'compassion'],
        'advice': 'Increased intuition but potential for confusion',
        'spiritual_lesson': 'discernment_between_illusion_and_truth'
    },
    'pluto': {
        'areas': ['transformation', 'power', 'death_rebirth', 'shadow'],
        'advice': 'Deep inner transformation, shadow work',
        'spiritual_lesson': 'releasing_ego_and_embracing_soul_power'
    }
}

ASPECT_INFLUENCES = {
    'conjunction': {
        'harmonious': {'energy': 'unified_power', 'focus': 'integration'},
        'challenging': {'energy': 'intensity', 'focus': 'balance_needed'}
    },
    'sextile': {
        'harmonious': {'energy': 'opportunity', 'focus': 'cooperative_action'},
        'challenging': {'energy': 'missed_chances', 'focus': 'taking_initiative'}
    },
    'square': {
        'harmonious': {'energy': 'productive_tension', 'focus': 'growth_through_challenge'},
        'challenging': {'energy': 'conflict', 'focus': 'finding_compromise'}
    },
    'trine': {
        'harmonious': {'energy': 'flowing_harmony', 'focus': 'natural_talents'},
        'challenging': {'energy': 'complacency', 'focus': 'using_gifts_wisely'}
    },
    'opposition': {
        'harmonious': {'energy': 'balanced_perspective', 'focus': 'integration_of_opposites'},
        'challenging': {'energy': 'polarization', 'focus': 'finding_middle_ground'}
    }
}

def setup_ephemeris():
    """Configure Swiss Ephemeris with data path"""
    swe.set_ephe_path('/usr/share/swisseph:/home/ubuntu/data/ephemeris')

def calculate_moon_phase(datetime_str):
    """Calculate precise moon phase"""
    setup_ephemeris()
    
    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    julian_day = swe.julday(dt.year, dt.month, dt.day, 
                           dt.hour + dt.minute/60.0 + dt.second/3600.0)
    
    try:
        # Get Sun and Moon positions
        sun_result = swe.calc_ut(julian_day, swe.SUN)
        moon_result = swe.calc_ut(julian_day, swe.MOON)
        
        if sun_result[1] != swe.OK or moon_result[1] != swe.OK:
            return None
        
        sun_lon = sun_result[0][0]
        moon_lon = moon_result[0][0]
        
        # Calculate lunar phase angle
        phase_angle = (moon_lon - sun_lon) % 360
        
        # Calculate illumination percentage
        illumination = (1 - cos(radians(phase_angle))) / 2
        
        # Determine phase name
        if phase_angle < 45 or phase_angle >= 315:
            phase_name = 'new'
        elif 45 <= phase_angle < 90:
            phase_name = 'waxing_crescent'
        elif 90 <= phase_angle < 135:
            phase_name = 'first_quarter'
        elif 135 <= phase_angle < 180:
            phase_name = 'waxing_gibbous'
        elif 180 <= phase_angle < 225:
            phase_name = 'full'
        elif 225 <= phase_angle < 270:
            phase_name = 'waning_gibbous'
        elif 270 <= phase_angle < 315:
            phase_name = 'last_quarter'
        else:
            phase_name = 'waning_crescent'
        
        # Calculate moon age (days since new moon)
        age = phase_angle / 360 * 29.53059  # synodic month length
        
        # Get moon zodiac sign
        moon_sign_index = int(moon_lon // 30)
        zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
                       'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
        zodiac_sign = zodiac_signs[moon_sign_index]
        
        return {
            'phase': phase_name,
            'illumination': illumination,
            'age': age,
            'zodiac_sign': zodiac_sign,
            'phase_angle': phase_angle
        }
        
    except Exception as e:
        print(f"Moon phase calculation error: {e}", file=sys.stderr)
        return None

def calculate_planetary_hour(datetime_str):
    """Calculate current planetary hour"""
    dt = datetime.fromisoformat(datetime_str.replace('Z', '+00:00'))
    
    # Get day of week (Monday = 0)
    day_of_week = dt.weekday()
    day_ruler = DAY_RULERS[day_of_week]
    
    # Simplified planetary hour calculation
    # In a full implementation, this would use actual sunrise/sunset times
    hour = dt.hour
    
    # Find position of day ruler in sequence
    ruler_index = PLANETARY_HOUR_SEQUENCE.index(day_ruler)
    
    # Current hour planet (simplified - assumes daylight hours)
    current_hour_index = (ruler_index + hour) % 7
    current_planet = PLANETARY_HOUR_SEQUENCE[current_hour_index]
    
    # Next hour planet
    next_hour_index = (current_hour_index + 1) % 7
    next_planet = PLANETARY_HOUR_SEQUENCE[next_hour_index]
    
    return {
        'current': {
            'planet': current_planet,
            'start_time': dt.replace(minute=0, second=0, microsecond=0).isoformat(),
            'end_time': dt.replace(hour=hour+1, minute=0, second=0, microsecond=0).isoformat()
        },
        'next': {
            'planet': next_planet,
            'start_time': dt.replace(hour=hour+1, minute=0, second=0, microsecond=0).isoformat()
        },
        'ruler': day_ruler,
        'day_night': 'day' if 6 <= hour < 18 else 'night'
    }

def assess_cosmic_intensity(aspects, moon_phase, retrogrades):
    """Assess overall cosmic intensity level"""
    
    intensity_score = 0
    
    # Moon phase contribution
    if moon_phase['phase'] in ['new', 'full']:
        intensity_score += 2
    elif moon_phase['phase'] in ['first_quarter', 'last_quarter']:
        intensity_score += 1
    
    # Aspect contributions
    major_aspects = [a for a in aspects if a.get('aspect_type') == 'major']
    exact_aspects = [a for a in aspects if a.get('exact', False)]
    
    intensity_score += len(major_aspects) * 0.5
    intensity_score += len(exact_aspects) * 1
    
    # Retrograde contributions
    for retro in retrogrades:
        if retro['is_retrograde']:
            if retro['planet'] in ['mercury', 'venus', 'mars']:
                intensity_score += 1
            else:
                intensity_score += 0.5
    
    # Classify intensity
    if intensity_score >= 6:
        return 'transformative'
    elif intensity_score >= 4:
        return 'intense'
    elif intensity_score >= 2:
        return 'active'
    else:
        return 'calm'

def generate_spiritual_influences(moon_phase, aspects, retrogrades):
    """Generate spiritual influence interpretations"""
    influences = []
    
    # Moon phase influences
    phase_info = MOON_PHASE_INFLUENCES.get(moon_phase['phase'], {})
    if phase_info:
        influences.append({
            'type': 'enhancing',
            'source': f"Moon in {moon_phase['phase']} phase",
            'areas': [phase_info.get('spiritual_focus', 'lunar_energy')],
            'advice': f"Focus on {phase_info.get('energy', 'lunar_cycles')}",
            'tarot_correlation': {
                'cards': ['The Moon', 'The High Priestess'],
                'spread': 'lunar_cycle_spread'
            }
        })
    
    # Retrograde influences
    for retro in retrogrades:
        if retro['is_retrograde'] and retro['planet'] in RETROGRADE_INFLUENCES:
            retro_info = RETROGRADE_INFLUENCES[retro['planet']]
            influences.append({
                'type': 'transformative',
                'source': f"{retro['planet'].title()} retrograde",
                'areas': retro_info['areas'],
                'advice': retro_info['advice'],
                'tarot_correlation': {
                    'cards': ['The Hermit', 'The Hanged Man'],
                    'spread': 'retrograde_reflection_spread'
                }
            })
    
    # Strong aspect influences
    strong_aspects = [a for a in aspects if a.get('strength', 0) > 0.7]
    for aspect in strong_aspects[:3]:  # Top 3 strongest
        aspect_info = ASPECT_INFLUENCES.get(aspect['type'], {})
        influence_type = aspect.get('influence', 'neutral')
        
        if aspect_info and influence_type in aspect_info:
            info = aspect_info[influence_type]
            influences.append({
                'type': 'challenging' if influence_type == 'challenging' else 'enhancing',
                'source': f"{aspect['planet1']}-{aspect['planet2']} {aspect['type']}",
                'areas': ['planetary_energies'],
                'advice': f"Work with {info['energy']} through {info['focus']}",
                'tarot_correlation': {
                    'cards': ['The Star', 'The World'],
                    'spread': 'planetary_aspect_spread'
                }
            })
    
    return influences

def suggest_optimal_activities(intensity, moon_phase, aspects):
    """Suggest optimal activities based on cosmic conditions"""
    activities = []
    
    # Base activities on cosmic intensity
    intensity_activities = {
        'calm': [
            {'activity': 'meditation', 'rating': 9, 'reason': 'Peaceful energy supports inner reflection'},
            {'activity': 'planning', 'rating': 8, 'reason': 'Clear thinking for future projects'},
            {'activity': 'study', 'rating': 8, 'reason': 'Mental clarity enhanced'}
        ],
        'active': [
            {'activity': 'manifestation_work', 'rating': 8, 'reason': 'Good energy for bringing desires into reality'},
            {'activity': 'creative_projects', 'rating': 7, 'reason': 'Inspired energy flows freely'},
            {'activity': 'communication', 'rating': 7, 'reason': 'Clear expression supported'}
        ],
        'intense': [
            {'activity': 'transformation_rituals', 'rating': 9, 'reason': 'Powerful energy for deep change'},
            {'activity': 'shadow_work', 'rating': 8, 'reason': 'Intensity reveals hidden aspects'},
            {'activity': 'healing_work', 'rating': 7, 'reason': 'Strong energy can facilitate healing'}
        ],
        'transformative': [
            {'activity': 'spiritual_breakthrough', 'rating': 10, 'reason': 'Revolutionary energy for major shifts'},
            {'activity': 'life_changing_decisions', 'rating': 8, 'reason': 'Clarity emerges from intensity'},
            {'activity': 'deep_meditation', 'rating': 9, 'reason': 'Profound insights available'}
        ]
    }
    
    base_activities = intensity_activities.get(intensity, [])
    
    # Add timing information
    now = datetime.now()
    for activity in base_activities:
        activity.update({
            'timing': {
                'start': now.isoformat(),
                'peak': (now + timedelta(hours=2)).isoformat(),
                'end': (now + timedelta(hours=6)).isoformat()
            },
            'enhancers': ['intention_setting', 'crystal_work', 'aromatherapy'],
            'cautions': ['avoid_negative_influences', 'stay_grounded']
        })
    
    return base_activities

def main():
    parser = argparse.ArgumentParser(description='Calculate cosmic weather using Swiss Ephemeris')
    parser.add_argument('--datetime', required=True, help='ISO datetime string')
    parser.add_argument('--latitude', type=float, required=True, help='Observer latitude')
    parser.add_argument('--longitude', type=float, required=True, help='Observer longitude')
    parser.add_argument('--precision', choices=['low', 'medium', 'high', 'ultra'], default='high')
    
    args = parser.parse_args()
    
    try:
        # Get all planetary positions
        planets_list = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
        
        positions_result = calculate_planetary_positions(
            args.datetime, args.latitude, args.longitude, planets_list,
            args.precision, include_retrograde=True, include_houses=True
        )
        
        if 'error' in positions_result:
            print(json.dumps({'error': positions_result['error']}))
            return
        
        # Calculate aspects
        aspects = calculate_all_aspects(positions_result['planets'], 8.0, args.precision)
        
        # Get retrograde status for all planets
        retrogrades = []
        for planet in ['mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']:
            retro_status = get_current_retrograde_status(planet, args.datetime)
            if 'error' not in retro_status:
                retrogrades.append({
                    'planet': planet,
                    'is_retrograde': retro_status['is_retrograde'],
                    'influence': RETROGRADE_INFLUENCES.get(planet, {}).get('spiritual_lesson', '')
                })
        
        # Calculate moon phase
        moon_phase = calculate_moon_phase(args.datetime)
        
        # Calculate planetary hour
        planetary_hour = calculate_planetary_hour(args.datetime)
        
        # Assess cosmic intensity
        intensity = assess_cosmic_intensity(aspects, moon_phase, retrogrades)
        
        # Generate spiritual influences
        spiritual_influences = generate_spiritual_influences(moon_phase, aspects, retrogrades)
        
        # Suggest optimal activities
        optimal_activities = suggest_optimal_activities(intensity, moon_phase, aspects)
        
        # Compile cosmic weather report
        cosmic_weather = {
            'timestamp': args.datetime,
            'location': {'latitude': args.latitude, 'longitude': args.longitude},
            'moon_phase': moon_phase,
            'planetary_hours': planetary_hour,
            'aspects': {
                'major': [a for a in aspects if a.get('aspect_type') == 'major'],
                'minor': [a for a in aspects if a.get('aspect_type') == 'minor'],
                'applying': [a for a in aspects if a.get('applying', False)]
            },
            'retrogrades': retrogrades,
            'cosmic_intensity': intensity,
            'spiritual_influences': spiritual_influences,
            'optimal_activities': optimal_activities,
            'warnings': [],  # Would be populated based on challenging aspects
            'summary': {
                'overall_energy': intensity,
                'primary_focus': spiritual_influences[0]['areas'][0] if spiritual_influences else 'balance',
                'best_activity': optimal_activities[0]['activity'] if optimal_activities else 'meditation'
            }
        }
        
        print(json.dumps(cosmic_weather, indent=2 if args.precision in ['high', 'ultra'] else None))
        
    except Exception as e:
        print(json.dumps({'error': f'Cosmic weather calculation error: {str(e)}'}))
        sys.exit(1)

if __name__ == '__main__':
    main()