#!/usr/bin/env python3
"""
Test script to verify CrewAI setup and agent creation
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_imports():
    """Test that all required imports work"""
    try:
        import crewai
        import crewai_tools
        import requests
        print("✅ All imports successful")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def test_environment():
    """Test environment variables"""
    required_vars = ['PERPLEXITY_API_KEY']
    missing = []
    
    for var in required_vars:
        if not os.getenv(var):
            missing.append(var)
    
    if missing:
        print(f"❌ Missing environment variables: {', '.join(missing)}")
        return False
    else:
        print("✅ Environment variables configured")
        return True

def test_agentic_memory():
    """Test agentic memory integration"""
    try:
        # Test local memory logger
        from memory_logger import log_invocation, log_event
        
        # Test logging an event
        log_event(user_id="test", event_type="test_event", payload={"test": True})
        
        print("✅ Agentic memory integration successful")
        return True
    except ImportError as e:
        print(f"❌ Agentic memory error: {e}")
        return False

def test_agent_creation():
    """Test basic agent creation without full execution"""
    try:
        from main import create_base_agent, perplexity_search
        
        # Create a test agent
        test_agent = create_base_agent(
            role="Test Agent",
            goal="Test agent creation",
            backstory="A simple test agent for validation"
        )
        
        print("✅ Agent creation successful")
        return True
    except Exception as e:
        print(f"❌ Agent creation error: {e}")
        return False

def main():
    """Run all tests"""
    print("🔮 Testing Mystic Arcana CrewAI Setup")
    print("=" * 40)
    
    tests = [
        ("Imports", test_imports),
        ("Environment", test_environment),
        ("Agentic Memory", test_agentic_memory),
        ("Agent Creation", test_agent_creation)
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🧪 Testing {test_name}...")
        result = test_func()
        results.append(result)
    
    print("\n" + "=" * 40)
    if all(results):
        print("🎉 All tests passed! CrewAI setup is ready.")
        print("💫 Run 'python main.py' to initialize the full crew.")
        print("🚀 Set RUN_DEMONSTRATION=true in .env to run demo tasks.")
    else:
        print("⚠️  Some tests failed. Check the output above.")
        failed_count = len([r for r in results if not r])
        print(f"   {failed_count}/{len(results)} tests failed.")

if __name__ == "__main__":
    main()