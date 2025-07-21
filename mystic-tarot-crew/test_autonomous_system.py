#!/usr/bin/env python3
"""
Test Suite for Autonomous CrewAI System
Validates task pool, memory watcher, and strategic loop functionality
"""

import os
import json
import time
import tempfile
from pathlib import Path
import unittest
from unittest.mock import patch, MagicMock

# Import components to test
from task_pool import TaskPool, TaskPriority, TaskStatus
from memory_watcher import MemoryWatcher
from memory_logger import log_event

class TestTaskPool(unittest.TestCase):
    """Test TaskPool functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.pool_file = os.path.join(self.temp_dir, "test_pool.json")
        self.task_pool = TaskPool(self.pool_file)
    
    def test_task_creation(self):
        """Test creating tasks"""
        task_id = self.task_pool.add_task(
            description="Test task",
            agent="TestAgent",
            priority=TaskPriority.HIGH
        )
        
        self.assertIsNotNone(task_id)
        self.assertTrue(len(task_id) > 0)
        
        # Verify task exists in pool
        pool_data = self.task_pool._load_pool()
        self.assertIn(task_id, pool_data["tasks"])
        
        task = pool_data["tasks"][task_id]
        self.assertEqual(task["description"], "Test task")
        self.assertEqual(task["agent"], "TestAgent")
        self.assertEqual(task["priority"], TaskPriority.HIGH.name)
        self.assertEqual(task["status"], TaskStatus.PENDING.value)
    
    def test_task_assignment(self):
        """Test task assignment to agents"""
        # Create multiple tasks
        task1 = self.task_pool.add_task("Task 1", "Agent1", TaskPriority.HIGH)
        task2 = self.task_pool.add_task("Task 2", "Agent1", TaskPriority.LOW)
        task3 = self.task_pool.add_task("Task 3", "Agent2", TaskPriority.MEDIUM)
        
        # Get next task for Agent1 (should be highest priority)
        next_task = self.task_pool.get_next_task_for_agent("Agent1")
        
        self.assertIsNotNone(next_task)
        self.assertEqual(next_task["id"], task1)  # Higher priority task
        self.assertEqual(next_task["status"], TaskStatus.IN_PROGRESS.value)
        
        # Get next task for Agent2
        next_task_2 = self.task_pool.get_next_task_for_agent("Agent2")
        self.assertEqual(next_task_2["id"], task3)
    
    def test_task_completion(self):
        """Test marking tasks as completed"""
        task_id = self.task_pool.add_task("Test completion", "Agent1")
        
        # Assign task
        next_task = self.task_pool.get_next_task_for_agent("Agent1")
        self.assertEqual(next_task["id"], task_id)
        
        # Complete task
        success = self.task_pool.mark_task_completed(task_id, "Task output")
        self.assertTrue(success)
        
        # Verify completion
        pool_data = self.task_pool._load_pool()
        task = pool_data["tasks"][task_id]
        self.assertEqual(task["status"], TaskStatus.COMPLETED.value)
        self.assertIsNotNone(task["completed_at"])
        self.assertEqual(task["context"]["output"], "Task output")
    
    def test_task_failure_and_retry(self):
        """Test task failure handling and retries"""
        task_id = self.task_pool.add_task("Test failure", "Agent1")
        
        # Assign and fail task
        next_task = self.task_pool.get_next_task_for_agent("Agent1")
        success = self.task_pool.mark_task_failed(task_id, "Test error")
        self.assertTrue(success)
        
        # Verify task is back to pending for retry
        pool_data = self.task_pool._load_pool()
        task = pool_data["tasks"][task_id]
        self.assertEqual(task["status"], TaskStatus.PENDING.value)
        self.assertEqual(task["failure_count"], 1)
        
        # Fail multiple times to trigger escalation
        for i in range(3):  # max_retries = 3
            next_task = self.task_pool.get_next_task_for_agent("Agent1")
            self.task_pool.mark_task_failed(task_id, f"Error {i+2}")
        
        # Should be escalated now
        pool_data = self.task_pool._load_pool()
        task = pool_data["tasks"][task_id]
        self.assertEqual(task["status"], TaskStatus.ESCALATED.value)
    
    def test_collaboration(self):
        """Test agent collaboration"""
        collab_task_id = self.task_pool.request_collaboration(
            requesting_agent="Agent1",
            helper_agent="Agent2", 
            task_description="Need help with X"
        )
        
        self.assertIsNotNone(collab_task_id)
        
        # Verify collaboration task created
        pool_data = self.task_pool._load_pool()
        task = pool_data["tasks"][collab_task_id]
        self.assertEqual(task["agent"], "Agent2")
        self.assertEqual(task["priority"], TaskPriority.HIGH.name)
        self.assertIn("collaboration", task["tags"])
        
        # Verify collaboration history
        self.assertGreater(len(pool_data["collaboration_history"]), 0)
    
    def test_workload_tracking(self):
        """Test agent workload tracking"""
        # Create and complete some tasks
        task1 = self.task_pool.add_task("Task 1", "Agent1")
        task2 = self.task_pool.add_task("Task 2", "Agent1")
        
        # Complete first task
        next_task = self.task_pool.get_next_task_for_agent("Agent1")
        self.task_pool.mark_task_completed(task1, "Done")
        
        # Fail second task
        next_task = self.task_pool.get_next_task_for_agent("Agent1")
        self.task_pool.mark_task_failed(task2, "Failed")
        
        # Check workload
        workload = self.task_pool.get_agent_workload("Agent1")
        self.assertEqual(workload["completed_tasks"], 1)
        self.assertEqual(workload["failed_tasks"], 1)
        self.assertGreaterEqual(workload["total_time_minutes"], 0)

class TestMemoryWatcher(unittest.TestCase):
    """Test MemoryWatcher functionality"""
    
    def setUp(self):
        """Set up test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.memory_dir = os.path.join(self.temp_dir, "memory_logs")
        os.makedirs(self.memory_dir, exist_ok=True)
        
        self.task_pool = TaskPool(os.path.join(self.temp_dir, "test_pool.json"))
        self.memory_watcher = MemoryWatcher(self.memory_dir, self.task_pool)
    
    def test_memory_file_processing(self):
        """Test processing memory log files"""
        # Create test memory file
        memory_data = {
            "timestamp": "2025-01-31T12:00:00",
            "event_type": "ui_issue",
            "observation_content": "User reported hover effect missing on cards"
        }
        
        memory_file = os.path.join(self.memory_dir, "test_memory.json")
        with open(memory_file, 'w') as f:
            json.dump(memory_data, f)
        
        # Process the file
        self.memory_watcher.process_memory_update(memory_file)
        
        # Check if task was created
        pool_data = self.task_pool._load_pool()
        ui_tasks = [t for t in pool_data["tasks"].values() 
                   if t["agent"] == "UIEnchanter" and "hover effect" in t["description"]]
        
        self.assertGreater(len(ui_tasks), 0)
    
    def test_task_generation_rules(self):
        """Test different task generation rules"""
        test_observations = [
            ("performance issue with loading", "QualityGuardian"),
            ("need daily horoscope content", "ContentAlchemist"),
            ("user confusion about navigation", "PersonaLearner"),
            ("database sync error", "DataOracle"),
            ("card shuffle algorithm broken", "CardWeaver")
        ]
        
        for observation, expected_agent in test_observations:
            tasks_before = len(self.task_pool._load_pool()["tasks"])
            
            self.memory_watcher._analyze_observation_for_tasks(observation)
            
            tasks_after = len(self.task_pool._load_pool()["tasks"])
            self.assertGreater(tasks_after, tasks_before, 
                             f"No task created for observation: {observation}")
            
            # Check if correct agent was assigned
            pool_data = self.task_pool._load_pool()
            latest_task = max(pool_data["tasks"].values(), 
                            key=lambda t: t["created_at"])
            self.assertEqual(latest_task["agent"], expected_agent)
    
    def test_self_improvement_tasks(self):
        """Test self-improvement task injection"""
        tasks_before = len(self.task_pool._load_pool()["tasks"])
        
        created_count = self.memory_watcher.inject_self_improvement_tasks()
        
        tasks_after = len(self.task_pool._load_pool()["tasks"])
        self.assertEqual(tasks_after - tasks_before, created_count)
        self.assertGreater(created_count, 0)
        
        # Verify tasks have self_improvement tags
        pool_data = self.task_pool._load_pool()
        improvement_tasks = [t for t in pool_data["tasks"].values() 
                           if "self_improvement" in t.get("tags", [])]
        self.assertEqual(len(improvement_tasks), created_count)

