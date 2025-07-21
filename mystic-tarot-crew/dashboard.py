#!/usr/bin/env python3
"""
Mystic Arcana Agent Dashboard - Simple monitoring interface for autonomous agents
"""

import os
import json
import time
from typing import Dict, Any
from datetime import datetime, timedelta
from pathlib import Path
import argparse

# Import monitoring components
from task_pool import TaskPool, TaskStatus
from memory_watcher import MemoryWatcher

class SimpleDashboard:
    """Simple text-based dashboard for monitoring autonomous agents"""
    
    def __init__(self, task_pool: TaskPool = None, memory_watcher: MemoryWatcher = None):
        self.task_pool = task_pool or TaskPool()
        self.memory_watcher = memory_watcher or MemoryWatcher()
        self.refresh_interval = 10  # seconds
    
    def display_header(self):
        """Display dashboard header"""
        print("\033[2J\033[H")  # Clear screen and move cursor to top
        print("🔮✨ MYSTIC ARCANA AGENT DASHBOARD ✨🔮")
        print("=" * 80)
        print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} | 🔄 Auto-refresh: {self.refresh_interval}s")
        print("=" * 80)
    
    def display_system_overview(self):
        """Display high-level system status"""
        status = self.task_pool.get_system_status()
        memory_stats = self.memory_watcher.get_stats()
        
        print("📊 SYSTEM OVERVIEW")
        print("-" * 40)
        print(f"🎯 Total Tasks: {status['total_tasks']}")
        print(f"⏳ Pending: {status['status_breakdown'].get('pending', 0)}")
        print(f"🔄 In Progress: {status['status_breakdown'].get('in_progress', 0)}")
        print(f"✅ Completed: {status['status_breakdown'].get('completed', 0)}")
        print(f"❌ Failed: {status['status_breakdown'].get('failed', 0)}")
        print(f"🆘 Escalated: {status['status_breakdown'].get('escalated', 0)}")
        print(f"🧠 Memory Watcher: {'🟢 Active' if memory_stats['is_running'] else '🔴 Inactive'}")
        print(f"📁 Files Processed: {memory_stats['files_processed']}")
        print(f"🎭 Tasks Generated: {memory_stats['tasks_generated']}")
        print()
    
    def display_agent_workloads(self):
        """Display individual agent workloads"""
        status = self.task_pool.get_system_status()
        
        print("🤖 AGENT WORKLOADS")
        print("-" * 60)
        print(f"{'Agent':<20} {'Pending':<8} {'Active':<8} {'Done':<8} {'Failed':<8} {'Avg Time':<10}")
        print("-" * 60)
        
        for agent, workload in status['agent_workloads'].items():
            avg_time = f"{workload['average_task_time']:.1f}m" if workload['average_task_time'] > 0 else "N/A"
            
            print(f"{agent:<20} "
                  f"{workload['pending_tasks']:<8} "
                  f"{workload['in_progress_tasks']:<8} "
                  f"{workload['completed_tasks']:<8} "
                  f"{workload['failed_tasks']:<8} "
                  f"{avg_time:<10}")
        print()
    
    def display_recent_activity(self):
        """Display recent task activity"""
        pool_data = self.task_pool._load_pool()
        
        # Get recent tasks (last 24 hours)
        cutoff_time = datetime.now() - timedelta(hours=24)
        recent_tasks = []
        
        for task_id, task in pool_data["tasks"].items():
            updated_time = datetime.fromisoformat(task["updated_at"])
            if updated_time > cutoff_time:
                recent_tasks.append(task)
        
        # Sort by update time (most recent first)
        recent_tasks.sort(key=lambda t: t["updated_at"], reverse=True)
        
        print("📋 RECENT ACTIVITY (Last 24h)")
        print("-" * 80)
        print(f"{'Time':<12} {'Agent':<15} {'Status':<12} {'Description':<40}")
        print("-" * 80)
        
        for task in recent_tasks[:10]:  # Show last 10 tasks
            time_str = datetime.fromisoformat(task["updated_at"]).strftime("%H:%M:%S")
            status_emoji = {
                "pending": "⏳",
                "in_progress": "🔄", 
                "completed": "✅",
                "failed": "❌",
                "escalated": "🆘",
                "blocked": "🚫"
            }.get(task["status"], "❓")
            
            description = task["description"][:38] + "..." if len(task["description"]) > 38 else task["description"]
            
            print(f"{time_str:<12} "
                  f"{task['agent']:<15} "
                  f"{status_emoji} {task['status']:<10} "
                  f"{description:<40}")
        print()
    
    def display_collaboration_history(self):
        """Display recent collaboration requests"""
        pool_data = self.task_pool._load_pool()
        collaborations = pool_data.get("collaboration_history", [])
        
        if not collaborations:
            return
        
        print("🤝 COLLABORATION REQUESTS")
        print("-" * 70)
        print(f"{'Time':<12} {'Requester':<15} {'Helper':<15} {'Description':<25}")
        print("-" * 70)
        
        # Show last 5 collaborations
        for collab in collaborations[-5:]:
            time_str = datetime.fromisoformat(collab["timestamp"]).strftime("%H:%M")
            description = collab["description"][:23] + "..." if len(collab["description"]) > 23 else collab["description"]
            
            print(f"{time_str:<12} "
                  f"{collab['requesting_agent']:<15} "
                  f"{collab['helper_agent']:<15} "
                  f"{description:<25}")
        print()
    
    def display_health_indicators(self):
        """Display system health indicators"""
        # Check task pool file
        pool_file_size = Path("task_pool.json").stat().st_size if Path("task_pool.json").exists() else 0
        pool_health = "🟢 Healthy" if pool_file_size > 0 else "🔴 Missing"
        
        # Check memory logs
        memory_dir = Path("crew_memory_logs")
        memory_files = len(list(memory_dir.glob("*.json"))) if memory_dir.exists() else 0
        memory_health = "🟢 Active" if memory_files > 0 else "🟡 No recent logs"
        
        # Check for errors in logs
        log_file = Path("crew_operations.log")
        recent_errors = 0
        if log_file.exists():
            try:
                with open(log_file, 'r') as f:
                    lines = f.readlines()[-100:]  # Last 100 lines
                    recent_errors = sum(1 for line in lines if "ERROR" in line)
            except:
                pass
        
        error_health = "🟢 Clean" if recent_errors == 0 else f"🟡 {recent_errors} errors"
        
        print("🔍 HEALTH INDICATORS")
        print("-" * 40)
        print(f"📄 Task Pool: {pool_health}")
        print(f"🧠 Memory Logs: {memory_health}")
        print(f"📋 Error Count: {error_health}")
        print(f"💾 Pool Size: {pool_file_size / 1024:.1f} KB")
        print()
    
    def display_controls(self):
        """Display dashboard controls"""
        print("🎛️  CONTROLS")
        print("-" * 20)
        print("q - Quit dashboard")
        print("r - Refresh now")
        print("c - Clear old tasks")
        print("s - Show full status")
        print("h - Show this help")
        print()
    
    def run_interactive(self):
        """Run interactive dashboard"""
        import select
        import sys
        import tty
        import termios
        
        # Set up non-blocking input
        old_settings = termios.tcgetattr(sys.stdin)
        
        try:
            tty.setraw(sys.stdin.fileno())
            
            while True:
                self.display_full_dashboard()
                
                # Wait for input or timeout
                start_time = time.time()
                while time.time() - start_time < self.refresh_interval:
                    if select.select([sys.stdin], [], [], 0.1)[0]:
                        char = sys.stdin.read(1)
                        
                        if char.lower() == 'q':
                            return
                        elif char.lower() == 'r':
                            break  # Refresh now
                        elif char.lower() == 'c':
                            cleaned = self.task_pool.cleanup_old_tasks(days_old=1)
                            print(f"\n🧹 Cleaned {cleaned} old tasks. Press any key to continue...")
                            sys.stdin.read(1)
                            break
                        elif char.lower() == 's':
                            self.display_detailed_status()
                            print("\nPress any key to continue...")
                            sys.stdin.read(1)
                            break
                        elif char.lower() == 'h':
                            self.display_controls()
                            print("Press any key to continue...")
                            sys.stdin.read(1)
                            break
                    
                    time.sleep(0.1)
        
        finally:
            termios.tcsetattr(sys.stdin, termios.TCSADRAIN, old_settings)
    
    def display_full_dashboard(self):
        """Display complete dashboard"""
        self.display_header()
        self.display_system_overview()
        self.display_agent_workloads()
        self.display_recent_activity()
        self.display_collaboration_history()
        self.display_health_indicators()
        self.display_controls()
    
    def display_detailed_status(self):
        """Display detailed system status"""
        print("\033[2J\033[H")  # Clear screen
        print("🔍 DETAILED SYSTEM STATUS")
        print("=" * 80)
        
        # Task pool status
        status = self.task_pool.get_system_status()
        print(json.dumps(status, indent=2))
        
        # Memory watcher status
        memory_stats = self.memory_watcher.get_stats()
        print("\n🧠 MEMORY WATCHER STATUS")
        print(json.dumps(memory_stats, indent=2))
    
    def export_status_report(self, filename: str = None):
        """Export status report to file"""
        if not filename:
            filename = f"status_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        report = {
            "timestamp": datetime.now().isoformat(),
            "task_pool_status": self.task_pool.get_system_status(),
            "memory_watcher_status": self.memory_watcher.get_stats()
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📊 Status report exported to {filename}")

def main():
    """Main dashboard entry point"""
    parser = argparse.ArgumentParser(description="Mystic Arcana Agent Dashboard")
    parser.add_argument("--mode", choices=["interactive", "once", "export"], 
                       default="interactive", help="Dashboard mode")
    parser.add_argument("--refresh", type=int, default=10, 
                       help="Refresh interval in seconds")
    parser.add_argument("--output", type=str, 
                       help="Output file for export mode")
    
    args = parser.parse_args()
    
    # Create dashboard
    dashboard = SimpleDashboard()
    dashboard.refresh_interval = args.refresh
    
    print("🔮 Mystic Arcana Agent Dashboard")
    
    if args.mode == "interactive":
        print("Starting interactive mode... Press 'q' to quit")
        dashboard.run_interactive()
    elif args.mode == "once":
        dashboard.display_full_dashboard()
    elif args.mode == "export":
        dashboard.export_status_report(args.output)
    
    print("Dashboard session ended.")

if __name__ == "__main__":
    main()