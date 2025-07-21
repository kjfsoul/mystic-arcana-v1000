#!/usr/bin/env python3
"""
TaskPool - Autonomous Task Management System for CrewAI Agents
Provides persistent task queue with priority, agent assignment, and collaboration features
"""

import os
import json
import time
import uuid
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from dataclasses import dataclass, asdict
from enum import Enum
from pathlib import Path
import threading
import fcntl

# Import memory logging
from memory_logger import log_invocation, log_event

logger = logging.getLogger(__name__)

class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress" 
    BLOCKED = "blocked"
    COMPLETED = "completed"
    FAILED = "failed"
    ESCALATED = "escalated"

class TaskPriority(Enum):
    CRITICAL = 5
    HIGH = 4
    MEDIUM = 3
    LOW = 2
    BACKGROUND = 1

@dataclass
class Task:
    """Represents a task in the autonomous system"""
    id: str
    description: str
    agent: str
    status: TaskStatus
    priority: TaskPriority
    created_at: str
    updated_at: str
    expected_output: str = "Task completed successfully"
    context: Dict[str, Any] = None
    dependencies: List[str] = None
    assigned_to: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    failure_count: int = 0
    max_retries: int = 3
    escalation_agent: Optional[str] = None
    output_file: Optional[str] = None
    tags: List[str] = None
    estimated_duration: Optional[int] = None  # minutes
    
    def __post_init__(self):
        if self.context is None:
            self.context = {}
        if self.dependencies is None:
            self.dependencies = []
        if self.tags is None:
            self.tags = []

