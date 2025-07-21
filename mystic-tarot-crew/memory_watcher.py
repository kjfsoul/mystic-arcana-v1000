#!/usr/bin/env python3
"""
Memory Watcher - Autonomous Task Generation from Memory Updates
Monitors memory logs and automatically creates tasks based on observations
"""

import os
import json
import time
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path
import threading
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Import task pool and memory logging
from task_pool import TaskPool, TaskPriority, add_task
from memory_logger import log_invocation, log_event

logger = logging.getLogger(__name__)

class MemoryEventHandler(FileSystemEventHandler):
    """Handles memory log file changes and triggers task creation"""
    
    def __init__(self, memory_watcher):
        self.memory_watcher = memory_watcher
        self.last_processed = {}
    
    def on_modified(self, event):
        if event.is_directory:
            return
        
        if event.src_path.endswith('.json'):
            # Avoid processing the same file too frequently
            current_time = time.time()
            if (event.src_path in self.last_processed and 
                current_time - self.last_processed[event.src_path] < 5):
                return
            
            self.last_processed[event.src_path] = current_time
            self.memory_watcher.process_memory_update(event.src_path)

class MemoryWatcher:
    """
    Watches memory logs and automatically generates tasks based on patterns and triggers
    """
    
    def __init__(self, memory_log_dir: str = "crew_memory_logs", task_pool: TaskPool = None):
        self.memory_log_dir = Path(memory_log_dir)
        self.task_pool = task_pool or TaskPool()
        self.observer = None
        self.is_running = False
        
        # Task generation rules
        self.task_rules = self._load_task_generation_rules()
        
        # Statistics
        self.stats = {
            "files_processed": 0,
            "tasks_generated": 0,
            "last_activity": None
        }
        
        # Ensure memory log directory exists
        self.memory_log_dir.mkdir(exist_ok=True)
    
    def _load_task_generation_rules(self) -> Dict:
        """Load rules for converting memory observations into tasks"""
        return {
            # UI/UX Issues
            "ui_issues": {
                "patterns": [
                    "no visual feedback",
                    "hover effect missing",
                    "animation not working",
                    "slow loading",
                    "accessibility issue",
                    "mobile responsive",
                    "layout broken"
                ],
                "agent": "UIEnchanter",
                "priority": TaskPriority.HIGH,
                "task_template": "Fix UI issue: {observation}"
            },
            
            # Performance Issues
            "performance": {
                "patterns": [
                    "performance",
                    "slow",
                    "timeout",
                    "lag",
                    "memory leak",
                    "cpu usage",
                    "bundle size"
                ],
                "agent": "QualityGuardian",
                "priority": TaskPriority.HIGH,
                "task_template": "Investigate and fix performance issue: {observation}"
            },
            
            # Content Generation Needs
            "content_requests": {
                "patterns": [
                    "content needed",
                    "daily horoscope",
                    "astrological insight",
                    "spiritual guidance",
                    "tarot reading"
                ],
                "agent": "ContentAlchemist",
                "priority": TaskPriority.MEDIUM,
                "task_template": "Generate content: {observation}"
            },
            
            # User Experience Issues
            "user_experience": {
                "patterns": [
                    "user confusion",
                    "unclear instructions",
                    "onboarding",
                    "user feedback",
                    "usability",
                    "user journey"
                ],
                "agent": "PersonaLearner",
                "priority": TaskPriority.MEDIUM,
                "task_template": "Analyze and improve user experience: {observation}"
            },
            
            # Data Issues
            "data_problems": {
                "patterns": [
                    "data missing",
                    "database error",
                    "sync issue",
                    "data integrity",
                    "migration needed"
                ],
                "agent": "DataOracle",
                "priority": TaskPriority.HIGH,
                "task_template": "Resolve data issue: {observation}"
            },
            
            # Astrological Calculations
            "astro_calculations": {
                "patterns": [
                    "astronomical",
                    "ephemeris",
                    "planet position",
                    "birth chart",
                    "transit",
                    "aspect calculation"
                ],
                "agent": "AstroCalculus",
                "priority": TaskPriority.MEDIUM,
                "task_template": "Handle astronomical calculation: {observation}"
            },
            
            # Tarot Logic
            "tarot_logic": {
                "patterns": [
                    "card selection",
                    "shuffle algorithm",
                    "spread logic",
                    "card meaning",
                    "tarot interpretation"
                ],
                "agent": "CardWeaver",
                "priority": TaskPriority.MEDIUM,
                "task_template": "Improve tarot logic: {observation}"
            },
            
            # Community Management
            "community": {
                "patterns": [
                    "community",
                    "social",
                    "user interaction",
                    "moderation",
                    "engagement"
                ],
                "agent": "CommunityShaman",
                "priority": TaskPriority.LOW,
                "task_template": "Address community need: {observation}"
            },
            
            # Spiritual Guidance
            "spiritual_guidance": {
                "patterns": [
                    "spiritual crisis",
                    "guidance needed",
                    "healing request",
                    "shadow work",
                    "emotional support"
                ],
                "agents": ["Sophia", "Luna", "Sol"],  # Multiple agents can handle
                "priority": TaskPriority.HIGH,
                "task_template": "Provide spiritual guidance: {observation}"
            }
        }
    
    @log_invocation(event_type="memory_processing", user_id="memory_watcher")
    def process_memory_update(self, file_path: str):
        """Process a memory log file and generate tasks if needed"""
        try:
            self.stats["files_processed"] += 1
            self.stats["last_activity"] = datetime.now().isoformat()
            
            with open(file_path, 'r') as f:
                memory_data = json.load(f)
            
            # Extract observations and events
            observations = self._extract_observations(memory_data)
            
            for observation in observations:
                tasks_created = self._analyze_observation_for_tasks(observation)
                self.stats["tasks_generated"] += len(tasks_created)
            
            logger.info(f"Processed memory file {file_path}, created {len(tasks_created)} tasks")
            
        except Exception as e:
            logger.error(f"Failed to process memory file {file_path}: {e}")
    
    def _extract_observations(self, memory_data: Dict) -> List[str]:
        """Extract relevant observations from memory data"""
        observations = []
        
        # Handle different memory data formats
        if isinstance(memory_data, list):
            for entry in memory_data:
                if isinstance(entry, dict):
                    observations.extend(self._extract_from_entry(entry))
        elif isinstance(memory_data, dict):
            observations.extend(self._extract_from_entry(memory_data))
        
        return observations
    
    def _extract_from_entry(self, entry: Dict) -> List[str]:
        """Extract observations from a single memory entry"""
        observations = []
        
        # Look for observation content
        if "observation_content" in entry:
            observations.append(entry["observation_content"])
        
        if "contents" in entry and isinstance(entry["contents"], list):
            observations.extend(entry["contents"])
        
        if "payload" in entry and isinstance(entry["payload"], dict):
            payload = entry["payload"]
            if "description" in payload:
                observations.append(payload["description"])
            if "error" in payload:
                observations.append(f"Error: {payload['error']}")
            if "observation" in payload:
                observations.append(payload["observation"])
        
        # Look for error messages
        if "error" in entry:
            observations.append(f"Error: {entry['error']}")
        
        return observations
    
    @log_invocation(event_type="task_generation_analysis", user_id="memory_watcher")
    def _analyze_observation_for_tasks(self, observation: str) -> List[str]:
        """Analyze observation and generate appropriate tasks"""
        created_tasks = []
        observation_lower = observation.lower()
        
        for rule_name, rule in self.task_rules.items():
            # Check if observation matches any patterns
            if any(pattern in observation_lower for pattern in rule["patterns"]):
                
                # Determine which agent(s) should handle this
                agents = rule.get("agents", [rule.get("agent")])
                if not agents or agents == [None]:
                    continue
                
                for agent in agents:
                    if not agent:
                        continue
                    
                    # Create task description
                    task_description = rule["task_template"].format(observation=observation)
                    
                    # Check if similar task already exists
                    if self._similar_task_exists(task_description, agent):
                        logger.debug(f"Similar task already exists for {agent}: {task_description[:50]}...")
                        continue
                    
                    # Create the task
                    task_id = self.task_pool.add_task(
                        description=task_description,
                        agent=agent,
                        priority=rule["priority"],
                        context={
                            "source": "memory_watcher",
                            "observation": observation,
                            "rule": rule_name,
                            "auto_generated": True
                        },
                        tags=["auto_generated", rule_name]
                    )
                    
                    created_tasks.append(task_id)
                    logger.info(f"Created task {task_id} for {agent} based on observation")
                
                # Only apply the first matching rule to avoid duplicate tasks
                break
        
        return created_tasks
    
    def _similar_task_exists(self, description: str, agent: str, similarity_threshold: float = 0.8) -> bool:
        """Check if a similar task already exists for the agent"""
        pool_data = self.task_pool._load_pool()
        
        # Simple similarity check based on key words
        desc_words = set(description.lower().split())
        
        for task in pool_data["tasks"].values():
            if (task["agent"] == agent and 
                task["status"] in ["pending", "in_progress"] and
                task.get("context", {}).get("auto_generated")):
                
                existing_words = set(task["description"].lower().split())
                
                # Calculate simple word overlap
                if desc_words and existing_words:
                    overlap = len(desc_words.intersection(existing_words))
                    similarity = overlap / len(desc_words.union(existing_words))
                    
                    if similarity > similarity_threshold:
                        return True
        
        return False
    
    def add_custom_rule(self, rule_name: str, patterns: List[str], agent: str, 
                       priority: TaskPriority, task_template: str):
        """Add a custom task generation rule"""
        self.task_rules[rule_name] = {
            "patterns": patterns,
            "agent": agent,
            "priority": priority,
            "task_template": task_template
        }
        logger.info(f"Added custom rule: {rule_name}")
    
    def start_watching(self):
        """Start watching memory log directory for changes"""
        if self.is_running:
            logger.warning("Memory watcher already running")
            return
        
        self.is_running = True
        event_handler = MemoryEventHandler(self)
        self.observer = Observer()
        self.observer.schedule(event_handler, str(self.memory_log_dir), recursive=True)
        self.observer.start()
        
        logger.info(f"Started memory watcher on {self.memory_log_dir}")
        
        # Process existing files
        self._process_existing_files()
    
    def stop_watching(self):
        """Stop watching memory logs"""
        if not self.is_running:
            return
        
        self.is_running = False
        if self.observer:
            self.observer.stop()
            self.observer.join()
        
        logger.info("Stopped memory watcher")
    
    def _process_existing_files(self):
        """Process existing memory log files on startup"""
        try:
            for file_path in self.memory_log_dir.glob("*.json"):
                if file_path.stat().st_mtime > time.time() - 3600:  # Only recent files
                    self.process_memory_update(str(file_path))
        except Exception as e:
            logger.error(f"Failed to process existing files: {e}")
    
    def get_stats(self) -> Dict:
        """Get memory watcher statistics"""
        return {
            **self.stats,
            "is_running": self.is_running,
            "rules_loaded": len(self.task_rules),
            "memory_log_dir": str(self.memory_log_dir)
        }
    
    def inject_self_improvement_tasks(self):
        """Inject periodic self-improvement tasks"""
        self_improvement_tasks = [
            {
                "description": "Analyze recent user interactions and identify improvement opportunities",
                "agent": "PersonaLearner",
                "priority": TaskPriority.LOW,
                "tags": ["self_improvement", "weekly"]
            },
            {
                "description": "Review accessibility compliance of current UI components",
                "agent": "UIEnchanter", 
                "priority": TaskPriority.MEDIUM,
                "tags": ["self_improvement", "accessibility"]
            },
            {
                "description": "Audit spiritual content quality and authenticity",
                "agent": "QualityGuardian",
                "priority": TaskPriority.MEDIUM,
                "tags": ["self_improvement", "quality"]
            },
            {
                "description": "Optimize agent collaboration patterns and communication",
                "agent": "CommunityShaman",
                "priority": TaskPriority.LOW,
                "tags": ["self_improvement", "collaboration"]
            },
            {
                "description": "Update astrological calculation accuracy and data sources",
                "agent": "AstroCalculus",
                "priority": TaskPriority.MEDIUM,
                "tags": ["self_improvement", "accuracy"]
            }
        ]
        
        created_count = 0
        for task_spec in self_improvement_tasks:
            # Check if similar task exists
            if not self._similar_task_exists(task_spec["description"], task_spec["agent"]):
                task_id = self.task_pool.add_task(
                    description=task_spec["description"],
                    agent=task_spec["agent"],
                    priority=task_spec["priority"],
                    context={"source": "self_improvement", "auto_generated": True},
                    tags=task_spec["tags"]
                )
                created_count += 1
        
        logger.info(f"Injected {created_count} self-improvement tasks")
        return created_count

