#!/usr/bin/env python3
"""
Simple test - one agent, one task, no memory, no external APIs
"""

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM

load_dotenv()

# Configure LLM
llm = LLM(
    model="claude-3-haiku-20240307",
    api_key=os.getenv('ANTHROPIC_API_KEY')
)

# Create simple agent
sophia = Agent(
    role="Tarot Reader",
    goal="Provide brief tarot insights",
    backstory="A skilled tarot reader with deep intuition",
    tools=[],
    verbose=True,
    memory=False,
    llm=llm
)

# Create simple task
task = Task(
    description="Provide a brief interpretation of The Fool tarot card for someone starting a new career",
    agent=sophia,
    expected_output="A short, insightful interpretation of The Fool card in career context"
)

# Create crew
crew = Crew(
    agents=[sophia],
    tasks=[task],
    process=Process.sequential,
    verbose=True,
    memory=False
)

print("🔮 Testing simplified CrewAI execution...")

try:
    result = crew.kickoff()
    print("\n✅ SUCCESS!")
    print("=" * 50)
    print(result)
except Exception as e:
    print(f"\n❌ FAILED: {str(e)}")