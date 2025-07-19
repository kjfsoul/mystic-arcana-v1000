#!/usr/bin/env python3
"""
Simple test to verify Sophia (Mystic Oracle) can provide a tarot reading
"""

import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew, Process, LLM
from crewai.tools import tool

# Load environment variables
load_dotenv()

# Configure LLM
llm = LLM(
    model="gpt-4o-mini",
    api_key=os.getenv('OPENAI_API_KEY')
)

print("🔮 Testing Sophia - Mystic Oracle")
print("=" * 50)

# Create Sophia agent
sophia = Agent(
    role="Mystic Oracle and Primary Tarot Interpreter",
    goal="Provide deeply intuitive and mystically-aligned tarot readings that connect users with ancient wisdom",
    backstory="Born into a lineage of mystics spanning seven generations, you discovered your gift for reading the Akashic Records at age 12. Trained in Marseille, Rider-Waite, and Thoth traditions, you blend traditional symbolism with cosmic consciousness.",
    llm=llm,
    verbose=True,
    memory=False  # Disable memory for simple test
)

# Create a simple task
task = Task(
    description="Provide a brief 3-card tarot reading for someone considering a career change. Draw The Fool, The Star, and The World. Interpret these cards in the context of career transition.",
    agent=sophia,
    expected_output="A mystical and insightful 3-card tarot reading with practical guidance."
)

# Create simple crew
crew = Crew(
    agents=[sophia],
    tasks=[task],
    process=Process.sequential,
    verbose=True,
    memory=False
)

print("🚀 Executing simple tarot reading test...")

try:
    result = crew.kickoff()
    print("\n🔮 SOPHIA'S READING:")
    print("=" * 50)
    print(result)
    print("\n✅ Test completed successfully!")
    
except Exception as e:
    print(f"❌ Test failed: {str(e)}")