class TestIntegration(unittest.TestCase):
    """Integration tests for the complete system"""
    
    def setUp(self):
        """Set up integration test environment"""
        self.temp_dir = tempfile.mkdtemp()
        self.task_pool = TaskPool(os.path.join(self.temp_dir, "integration_pool.json"))
        self.memory_watcher = MemoryWatcher(
            os.path.join(self.temp_dir, "memory_logs"), 
            self.task_pool
        )
    
    def test_memory_to_task_flow(self):
        """Test complete flow from memory observation to task execution"""
        # Simulate memory event
        log_event(
            user_id="test_user",
            event_type="ui_feedback",
            payload={
                "observation": "Button hover effect not working on mobile",
                "severity": "medium"
            }
        )
        
        # Create memory file manually for test
        memory_file = os.path.join(self.temp_dir, "memory_logs", "test_event.json")
        os.makedirs(os.path.dirname(memory_file), exist_ok=True)
        
        memory_data = {
            "observation_content": "Button hover effect not working on mobile"
        }
        
        with open(memory_file, 'w') as f:
            json.dump(memory_data, f)
        
        # Process memory update
        self.memory_watcher.process_memory_update(memory_file)
        
        # Verify task was created
        pool_data = self.task_pool._load_pool()
        mobile_tasks = [t for t in pool_data["tasks"].values() 
                       if "mobile" in t["description"].lower() and t["agent"] == "UIEnchanter"]
        
        self.assertGreater(len(mobile_tasks), 0)
        
        # Test task assignment and completion
        next_task = self.task_pool.get_next_task_for_agent("UIEnchanter")
        self.assertIsNotNone(next_task)
        
        # Complete the task
        success = self.task_pool.mark_task_completed(
            next_task["id"], 
            "Fixed mobile hover effects with CSS media queries"
        )
        self.assertTrue(success)
    
    @patch('strategic_agent_loop.create_mystic_arcana_agents')
    def test_agent_loop_simulation(self, mock_create_agents):
        """Test strategic agent loop simulation"""
        # Mock agents
        mock_agents = {
            "UIEnchanter": MagicMock(),
            "ContentAlchemist": MagicMock()
        }
        mock_create_agents.return_value = mock_agents
        
        # Add test tasks
        ui_task = self.task_pool.add_task(
            "Fix button alignment", 
            "UIEnchanter", 
            TaskPriority.HIGH
        )
        content_task = self.task_pool.add_task(
            "Generate daily content", 
            "ContentAlchemist", 
            TaskPriority.MEDIUM
        )
        
        # Simulate task assignment
        ui_next = self.task_pool.get_next_task_for_agent("UIEnchanter")
        content_next = self.task_pool.get_next_task_for_agent("ContentAlchemist")
        
        self.assertEqual(ui_next["id"], ui_task)
        self.assertEqual(content_next["id"], content_task)
        
        # Simulate completion
        self.task_pool.mark_task_completed(ui_task, "UI fixed")
        self.task_pool.mark_task_completed(content_task, "Content generated")
        
        # Verify system status
        status = self.task_pool.get_system_status()
        self.assertEqual(status["status_breakdown"]["completed"], 2)

