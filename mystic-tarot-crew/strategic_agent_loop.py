#!/usr/bin/env python3
"""
Strategic Agent Loop - Autonomous CrewAI Agent Execution System
Continuously runs agents on available tasks with intelligent load balancing and collaboration
"""

import os
import sys
import time
import json
import logging
import threading
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
import schedule
from concurrent.futures import ThreadPoolExecutor, Future
import signal

# Import CrewAI components
from crewai import Process
from main import (
    create_mystic_arcana_agents, 
    create_base_task, 
    initialize_crew, 
    execute_crew,
    validate_environment
)

# Import task management
from task_pool import TaskPool, TaskStatus, TaskPriority, task_pool
from memory_watcher import MemoryWatcher, memory_watcher
from memory_logger import log_invocation, log_event

logger = logging.getLogger(__name__)

class AgentLoadBalancer:
    """Manages agent workload and prevents overloading"""
    
    def __init__(self, max_concurrent_tasks: int = 2):
        self.max_concurrent_tasks = max_concurrent_tasks
        self.agent_status = {}
        self.lock = threading.RLock()
    
    def can_assign_task(self, agent_name: str) -> bool:
        """Check if agent can take on another task"""
        with self.lock:
            current_tasks = self.agent_status.get(agent_name, {}).get("current_tasks", 0)
            return current_tasks < self.max_concurrent_tasks
    
    def assign_task(self, agent_name: str, task_id: str):
        """Mark agent as working on a task"""
        with self.lock:
            if agent_name not in self.agent_status:
                self.agent_status[agent_name] = {"current_tasks": 0, "task_ids": []}
            
            self.agent_status[agent_name]["current_tasks"] += 1
            self.agent_status[agent_name]["task_ids"].append(task_id)
            self.agent_status[agent_name]["last_assigned"] = datetime.now().isoformat()
    
    def complete_task(self, agent_name: str, task_id: str):
        """Mark agent task as completed"""
        with self.lock:
            if agent_name in self.agent_status:
                status = self.agent_status[agent_name]
                if task_id in status["task_ids"]:
                    status["task_ids"].remove(task_id)
                    status["current_tasks"] = max(0, status["current_tasks"] - 1)
                    status["last_completed"] = datetime.now().isoformat()
    
    def get_least_busy_agent(self, agents: List[str]) -> Optional[str]:
        """Get the agent with the least current workload"""
        with self.lock:
            available_agents = [agent for agent in agents if self.can_assign_task(agent)]
            if not available_agents:
                return None
            
            # Sort by current task count
            return min(available_agents, 
                      key=lambda a: self.agent_status.get(a, {}).get("current_tasks", 0))