class TaskPool:
    """
    Manages autonomous task queue with persistence, locking, and collaboration features
    """
    
    def __init__(self, pool_file: str = "task_pool.json", backup_interval: int = 3600):
        self.pool_file = Path(pool_file)
        self.backup_interval = backup_interval
        self.lock = threading.RLock()
        self._last_backup = time.time()
        
        # Ensure pool file exists
        if not self.pool_file.exists():
            self._initialize_pool()
        
        # Validate and repair pool if needed
        self._validate_and_repair_pool()
    
    @log_invocation(event_type="task_pool_initialization", user_id="task_system")
    def _initialize_pool(self):
        """Initialize empty task pool"""
        initial_pool = {
            "tasks": {},
            "metadata": {
                "created_at": datetime.now().isoformat(),
                "version": "1.0",
                "total_tasks_created": 0,
                "total_tasks_completed": 0,
                "last_cleanup": datetime.now().isoformat()
            },
            "agent_stats": {},
            "collaboration_history": []
        }
        
        with open(self.pool_file, 'w') as f:
            json.dump(initial_pool, f, indent=2)
        
        logger.info(f"Initialized task pool: {self.pool_file}")
    
    def _validate_and_repair_pool(self):
        """Validate pool structure and repair if corrupted"""
        try:
            with open(self.pool_file, 'r') as f:
                pool_data = json.load(f)
            
            # Check required keys
            required_keys = ["tasks", "metadata", "agent_stats", "collaboration_history"]
            if not all(key in pool_data for key in required_keys):
                logger.warning("Pool structure invalid, reinitializing...")
                self._initialize_pool()
                return
            
            # Validate task structure
            for task_id, task_data in pool_data["tasks"].items():
                if not isinstance(task_data, dict) or "status" not in task_data:
                    logger.warning(f"Invalid task {task_id}, removing...")
                    del pool_data["tasks"][task_id]
            
            # Save repaired pool
            with open(self.pool_file, 'w') as f:
                json.dump(pool_data, f, indent=2)
                
        except (json.JSONDecodeError, FileNotFoundError) as e:
            logger.error(f"Pool file corrupted: {e}, reinitializing...")
            self._initialize_pool()
    
    def _load_pool(self) -> Dict:
        """Load task pool with file locking"""
        with self.lock:
            try:
                with open(self.pool_file, 'r') as f:
                    fcntl.flock(f.fileno(), fcntl.LOCK_SH)  # Shared lock for reading
                    return json.load(f)
            except Exception as e:
                logger.error(f"Failed to load pool: {e}")
                return {"tasks": {}, "metadata": {}, "agent_stats": {}, "collaboration_history": []}
    
    def _save_pool(self, pool_data: Dict):
        """Save task pool with file locking and backup"""
        with self.lock:
            try:
                # Create backup if needed
                if time.time() - self._last_backup > self.backup_interval:
                    self._create_backup()
                    self._last_backup = time.time()
                
                # Save with exclusive lock
                with open(self.pool_file, 'w') as f:
                    fcntl.flock(f.fileno(), fcntl.LOCK_EX)  # Exclusive lock for writing
                    json.dump(pool_data, f, indent=2)
                
            except Exception as e:
                logger.error(f"Failed to save pool: {e}")
    
    def _create_backup(self):
        """Create timestamped backup of task pool"""
        backup_file = self.pool_file.with_suffix(f'.backup_{int(time.time())}')
        try:
            pool_data = self._load_pool()
            with open(backup_file, 'w') as f:
                json.dump(pool_data, f, indent=2)
            logger.info(f"Created backup: {backup_file}")
        except Exception as e:
            logger.error(f"Failed to create backup: {e}")
    
    @log_invocation(event_type="task_creation", user_id="task_system")
    def add_task(self, 
                 description: str,
                 agent: str,
                 priority: TaskPriority = TaskPriority.MEDIUM,
                 expected_output: str = "Task completed successfully",
                 context: Dict[str, Any] = None,
                 dependencies: List[str] = None,
                 escalation_agent: str = None,
                 tags: List[str] = None,
                 estimated_duration: int = None) -> str:
        """
        Add new task to the pool
        
        Returns:
            str: Task ID
        """
        task_id = str(uuid.uuid4())
        now = datetime.now().isoformat()
        
        task = Task(
            id=task_id,
            description=description,
            agent=agent,
            status=TaskStatus.PENDING,
            priority=priority,
            created_at=now,
            updated_at=now,
            expected_output=expected_output,
            context=context or {},
            dependencies=dependencies or [],
            escalation_agent=escalation_agent,
            tags=tags or [],
            estimated_duration=estimated_duration
        )
        
        pool_data = self._load_pool()
        task_dict = asdict(task)
        # Convert enums to strings for JSON serialization
        task_dict["status"] = task_dict["status"].value if hasattr(task_dict["status"], 'value') else task_dict["status"]
        task_dict["priority"] = task_dict["priority"].value if hasattr(task_dict["priority"], 'value') else task_dict["priority"]
        pool_data["tasks"][task_id] = task_dict
        pool_data["metadata"]["total_tasks_created"] = pool_data["metadata"].get("total_tasks_created", 0) + 1
        
        self._save_pool(pool_data)
        
        # Log to memory
        log_event(
            user_id="task_system",
            event_type="task_added",
            payload={
                "task_id": task_id,
                "agent": agent,
                "priority": priority.name,
                "description": description[:100]
            }
        )
        
        logger.info(f"Added task {task_id} for agent {agent}: {description[:100]}...")
        return task_id
    
    @log_invocation(event_type="task_selection", user_id="task_system")
    def get_next_task_for_agent(self, agent: str, exclude_tags: List[str] = None) -> Optional[Dict]:
        """
        Get the highest priority available task for an agent
        
        Args:
            agent: Agent name
            exclude_tags: Tags to exclude from selection
            
        Returns:
            Task dict or None if no suitable tasks
        """
        pool_data = self._load_pool()
        available_tasks = []
        exclude_tags = exclude_tags or []
        
        for task_id, task_data in pool_data["tasks"].items():
            # Check if task is available for this agent
            if (task_data["status"] == TaskStatus.PENDING.value and 
                task_data["agent"] == agent and
                not any(tag in task_data.get("tags", []) for tag in exclude_tags)):
                
                # Check dependencies
                dependencies_met = True
                for dep_id in task_data.get("dependencies", []):
                    if dep_id in pool_data["tasks"]:
                        dep_status = pool_data["tasks"][dep_id]["status"]
                        if dep_status != TaskStatus.COMPLETED.value:
                            dependencies_met = False
                            break
                
                if dependencies_met:
                    available_tasks.append(task_data)
        
        if not available_tasks:
            return None
        
        # Sort by priority (highest first), then by creation time (oldest first)
        available_tasks.sort(
            key=lambda t: (
                -TaskPriority[t["priority"]].value,
                t["created_at"]
            )
        )
        
        selected_task = available_tasks[0]
        
        # Mark task as in progress
        selected_task["status"] = TaskStatus.IN_PROGRESS.value
        selected_task["assigned_to"] = agent
        selected_task["started_at"] = datetime.now().isoformat()
        selected_task["updated_at"] = datetime.now().isoformat()
        
        pool_data["tasks"][selected_task["id"]] = selected_task
        self._save_pool(pool_data)
        
        logger.info(f"Assigned task {selected_task['id']} to agent {agent}")
        return selected_task
    
    @log_invocation(event_type="task_completion", user_id="task_system")
    def mark_task_completed(self, task_id: str, output: str = None, output_file: str = None):
        """Mark task as completed"""
        pool_data = self._load_pool()
        
        if task_id not in pool_data["tasks"]:
            logger.error(f"Task {task_id} not found")
            return False
        
        task = pool_data["tasks"][task_id]
        task["status"] = TaskStatus.COMPLETED.value
        task["completed_at"] = datetime.now().isoformat()
        task["updated_at"] = datetime.now().isoformat()
        
        if output:
            task["context"]["output"] = output
        if output_file:
            task["output_file"] = output_file
        
        pool_data["metadata"]["total_tasks_completed"] = pool_data["metadata"].get("total_tasks_completed", 0) + 1
        
        # Update agent stats
        agent = task["agent"]
        if agent not in pool_data["agent_stats"]:
            pool_data["agent_stats"][agent] = {"completed": 0, "failed": 0, "total_time": 0}
        
        pool_data["agent_stats"][agent]["completed"] += 1
        
        if task.get("started_at"):
            start_time = datetime.fromisoformat(task["started_at"])
            end_time = datetime.fromisoformat(task["completed_at"])
            duration = (end_time - start_time).total_seconds() / 60  # minutes
            pool_data["agent_stats"][agent]["total_time"] += duration
        
        self._save_pool(pool_data)
        
        logger.info(f"Task {task_id} marked as completed by {agent}")
        return True
    
    @log_invocation(event_type="task_failure", user_id="task_system")
    def mark_task_failed(self, task_id: str, error: str = None, escalate: bool = True):
        """Mark task as failed and optionally escalate"""
        pool_data = self._load_pool()
        
        if task_id not in pool_data["tasks"]:
            logger.error(f"Task {task_id} not found")
            return False
        
        task = pool_data["tasks"][task_id]
        task["failure_count"] += 1
        task["updated_at"] = datetime.now().isoformat()
        
        if error:
            if "errors" not in task["context"]:
                task["context"]["errors"] = []
            task["context"]["errors"].append({
                "timestamp": datetime.now().isoformat(),
                "error": error
            })
        
        # Escalate if max retries exceeded
        if task["failure_count"] >= task["max_retries"] and escalate:
            task["status"] = TaskStatus.ESCALATED.value
            
            # Create escalation task if escalation agent specified
            if task.get("escalation_agent"):
                escalation_description = f"ESCALATED: {task['description']}\n\nOriginal task failed {task['failure_count']} times.\nErrors: {task['context'].get('errors', [])}"
                
                self.add_task(
                    description=escalation_description,
                    agent=task["escalation_agent"],
                    priority=TaskPriority.HIGH,
                    context={"original_task_id": task_id, "escalation": True},
                    tags=["escalation"]
                )
        else:
            # Reset to pending for retry
            task["status"] = TaskStatus.PENDING.value
            task["assigned_to"] = None
            task["started_at"] = None
        
        # Update agent stats
        agent = task["agent"]
        if agent not in pool_data["agent_stats"]:
            pool_data["agent_stats"][agent] = {"completed": 0, "failed": 0, "total_time": 0}
        
        pool_data["agent_stats"][agent]["failed"] += 1
        
        self._save_pool(pool_data)
        
        logger.warning(f"Task {task_id} failed (attempt {task['failure_count']}/{task['max_retries']})")
        return True
    
    def request_collaboration(self, requesting_agent: str, helper_agent: str, 
                            task_description: str, context: Dict = None) -> str:
        """Request help from another agent"""
        collaboration_task_id = self.add_task(
            description=f"COLLABORATION REQUEST from {requesting_agent}: {task_description}",
            agent=helper_agent,
            priority=TaskPriority.HIGH,
            context={
                "collaboration": True,
                "requesting_agent": requesting_agent,
                "original_context": context or {}
            },
            tags=["collaboration"]
        )
        
        # Log collaboration
        pool_data = self._load_pool()
        pool_data["collaboration_history"].append({
            "timestamp": datetime.now().isoformat(),
            "requesting_agent": requesting_agent,
            "helper_agent": helper_agent,
            "task_id": collaboration_task_id,
            "description": task_description
        })
        self._save_pool(pool_data)
        
        logger.info(f"Collaboration requested: {requesting_agent} -> {helper_agent}")
        return collaboration_task_id
    
    def get_agent_workload(self, agent: str) -> Dict:
        """Get current workload for an agent"""
        pool_data = self._load_pool()
        
        pending_tasks = []
        in_progress_tasks = []
        
        for task_id, task in pool_data["tasks"].items():
            if task["agent"] == agent:
                if task["status"] == TaskStatus.PENDING.value:
                    pending_tasks.append(task)
                elif task["status"] == TaskStatus.IN_PROGRESS.value:
                    in_progress_tasks.append(task)
        
        stats = pool_data["agent_stats"].get(agent, {"completed": 0, "failed": 0, "total_time": 0})
        
        return {
            "agent": agent,
            "pending_tasks": len(pending_tasks),
            "in_progress_tasks": len(in_progress_tasks),
            "completed_tasks": stats["completed"],
            "failed_tasks": stats["failed"],
            "total_time_minutes": stats["total_time"],
            "average_task_time": stats["total_time"] / max(stats["completed"], 1)
        }
    
    def cleanup_old_tasks(self, days_old: int = 7):
        """Remove completed tasks older than specified days"""
        pool_data = self._load_pool()
        cutoff_date = datetime.now() - timedelta(days=days_old)
        
        tasks_to_remove = []
        for task_id, task in pool_data["tasks"].items():
            if (task["status"] in [TaskStatus.COMPLETED.value, TaskStatus.FAILED.value] and
                task.get("completed_at")):
                completed_date = datetime.fromisoformat(task["completed_at"])
                if completed_date < cutoff_date:
                    tasks_to_remove.append(task_id)
        
        for task_id in tasks_to_remove:
            del pool_data["tasks"][task_id]
        
        pool_data["metadata"]["last_cleanup"] = datetime.now().isoformat()
        self._save_pool(pool_data)
        
        logger.info(f"Cleaned up {len(tasks_to_remove)} old tasks")
        return len(tasks_to_remove)
    
    def get_system_status(self) -> Dict:
        """Get overall system status"""
        pool_data = self._load_pool()
        
        status_counts = {}
        for task in pool_data["tasks"].values():
            status = task["status"]
            status_counts[status] = status_counts.get(status, 0) + 1
        
        agent_workloads = {}
        for agent in set(task["agent"] for task in pool_data["tasks"].values()):
            agent_workloads[agent] = self.get_agent_workload(agent)
        
        return {
            "total_tasks": len(pool_data["tasks"]),
            "status_breakdown": status_counts,
            "agent_workloads": agent_workloads,
            "collaboration_requests": len(pool_data["collaboration_history"]),
            "last_cleanup": pool_data["metadata"].get("last_cleanup"),
            "pool_file_size": self.pool_file.stat().st_size if self.pool_file.exists() else 0
        }