# Memory trigger decorator for easy integration
def memory_triggered_task(patterns: List[str], agent: str, priority: TaskPriority = TaskPriority.MEDIUM):
    """Decorator to automatically create tasks based on memory observations"""
    def decorator(func):
        def wrapper(*args, **kwargs):
            # Execute original function
            result = func(*args, **kwargs)
            
            # Check if result contains triggering patterns
            if isinstance(result, str):
                result_lower = result.lower()
                if any(pattern in result_lower for pattern in patterns):
                    # Create task
                    task_description = f"Handle result from {func.__name__}: {result[:100]}..."
                    add_task(
                        description=task_description,
                        agent=agent,
                        priority=priority,
                        context={
                            "source": "memory_trigger",
                            "function": func.__name__,
                            "auto_generated": True
                        },
                        tags=["memory_triggered"]
                    )
            
            return result
        return wrapper
    return decorator

# Global memory watcher instance
memory_watcher = MemoryWatcher()

if __name__ == "__main__":
    # Test memory watcher
    print("🧠 Testing Memory Watcher")
    
    # Start watching
    memory_watcher.start_watching()
    
    # Inject some self-improvement tasks
    memory_watcher.inject_self_improvement_tasks()
    
    print("Memory watcher running. Check task_pool.json for generated tasks.")
    print("Press Ctrl+C to stop...")
    
    try:
        while True:
            time.sleep(60)
            stats = memory_watcher.get_stats()
            print(f"Stats: {stats}")
    except KeyboardInterrupt:
        memory_watcher.stop_watching()
        print("Memory watcher stopped.")