class StrategicAgentLoop:
    """
    Main autonomous agent execution loop with intelligent task distribution
    """
    
    def __init__(self, task_pool: TaskPool = None, memory_watcher: MemoryWatcher = None):
        self.task_pool = task_pool or TaskPool()
        self.memory_watcher = memory_watcher or MemoryWatcher()
        self.load_balancer = AgentLoadBalancer(max_concurrent_tasks=2)
        self.executor = ThreadPoolExecutor(max_workers=8)
        
        # Agent management
        self.agents = {}
        self.agent_crews = {}
        self.is_running = False
        self.shutdown_event = threading.Event()
        
        # Statistics and monitoring
        self.stats = {
            "tasks_executed": 0,
            "tasks_failed": 0,
            "collaborations_requested": 0,
            "startup_time": None,
            "last_activity": None
        }
        
        # Execution intervals (seconds)
        self.main_loop_interval = 60  # 1 minute
        self.health_check_interval = 300  # 5 minutes
        self.self_improvement_interval = 3600  # 1 hour
        self.cleanup_interval = 86400  # 24 hours
    
    @log_invocation(event_type="strategic_loop_initialization", user_id="strategic_loop")
    def initialize(self) -> bool:
        """Initialize the strategic agent loop"""
        try:
            logger.info("Initializing Strategic Agent Loop...")
            
            # Validate environment
            if not validate_environment():
                logger.error("Environment validation failed")
                return False
            
            # Create all agents
            logger.info("Creating Mystic Arcana agents...")
            self.agents = create_mystic_arcana_agents()
            
            # Pre-create crews for each agent (for performance)
            logger.info("Pre-creating agent crews...")
            for agent_name, agent in self.agents.items():
                try:
                    crew = initialize_crew(
                        agents=[agent],
                        tasks=[],  # Tasks will be added dynamically
                        process=Process.sequential,
                        verbose=False,  # Reduce verbosity for autonomous mode
                        memory=False
                    )
                    self.agent_crews[agent_name] = crew
                except Exception as e:
                    logger.error(f"Failed to create crew for {agent_name}: {e}")
            
            # Start memory watcher
            self.memory_watcher.start_watching()
            
            logger.info(f"Initialized {len(self.agents)} agents with {len(self.agent_crews)} crews")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize strategic loop: {e}")
            return False
    
    @log_invocation(event_type="strategic_loop_startup", user_id="strategic_loop")
    def start(self):
        """Start the autonomous agent loop"""
        if not self.initialize():
            logger.error("Failed to initialize, cannot start")
            return False
        
        self.is_running = True
        self.stats["startup_time"] = datetime.now().isoformat()
        
        logger.info("🤖 Starting Strategic Agent Loop...")
        print("🔮✨ MYSTIC ARCANA STRATEGIC AGENT LOOP ✨🔮")
        print("=" * 60)
        print(f"🤖 {len(self.agents)} agents initialized and ready")
        print(f"⏰ Main loop: every {self.main_loop_interval}s")
        print(f"🔍 Health checks: every {self.health_check_interval}s") 
        print(f"🔧 Self-improvement: every {self.self_improvement_interval}s")
        print(f"🧹 Cleanup: every {self.cleanup_interval}s")
        print("🛑 Press Ctrl+C to stop gracefully")
        print("=" * 60)
        
        # Schedule regular tasks
        schedule.every(self.main_loop_interval).seconds.do(self._execute_main_loop)
        schedule.every(self.health_check_interval).seconds.do(self._health_check)
        schedule.every(self.self_improvement_interval).seconds.do(self._inject_self_improvement)
        schedule.every(self.cleanup_interval).seconds.do(self._cleanup_old_data)
        
        # Set up signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
        
        # Run initial tasks
        self._execute_main_loop()
        self._inject_self_improvement()
        
        # Main execution loop
        try:
            while self.is_running and not self.shutdown_event.is_set():
                schedule.run_pending()
                
                # Check for shutdown every second
                if self.shutdown_event.wait(timeout=1):
                    break
                    
        except KeyboardInterrupt:
            logger.info("Received keyboard interrupt")
        finally:
            self.stop()
        
        return True
    
    def stop(self):
        """Stop the agent loop gracefully"""
        if not self.is_running:
            return
        
        logger.info("🛑 Stopping Strategic Agent Loop...")
        self.is_running = False
        self.shutdown_event.set()
        
        # Stop memory watcher
        self.memory_watcher.stop_watching()
        
        # Shutdown thread pool
        self.executor.shutdown(wait=True, timeout=30)
        
        # Log final statistics
        final_stats = self.get_system_status()
        log_event(
            user_id="strategic_loop",
            event_type="strategic_loop_shutdown",
            payload=final_stats
        )
        
        logger.info("Strategic Agent Loop stopped")
        print("\n✨ Strategic Agent Loop shutdown complete")
    
    def _signal_handler(self, signum, frame):
        """Handle shutdown signals"""
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        self.shutdown_event.set()
    
    @log_invocation(event_type="main_loop_execution", user_id="strategic_loop")
    def _execute_main_loop(self):
        """Main execution loop - assign and execute tasks"""
        try:
            self.stats["last_activity"] = datetime.now().isoformat()
            
            # Get available agents that can take on work
            available_agents = [
                name for name in self.agents.keys()
                if self.load_balancer.can_assign_task(name) and name in self.agent_crews
            ]
            
            if not available_agents:
                logger.debug("No agents available for new tasks")
                return
            
            logger.debug(f"Checking tasks for {len(available_agents)} available agents")
            
            # Submit tasks for available agents
            futures = []
            for agent_name in available_agents:
                future = self.executor.submit(self._process_agent_tasks, agent_name)
                futures.append((agent_name, future))
            
            # Wait for completion or timeout
            for agent_name, future in futures:
                try:
                    future.result(timeout=30)  # 30 second timeout per agent
                except Exception as e:
                    logger.error(f"Agent {agent_name} task execution failed: {e}")
            
        except Exception as e:
            logger.error(f"Main loop execution failed: {e}")
    
    def _process_agent_tasks(self, agent_name: str):
        """Process available tasks for a specific agent"""
        try:
            # Get next task for this agent
            task_data = self.task_pool.get_next_task_for_agent(agent_name)
            
            if not task_data:
                logger.debug(f"No tasks available for {agent_name}")
                return
            
            task_id = task_data["id"]
            logger.info(f"🎯 Executing task {task_id} with agent {agent_name}")
            
            # Mark agent as busy
            self.load_balancer.assign_task(agent_name, task_id)
            
            try:
                # Execute the task
                success = self._execute_agent_task(agent_name, task_data)
                
                if success:
                    self.stats["tasks_executed"] += 1
                    logger.info(f"✅ Task {task_id} completed successfully by {agent_name}")
                else:
                    self.stats["tasks_failed"] += 1
                    logger.warning(f"❌ Task {task_id} failed for {agent_name}")
                    
            finally:
                # Always mark agent as available again
                self.load_balancer.complete_task(agent_name, task_id)
                
        except Exception as e:
            logger.error(f"Failed to process tasks for {agent_name}: {e}")
            self.load_balancer.complete_task(agent_name, task_data.get("id", "unknown"))
    
    def _execute_agent_task(self, agent_name: str, task_data: Dict) -> bool:
        """Execute a specific task with an agent"""
        try:
            # Create CrewAI task
            crew_task = create_base_task(
                description=task_data["description"],
                agent=self.agents[agent_name],
                expected_output=task_data["expected_output"],
                context=task_data.get("context", {}),
                output_file=task_data.get("output_file")
            )
            
            # Get the pre-created crew for this agent
            crew = self.agent_crews[agent_name]
            crew.tasks = [crew_task]  # Update tasks
            
            # Execute the crew
            result = execute_crew(crew)
            
            if result["success"]:
                # Mark task as completed
                output = result.get("result", "Task completed")
                self.task_pool.mark_task_completed(
                    task_data["id"], 
                    output=str(output)[:1000],  # Limit output size
                    output_file=task_data.get("output_file")
                )
                
                # Check if agent requests collaboration
                self._check_for_collaboration_requests(agent_name, str(output))
                
                return True
            else:
                # Mark task as failed
                error_msg = result.get("error", "Unknown execution error")
                self.task_pool.mark_task_failed(task_data["id"], error=error_msg)
                return False
                
        except Exception as e:
            logger.error(f"Task execution failed for {agent_name}: {e}")
            self.task_pool.mark_task_failed(task_data["id"], error=str(e))
            return False
    
    def _check_for_collaboration_requests(self, agent_name: str, output: str):
        """Check if agent output indicates need for collaboration"""
        collaboration_keywords = [
            "need help",
            "require assistance", 
            "collaborate with",
            "ask another agent",
            "escalate to",
            "blocked by",
            "unable to complete"
        ]
        
        output_lower = output.lower()
        
        for keyword in collaboration_keywords:
            if keyword in output_lower:
                # Find appropriate helper agent
                helper_agent = self._find_helper_agent(agent_name, output)
                
                if helper_agent:
                    collaboration_description = f"Collaboration requested by {agent_name}: {output[:200]}..."
                    
                    self.task_pool.request_collaboration(
                        requesting_agent=agent_name,
                        helper_agent=helper_agent,
                        task_description=collaboration_description,
                        context={"output": output}
                    )
                    
                    self.stats["collaborations_requested"] += 1
                    logger.info(f"🤝 Collaboration requested: {agent_name} -> {helper_agent}")
                
                break
    
    def _find_helper_agent(self, requesting_agent: str, context: str) -> Optional[str]:
        """Find the most appropriate agent to help with a request"""
        context_lower = context.lower()
        
        # Agent specialization mapping
        specializations = {
            "ui": "UIEnchanter",
            "interface": "UIEnchanter", 
            "design": "UIEnchanter",
            "data": "DataOracle",
            "database": "DataOracle",
            "astrology": "AstroCalculus",
            "astronomical": "AstroCalculus",
            "tarot": "CardWeaver",
            "card": "CardWeaver",
            "content": "ContentAlchemist",
            "writing": "ContentAlchemist",
            "user": "PersonaLearner",
            "learning": "PersonaLearner",
            "community": "CommunityShaman",
            "social": "CommunityShaman",
            "quality": "QualityGuardian",
            "testing": "QualityGuardian",
            "spiritual": "Sophia",
            "mystical": "Sophia",
            "emotional": "Luna",
            "healing": "Luna",
            "shadow": "Sol",
            "transformation": "Sol"
        }
        
        # Find best match
        for keyword, helper in specializations.items():
            if keyword in context_lower and helper != requesting_agent:
                if self.load_balancer.can_assign_task(helper):
                    return helper
        
        # Fallback to least busy agent
        available_agents = [name for name in self.agents.keys() 
                          if name != requesting_agent and self.load_balancer.can_assign_task(name)]
        
        return self.load_balancer.get_least_busy_agent(available_agents)
    
    def _health_check(self):
        """Perform system health check"""
        try:
            health_data = {
                "timestamp": datetime.now().isoformat(),
                "agents_active": len(self.agents),
                "crews_ready": len(self.agent_crews),
                "memory_watcher_running": self.memory_watcher.is_running,
                "task_pool_status": self.task_pool.get_system_status(),
                "load_balancer_status": self.load_balancer.agent_status,
                "executor_active_threads": self.executor._threads,
                "stats": self.stats
            }
            
            # Log health check
            log_event(
                user_id="strategic_loop",
                event_type="health_check",
                payload=health_data
            )
            
            logger.info(f"Health check completed: {health_data['task_pool_status']['total_tasks']} total tasks")
            
        except Exception as e:
            logger.error(f"Health check failed: {e}")
    
    def _inject_self_improvement(self):
        """Inject periodic self-improvement tasks"""
        try:
            created_count = self.memory_watcher.inject_self_improvement_tasks()
            logger.info(f"Injected {created_count} self-improvement tasks")
        except Exception as e:
            logger.error(f"Failed to inject self-improvement tasks: {e}")
    
    def _cleanup_old_data(self):
        """Clean up old tasks and data"""
        try:
            cleaned_tasks = self.task_pool.cleanup_old_tasks(days_old=7)
            logger.info(f"Cleaned up {cleaned_tasks} old tasks")
        except Exception as e:
            logger.error(f"Cleanup failed: {e}")
    
    def get_system_status(self) -> Dict:
        """Get comprehensive system status"""
        return {
            "strategic_loop": {
                "is_running": self.is_running,
                "stats": self.stats,
                "agents_count": len(self.agents),
                "crews_ready": len(self.agent_crews)
            },
            "task_pool": self.task_pool.get_system_status(),
            "memory_watcher": self.memory_watcher.get_stats(),
            "load_balancer": {
                "agent_status": self.load_balancer.agent_status,
                "max_concurrent": self.load_balancer.max_concurrent_tasks
            }
        }

# Global strategic loop instance
strategic_loop = StrategicAgentLoop(task_pool, memory_watcher)

def main():
    """Main entry point for autonomous agent execution"""
    # Set autonomous mode environment
    os.environ["AUTONOMOUS_MODE"] = "true"
    
    print("🔮 Mystic Arcana Strategic Agent Loop")
    print("Starting autonomous agent execution system...")
    
    try:
        # Start the strategic loop
        success = strategic_loop.start()
        
        if success:
            print("✅ Strategic Agent Loop completed successfully")
        else:
            print("❌ Strategic Agent Loop failed to start")
            sys.exit(1)
            
    except Exception as e:
        logger.error(f"Strategic loop failed: {e}")
        print(f"💥 Fatal error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()