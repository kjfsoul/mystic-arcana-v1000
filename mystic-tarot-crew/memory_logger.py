"""
Simplified memory logger for CrewAI integration
Provides logging functionality without external dependencies
"""

import json
import os
from datetime import datetime
from typing import Any, Dict, Callable
import functools

# Use local logging directory
MEMORY_LOG_DIR = os.path.join(os.path.dirname(__file__), 'crew_memory_logs')
os.makedirs(MEMORY_LOG_DIR, exist_ok=True)

def log_invocation(event_type: str = "default", user_id: str = "system"):
    """
    Decorator to log function invocations to local memory store
    
    Args:
        event_type (str): Type of event being logged
        user_id (str): User or system ID making the call
        
    Returns:
        Decorated function with logging
    """
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            # Log function call
            event_data = {
                "timestamp": datetime.utcnow().isoformat(),
                "event_type": event_type,
                "user_id": user_id,
                "function": func.__name__,
                "args_count": len(args),
                "kwargs_keys": list(kwargs.keys())
            }
            
            # Write to daily log file
            log_filename = f"{datetime.utcnow().strftime('%Y-%m-%d')}_crew_memory.jsonl"
            log_path = os.path.join(MEMORY_LOG_DIR, log_filename)
            
            try:
                with open(log_path, 'a') as f:
                    f.write(json.dumps(event_data) + '\n')
            except Exception as e:
                print(f"Warning: Could not write to memory log: {e}")
            
            # Execute the original function
            return func(*args, **kwargs)
            
        return wrapper
    return decorator

def log_event(user_id: str = "system", event_type: str = "system_event", payload: Dict[str, Any] = None):
    """
    Directly log an event to the memory store
    
    Args:
        user_id (str): User or system ID
        event_type (str): Type of event
        payload (Dict[str, Any]): Event data
    """
    if payload is None:
        payload = {}
        
    event_data = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "user_id": user_id,
        "payload": payload
    }
    
    # Write to daily log file
    log_filename = f"{datetime.utcnow().strftime('%Y-%m-%d')}_crew_memory.jsonl"
    log_path = os.path.join(MEMORY_LOG_DIR, log_filename)
    
    try:
        with open(log_path, 'a') as f:
            f.write(json.dumps(event_data) + '\n')
    except Exception as e:
        print(f"Warning: Could not write to memory log: {e}")