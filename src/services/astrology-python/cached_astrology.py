#!/usr/bin/env python3
"""
Cached Astrology Python Wrapper
Implements caching layer for astronomical calculations with Redis/memory fallback
Integrates with Supabase caching for persistent storage
"""

import json
import sys
import hashlib
import time
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, Tuple
import logging

# Import the existing astrology functions
from simple_astrology import (
    create_birth_chart,
    create_synastry_chart,
    get_current_transits,
    geocode_location,
    calculate_placidus_houses
)

# Try to import Redis for in-memory caching
try:
    import redis
    REDIS_AVAILABLE = True
    redis_client = redis.Redis(
        host='localhost',
        port=6379,
        db=0,
        decode_responses=True,
        socket_connect_timeout=1,
        socket_timeout=1
    )
    # Test connection
    redis_client.ping()
    print("Redis connected for in-memory caching", file=sys.stderr)
except (ImportError, redis.ConnectionError, redis.TimeoutError):
    REDIS_AVAILABLE = False
    redis_client = None
    print("Redis not available - using memory-only caching", file=sys.stderr)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AstrologyCalculationCache:
    """
    Caching wrapper for astronomical calculations
    Provides both Redis and in-memory fallback caching
    """
    
    def __init__(self):
        self.memory_cache: Dict[str, Tuple[Any, float]] = {}
        self.redis_client = redis_client if REDIS_AVAILABLE else None
        
        # Cache TTL settings (seconds)
        self.ttl_settings = {
            'birth_chart': 7 * 24 * 60 * 60,  # 7 days
            'transits': 60 * 60,              # 1 hour
            'synastry': 24 * 60 * 60,         # 24 hours
            'placidus_houses': 7 * 24 * 60 * 60,  # 7 days
            'geocode': 30 * 24 * 60 * 60      # 30 days
        }
        
        # Performance tracking
        self.stats = {
            'total_requests': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'calculation_time_saved': 0.0
        }
    
    def generate_cache_key(self, operation_type: str, params: Dict[str, Any]) -> str:
        """Generate consistent cache key from operation type and parameters"""
        # Normalize parameters for consistent hashing
        normalized_params = self._normalize_params(params)
        param_string = json.dumps(normalized_params, sort_keys=True)
        
        # Create hash
        key_hash = hashlib.md5(param_string.encode()).hexdigest()
        return f"mystic_arcana:{operation_type}:{key_hash}"
    
    def _normalize_params(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Normalize parameters for consistent caching"""
        normalized = {}
        
        for key, value in params.items():
            if key in ['latitude', 'longitude'] and isinstance(value, (int, float)):
                # Round coordinates to 2 decimal places
                normalized[key] = round(float(value), 2)
            elif key in ['year', 'month', 'day', 'hour', 'minute'] and isinstance(value, (int, float)):
                # Ensure integers for time components
                normalized[key] = int(value)
            elif isinstance(value, str):
                # Normalize strings
                normalized[key] = value.lower().strip()
            else:
                normalized[key] = value
                
        return normalized
    
    def get_cached_result(self, cache_key: str, operation_type: str) -> Optional[Any]:
        """Retrieve cached result from Redis or memory cache"""
        self.stats['total_requests'] += 1
        
        # Try Redis first
        if self.redis_client:
            try:
                cached_data = self.redis_client.get(cache_key)
                if cached_data:
                    result = json.loads(cached_data)
                    self.stats['cache_hits'] += 1
                    logger.info(f"Redis cache HIT for {operation_type}")
                    return result
            except Exception as e:
                logger.warning(f"Redis cache lookup failed: {e}")
        
        # Fallback to memory cache
        if cache_key in self.memory_cache:
            cached_result, timestamp = self.memory_cache[cache_key]
            ttl = self.ttl_settings.get(operation_type, 3600)
            
            if time.time() - timestamp < ttl:
                self.stats['cache_hits'] += 1
                logger.info(f"Memory cache HIT for {operation_type}")
                return cached_result
            else:
                # Expired - remove from memory cache
                del self.memory_cache[cache_key]
        
        # Cache miss
        self.stats['cache_misses'] += 1
        logger.info(f"Cache MISS for {operation_type}")
        return None
    
    def set_cached_result(self, cache_key: str, operation_type: str, result: Any) -> None:
        """Store result in Redis and memory cache"""
        ttl = self.ttl_settings.get(operation_type, 3600)
        
        # Store in Redis
        if self.redis_client:
            try:
                serialized_result = json.dumps(result, default=str)
                self.redis_client.setex(cache_key, ttl, serialized_result)
                logger.info(f"Stored result in Redis cache (TTL: {ttl}s)")
            except Exception as e:
                logger.warning(f"Redis cache storage failed: {e}")
        
        # Store in memory cache
        self.memory_cache[cache_key] = (result, time.time())
        logger.info(f"Stored result in memory cache")
        
        # Clean old memory cache entries periodically
        if len(self.memory_cache) > 1000:
            self._clean_memory_cache()
    
    def _clean_memory_cache(self) -> None:
        """Clean expired entries from memory cache"""
        current_time = time.time()
        expired_keys = []
        
        for key, (_, timestamp) in self.memory_cache.items():
            # Use shortest TTL for cleanup
            if current_time - timestamp > min(self.ttl_settings.values()):
                expired_keys.append(key)
        
        for key in expired_keys:
            del self.memory_cache[key]
        
        logger.info(f"Cleaned {len(expired_keys)} expired entries from memory cache")
    
    def cached_birth_chart(self, **kwargs) -> Dict[str, Any]:
        """Cached birth chart calculation"""
        cache_key = self.generate_cache_key('birth_chart', kwargs)
        
        # Check cache first
        cached_result = self.get_cached_result(cache_key, 'birth_chart')
        if cached_result:
            cached_result['cache_hit'] = True
            return cached_result
        
        # Calculate if not cached
        start_time = time.time()
        try:
            result = create_birth_chart(**kwargs)
            calculation_time = time.time() - start_time
            
            # Add cache metadata
            result['cache_hit'] = False
            result['calculation_time_ms'] = int(calculation_time * 1000)
            result['cached_at'] = datetime.utcnow().isoformat()
            
            # Store in cache
            self.set_cached_result(cache_key, 'birth_chart', result)
            self.stats['calculation_time_saved'] += calculation_time
            
            logger.info(f"Birth chart calculated in {calculation_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"Birth chart calculation failed: {e}")
            raise
    
    def cached_transits(self, **kwargs) -> Dict[str, Any]:
        """Cached transit calculation with 1-hour TTL"""
        cache_key = self.generate_cache_key('transits', kwargs)
        
        # Check cache first
        cached_result = self.get_cached_result(cache_key, 'transits')
        if cached_result:
            cached_result['cache_hit'] = True
            return cached_result
        
        # Calculate if not cached
        start_time = time.time()
        try:
            result = get_current_transits()
            calculation_time = time.time() - start_time
            
            # Add cache metadata
            result['cache_hit'] = False
            result['calculation_time_ms'] = int(calculation_time * 1000)
            result['cached_at'] = datetime.utcnow().isoformat()
            
            # Store in cache with 1-hour TTL
            self.set_cached_result(cache_key, 'transits', result)
            
            logger.info(f"Transits calculated in {calculation_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"Transit calculation failed: {e}")
            raise
    
    def cached_synastry(self, person1_data: Dict[str, Any], person2_data: Dict[str, Any]) -> Dict[str, Any]:
        """Cached synastry calculation"""
        cache_params = {'person1': person1_data, 'person2': person2_data}
        cache_key = self.generate_cache_key('synastry', cache_params)
        
        # Check cache first
        cached_result = self.get_cached_result(cache_key, 'synastry')
        if cached_result:
            cached_result['cache_hit'] = True
            return cached_result
        
        # Calculate if not cached
        start_time = time.time()
        try:
            result = create_synastry_chart(person1_data, person2_data)
            calculation_time = time.time() - start_time
            
            # Add cache metadata
            result['cache_hit'] = False
            result['calculation_time_ms'] = int(calculation_time * 1000)
            result['cached_at'] = datetime.utcnow().isoformat()
            
            # Store in cache
            self.set_cached_result(cache_key, 'synastry', result)
            
            logger.info(f"Synastry calculated in {calculation_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"Synastry calculation failed: {e}")
            raise
    
    def cached_placidus_houses(self, **kwargs) -> Dict[str, Any]:
        """Cached Placidus house calculation"""
        cache_key = self.generate_cache_key('placidus_houses', kwargs)
        
        # Check cache first
        cached_result = self.get_cached_result(cache_key, 'placidus_houses')
        if cached_result:
            cached_result['cache_hit'] = True
            return cached_result
        
        # Calculate if not cached
        start_time = time.time()
        try:
            result = calculate_placidus_houses(**kwargs)
            calculation_time = time.time() - start_time
            
            # Add cache metadata
            result['cache_hit'] = False
            result['calculation_time_ms'] = int(calculation_time * 1000)
            result['cached_at'] = datetime.utcnow().isoformat()
            
            # Store in cache
            self.set_cached_result(cache_key, 'placidus_houses', result)
            
            logger.info(f"Placidus houses calculated in {calculation_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"Placidus house calculation failed: {e}")
            raise
    
    def cached_geocoding(self, city: str, country: str = "") -> Dict[str, Any]:
        """Cached geocoding with long TTL"""
        cache_params = {'city': city, 'country': country}
        cache_key = self.generate_cache_key('geocode', cache_params)
        
        # Check cache first
        cached_result = self.get_cached_result(cache_key, 'geocode')
        if cached_result:
            cached_result['cache_hit'] = True
            return cached_result
        
        # Calculate if not cached
        start_time = time.time()
        try:
            result = geocode_location(city, country)
            calculation_time = time.time() - start_time
            
            # Add cache metadata
            result['cache_hit'] = False
            result['calculation_time_ms'] = int(calculation_time * 1000)
            result['cached_at'] = datetime.utcnow().isoformat()
            
            # Store in cache with long TTL (30 days)
            self.set_cached_result(cache_key, 'geocode', result)
            
            logger.info(f"Geocoding completed in {calculation_time:.3f}s")
            return result
            
        except Exception as e:
            logger.error(f"Geocoding failed: {e}")
            raise
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Get cache performance statistics"""
        total_requests = self.stats['total_requests']
        if total_requests > 0:
            hit_rate = (self.stats['cache_hits'] / total_requests) * 100
        else:
            hit_rate = 0.0
            
        return {
            'total_requests': total_requests,
            'cache_hits': self.stats['cache_hits'],
            'cache_misses': self.stats['cache_misses'],
            'hit_rate_percent': round(hit_rate, 2),
            'calculation_time_saved_seconds': round(self.stats['calculation_time_saved'], 3),
            'memory_cache_size': len(self.memory_cache),
            'redis_available': REDIS_AVAILABLE
        }
    
    def clear_cache(self) -> None:
        """Clear all cached data"""
        # Clear Redis cache
        if self.redis_client:
            try:
                # Delete all mystic_arcana cache keys
                keys = self.redis_client.keys('mystic_arcana:*')
                if keys:
                    self.redis_client.delete(*keys)
                    logger.info(f"Cleared {len(keys)} keys from Redis cache")
            except Exception as e:
                logger.warning(f"Redis cache clear failed: {e}")
        
        # Clear memory cache
        self.memory_cache.clear()
        logger.info("Cleared memory cache")
        
        # Reset stats
        self.stats = {
            'total_requests': 0,
            'cache_hits': 0,
            'cache_misses': 0,
            'calculation_time_saved': 0.0
        }

# Global cache instance
astrology_cache = AstrologyCalculationCache()

def main():
    """Main entry point for cached astrology calculations"""
    import argparse
    
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
        parser = argparse.ArgumentParser(description='Cached Astrology Calculations')
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
                result = astrology_cache.cached_birth_chart(
                    data.get('name', 'Unknown'),
                    data['birthDate'],
                    location.get('city', 'Unknown'),
                    location.get('country', '')
                )
            elif 'birthDate' in data:
                # Direct format from calculate endpoint
                result = astrology_cache.cached_birth_chart(
                    data.get('name', 'Unknown'),
                    data['birthDate'],
                    data.get('city', 'Unknown'),
                    data.get('country', '')
                )
            else:
                # Legacy format
                result = astrology_cache.cached_birth_chart(
                    data['name'],
                    data['birthDate'] if 'birthDate' in data else data.get('date'),
                    data['city'],
                    data.get('country', '')
                )
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'synastry':
            result = astrology_cache.cached_synastry(data['person1'], data['person2'])
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'transits':
            result = astrology_cache.cached_transits()
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'geocode':
            result = astrology_cache.cached_geocoding(data['city'], data.get('country', ''))
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'placidus-houses':
            result = astrology_cache.cached_placidus_houses(
                data['julian_day'],
                data['latitude'],
                data['longitude'],
                data.get('house_system', 'placidus')
            )
            print(json.dumps({'success': True, 'data': result}))
            
        elif action == 'cache-stats':
            stats = astrology_cache.get_cache_stats()
            print(json.dumps({'success': True, 'data': stats}))
            
        elif action == 'clear-cache':
            astrology_cache.clear_cache()
            print(json.dumps({'success': True, 'message': 'Cache cleared successfully'}))
            
        else:
            print(json.dumps({'success': False, 'error': f'Unknown action: {action}'}))
            
    except Exception as e:
        print(json.dumps({'success': False, 'error': str(e)}))

if __name__ == '__main__':
    main()