# Global task pool instance
task_pool = TaskPool()

# Convenience functions for easy use
def add_task(description: str, agent: str, priority: TaskPriority = TaskPriority.MEDIUM, **kwargs) -> str:
    """Add task to global pool"""
    return task_pool.add_task(description, agent, priority, **kwargs)

def get_next_task_for_agent(agent: str) -> Optional[Dict]:
    """Get next task for agent from global pool"""
    return task_pool.get_next_task_for_agent(agent)

def mark_task_completed(task_id: str, output: str = None) -> bool:
    """Mark task as completed in global pool"""
    return task_pool.mark_task_completed(task_id, output)

def mark_task_failed(task_id: str, error: str = None) -> bool:
    """Mark task as failed in global pool"""
    return task_pool.mark_task_failed(task_id, error)

def request_collaboration(requesting_agent: str, helper_agent: str, task_description: str) -> str:
    """Request collaboration from another agent"""
    return task_pool.request_collaboration(requesting_agent, helper_agent, task_description)

if __name__ == "__main__":
    # Test the task pool
    print("🔮 Testing Mystic Arcana Task Pool")
    
    # Add some test tasks
    task1 = add_task("Generate daily astrological content", "ContentAlchemist", TaskPriority.HIGH)
    task2 = add_task("Fix card rotation bug", "UIEnchanter", TaskPriority.MEDIUM)
    task3 = add_task("Analyze user feedback patterns", "PersonaLearner", TaskPriority.LOW)
    
    print(f"Added tasks: {task1}, {task2}, {task3}")
    
    # Test task assignment
    next_task = get_next_task_for_agent("ContentAlchemist")
    if next_task:
        print(f"Next task for ContentAlchemist: {next_task['description']}")
        mark_task_completed(next_task['id'], "Content generated successfully")
    
    # Show system status
    status = task_pool.get_system_status()
    print(f"System status: {status}")