def run_system_test():
    """Run a comprehensive system test"""
    print("🧪 Running Autonomous System Tests")
    print("=" * 50)
    
    # Run unit tests
    test_suite = unittest.TestLoader().loadTestsFromModule(__import__(__name__))
    test_runner = unittest.TextTestRunner(verbosity=2)
    result = test_runner.run(test_suite)
    
    if result.wasSuccessful():
        print("\n✅ All tests passed!")
        print("🔮 Autonomous system is ready for deployment")
        return True
    else:
        print(f"\n❌ {len(result.failures)} test(s) failed")
        print(f"❌ {len(result.errors)} error(s) occurred")
        return False

def create_demo_tasks():
    """Create demonstration tasks for testing"""
    from task_pool import task_pool
    
    print("🎭 Creating demonstration tasks...")
    
    demo_tasks = [
        ("Generate mystical daily content for Aquarius season", "ContentAlchemist", TaskPriority.HIGH),
        ("Fix card flip animation timing issues", "UIEnchanter", TaskPriority.MEDIUM),
        ("Analyze user engagement patterns from last week", "PersonaLearner", TaskPriority.LOW),
        ("Calculate accurate moon phase for birth charts", "AstroCalculus", TaskPriority.MEDIUM),
        ("Improve three-card spread interpretation logic", "CardWeaver", TaskPriority.HIGH),
        ("Review spiritual content for cultural sensitivity", "QualityGuardian", TaskPriority.MEDIUM),
        ("Design community sharing features", "CommunityShaman", TaskPriority.LOW),
        ("Optimize database queries for reading history", "DataOracle", TaskPriority.MEDIUM),
        ("Provide guidance for relationship healing", "Luna", TaskPriority.HIGH),
        ("Create shadow work integration exercise", "Sol", TaskPriority.MEDIUM),
        ("Channel weekly wisdom for spiritual growth", "Sophia", TaskPriority.HIGH),
        ("Research current astrological transits", "Orion", TaskPriority.MEDIUM)
    ]
    
    created_count = 0
    for description, agent, priority in demo_tasks:
        task_id = task_pool.add_task(
            description=description,
            agent=agent,
            priority=priority,
            context={"demo": True, "created_by": "test_suite"},
            tags=["demo", "test"]
        )
        created_count += 1
        print(f"  ✓ Created task {task_id[:8]}... for {agent}")
    
    print(f"🎯 Created {created_count} demonstration tasks")
    return created_count

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Test Autonomous CrewAI System")
    parser.add_argument("--mode", choices=["test", "demo", "both"], 
                       default="both", help="Test mode")
    
    args = parser.parse_args()
    
    if args.mode in ["test", "both"]:
        success = run_system_test()
    else:
        success = True
    
    if args.mode in ["demo", "both"] and success:
        print("\n" + "=" * 50)
        demo_count = create_demo_tasks()
        
        if demo_count > 0:
            print("\n🚀 Demo tasks created! You can now:")
            print("  1. Run: python strategic_agent_loop.py")
            print("  2. Monitor: python dashboard.py")
            print("  3. View tasks: cat task_pool.json")
    
    if success:
        print("\n🔮✨ Autonomous system test completed successfully! ✨🔮")
    else:
        print("\n❌ System test failed - check logs for details")
        exit(1)