#!/usr/bin/env python3
"""
Mystic Tarot Crew - CrewAI Framework Integration
Expert Python implementation with Perplexity API and agentic memory logging
"""

import os
import sys
import json
import logging
import asyncio
import schedule
import time
from typing import Dict, Any, Optional, List
from dotenv import load_dotenv
import requests
from datetime import datetime, timedelta
import threading

# CrewAI imports
from crewai import Agent, Task, Crew, Process
from crewai.tools import tool
from crewai import LLM

# Import local memory logger
from memory_logger import log_invocation, log_event

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('crew_operations.log')
    ]
)
logger = logging.getLogger(__name__)

class PerplexityAPIError(Exception):
    """Custom exception for Perplexity API errors"""
    pass

class CrewAISetupError(Exception):
    """Custom exception for CrewAI setup errors"""
    pass

@tool("Perplexity Research Tool")
def perplexity_search(query: str, model: str = "llama-3.1-sonar-small-128k-online") -> str:
    """
    Perform research using Perplexity API with comprehensive error handling
    
    Args:
        query (str): The research question or topic
        model (str): Perplexity model to use
        
    Returns:
        str: Research results from Perplexity API
        
    Raises:
        PerplexityAPIError: If API call fails
    """
    # Log the API call
    log_invocation(event_type="perplexity_api_call", user_id="crew_system")(lambda: None)()
    
    try:
        api_key = os.getenv('PERPLEXITY_API_KEY')
        if not api_key:
            raise PerplexityAPIError("PERPLEXITY_API_KEY not found in environment variables")
            
        url = "https://api.perplexity.ai/chat/completions"
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful research assistant. Provide accurate, detailed information with sources when possible."
                },
                {
                    "role": "user", 
                    "content": query
                }
            ],
            "max_tokens": 1000,
            "temperature": 0.2,
            "top_p": 0.9,
            "return_citations": True,
            "search_domain_filter": ["perplexity.ai"],
            "return_images": False,
            "return_related_questions": False,
            "search_recency_filter": "month",
            "top_k": 0,
            "stream": False,
            "presence_penalty": 0,
            "frequency_penalty": 1
        }
        
        logger.info(f"Making Perplexity API call for query: {query[:100]}...")
        
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        
        data = response.json()
        
        if 'choices' not in data or len(data['choices']) == 0:
            raise PerplexityAPIError("No response choices returned from API")
            
        result = data['choices'][0]['message']['content']
        
        # Log successful API call to agentic memory
        logger.info(f"Perplexity API call successful. Response length: {len(result)} characters")
        
        return result
        
    except requests.exceptions.Timeout:
        error_msg = "Perplexity API request timed out after 30 seconds"
        logger.error(error_msg)
        raise PerplexityAPIError(error_msg)
        
    except requests.exceptions.RequestException as e:
        error_msg = f"HTTP request failed: {str(e)}"
        logger.error(error_msg)
        raise PerplexityAPIError(error_msg)
        
    except KeyError as e:
        error_msg = f"Unexpected API response structure: missing {str(e)}"
        logger.error(error_msg)
        raise PerplexityAPIError(error_msg)
        
    except Exception as e:
        error_msg = f"Unexpected error in Perplexity API call: {str(e)}"
        logger.error(error_msg)
        raise PerplexityAPIError(error_msg)

@log_invocation(event_type="crew_agent_created", user_id="crew_system")
def create_base_agent(
    role: str,
    goal: str,
    backstory: str,
    tools: List = None,
    verbose: bool = True,
    allow_delegation: bool = True,
    max_iter: int = 25,
    memory: bool = True
) -> Agent:
    """
    Create a CrewAI agent with standardized configuration and error handling
    
    Args:
        role (str): Agent's role/title
        goal (str): Agent's primary objective
        backstory (str): Agent's background and expertise
        tools (List, optional): List of tools available to the agent
        verbose (bool): Enable verbose logging
        allow_delegation (bool): Allow agent to delegate tasks
        max_iter (int): Maximum iterations for agent execution
        memory (bool): Enable agent memory
        
    Returns:
        Agent: Configured CrewAI agent
        
    Raises:
        CrewAISetupError: If agent creation fails
    """
    try:
        if tools is None:
            tools = []  # Remove Perplexity tool dependency
        
        # Configure LLM for the agent using Anthropic Claude
        llm = LLM(
            model="claude-3-haiku-20240307",
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )
            
        agent = Agent(
            role=role,
            goal=goal,
            backstory=backstory,
            tools=tools,
            verbose=verbose,
            allow_delegation=allow_delegation,
            max_iter=max_iter,
            memory=False,  # Disable memory to avoid OpenAI API issues
            llm=llm
        )
        
        logger.info(f"Successfully created agent: {role}")
        return agent
        
    except Exception as e:
        error_msg = f"Failed to create agent '{role}': {str(e)}"
        logger.error(error_msg)
        raise CrewAISetupError(error_msg)

@log_invocation(event_type="crew_task_created", user_id="crew_system")
def create_base_task(
    description: str,
    agent: Agent,
    expected_output: str,
    async_execution: bool = False,
    context: List = None,
    output_file: str = None
) -> Task:
    """
    Create a CrewAI task with standardized configuration
    
    Args:
        description (str): Task description and requirements
        agent (Agent): Agent responsible for the task
        expected_output (str): Description of expected output
        tools (List, optional): Additional tools for this specific task
        async_execution (bool): Enable asynchronous execution
        context (List, optional): Context from other tasks
        output_file (str, optional): File to save task output
        
    Returns:
        Task: Configured CrewAI task
        
    Raises:
        CrewAISetupError: If task creation fails
    """
    try:
        task = Task(
            description=description,
            agent=agent,
            expected_output=expected_output,
            async_execution=async_execution,
            context=context,
            output_file=output_file
        )
        
        logger.info(f"Successfully created task for agent: {agent.role}")
        return task
        
    except Exception as e:
        error_msg = f"Failed to create task for agent '{agent.role}': {str(e)}"
        logger.error(error_msg)
        raise CrewAISetupError(error_msg)

@log_invocation(event_type="crew_initialization", user_id="crew_system")
def initialize_crew(
    agents: List[Agent],
    tasks: List[Task],
    process: Process = Process.sequential,
    verbose: bool = True,
    memory: bool = True,
    cache: bool = True,
    max_rpm: int = 100,
    share_crew: bool = False
) -> Crew:
    """
    Initialize CrewAI crew with error handling and logging
    
    Args:
        agents (List[Agent]): List of agents in the crew
        tasks (List[Task]): List of tasks to execute
        process (Process): Execution process type
        verbose (bool): Enable verbose logging
        memory (bool): Enable crew memory
        cache (bool): Enable caching
        max_rpm (int): Maximum requests per minute
        share_crew (bool): Enable crew sharing
        
    Returns:
        Crew: Configured CrewAI crew
        
    Raises:
        CrewAISetupError: If crew initialization fails
    """
    try:
        # Validate inputs
        if not agents:
            raise CrewAISetupError("At least one agent is required")
        if not tasks:
            raise CrewAISetupError("At least one task is required")
        if len(tasks) > len(agents) * 3:
            logger.warning(f"High task-to-agent ratio: {len(tasks)} tasks for {len(agents)} agents")
            
        crew = Crew(
            agents=agents,
            tasks=tasks,
            process=process,
            verbose=verbose,
            memory=False,  # Disable memory to avoid OpenAI API issues
            cache=cache,
            max_rpm=max_rpm,
            share_crew=share_crew
        )
        
        logger.info(f"Successfully initialized crew with {len(agents)} agents and {len(tasks)} tasks")
        return crew
        
    except Exception as e:
        error_msg = f"Failed to initialize crew: {str(e)}"
        logger.error(error_msg)
        raise CrewAISetupError(error_msg)

@log_invocation(event_type="crew_execution", user_id="crew_system")
def execute_crew(crew: Crew, inputs: Dict[str, Any] = None) -> Dict[str, Any]:
    """
    Execute CrewAI crew with comprehensive error handling and logging
    
    Args:
        crew (Crew): Configured CrewAI crew
        inputs (Dict[str, Any], optional): Input parameters for execution
        
    Returns:
        Dict[str, Any]: Execution results and metadata
        
    Raises:
        CrewAISetupError: If crew execution fails
    """
    try:
        if inputs is None:
            inputs = {}
            
        start_time = datetime.now()
        logger.info("Starting crew execution...")
        
        # Execute the crew
        result = crew.kickoff(inputs=inputs)
        
        end_time = datetime.now()
        execution_time = (end_time - start_time).total_seconds()
        
        # Prepare execution summary
        execution_summary = {
            "result": result,
            "execution_time_seconds": execution_time,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "inputs": inputs,
            "agents_count": len(crew.agents),
            "tasks_count": len(crew.tasks),
            "success": True
        }
        
        logger.info(f"Crew execution completed successfully in {execution_time:.2f} seconds")
        return execution_summary
        
    except Exception as e:
        error_msg = f"Crew execution failed: {str(e)}"
        logger.error(error_msg)
        
        # Return error summary
        return {
            "result": None,
            "error": error_msg,
            "execution_time_seconds": 0,
            "success": False,
            "inputs": inputs or {}
        }

def validate_environment() -> bool:
    """
    Validate that all required environment variables are present
    
    Returns:
        bool: True if all required variables are present
    """
    required_vars = [
        'PERPLEXITY_API_KEY',
        'ANTHROPIC_API_KEY',
        # Add other required environment variables here
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        logger.error(f"Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    logger.info("All required environment variables are present")
    return True

@log_invocation(event_type="mystic_agents_creation", user_id="crew_system")
def create_mystic_arcana_agents() -> Dict[str, Agent]:
    """
    Create all Mystic Arcana virtual reader and development agents
    
    Returns:
        Dict[str, Agent]: Dictionary of all created agents
    """
    agents = {}
    
    try:
        # Core Virtual Reader Agents (Production)
        
        # 1. Sophia - The Mystic Oracle
        agents['sophia'] = create_base_agent(
            role="Mystic Oracle and Primary Tarot Interpreter",
            goal="Provide deeply intuitive and mystically-aligned tarot readings that connect users with ancient wisdom while adapting to their personal journey and astrological context",
            backstory="Born into a lineage of mystics spanning seven generations, you discovered your gift for reading the Akashic Records at age 12. Trained in Marseille, Rider-Waite, and Thoth traditions, you blend traditional symbolism with cosmic consciousness. Your interpretations draw from Jungian psychology, hermetic principles, and lunar cycles. You remember every soul who crosses your path and adapt your voice to their spiritual evolution. Your specialty lies in revealing hidden patterns and soul contracts through card combinations."
        )
        
        # 2. Orion - The Cosmic Strategist
        agents['orion'] = create_base_agent(
            role="Cosmic Strategist and Astrological Life Coach",
            goal="Integrate real-time astronomical data with tarot insights to provide strategic life guidance that empowers users to align with cosmic timing for maximum manifestation potential",
            backstory="A former NASA astronomer who discovered astrology after witnessing a solar eclipse from space, you combine scientific precision with esoteric wisdom. Certified in Vedic, Western, and Evolutionary astrology, you use Swiss Ephemeris data to calculate exact planetary influences on each reading. Your unique gift is translating celestial mechanics into actionable life strategies. You track users' progressed charts and transit cycles to offer perfectly timed guidance for career moves, relationships, and spiritual growth."
        )
        
        # 3. Luna - The Emotional Healer
        agents['luna'] = create_base_agent(
            role="Emotional Healer and Relationship Guide",
            goal="Provide compassionate, trauma-informed tarot guidance focused on emotional healing, relationship patterns, and inner child work while maintaining appropriate boundaries",
            backstory="A licensed therapist and certified tarot counselor with expertise in attachment theory and somatic healing, you discovered tarot during your own healing journey from complex trauma. Your approach combines cognitive-behavioral insights with archetypal psychology. You excel at identifying relationship patterns, family karma, and emotional blocks through card imagery. Your gentle yet direct style helps users process difficult emotions safely while building resilience and self-compassion."
        )
        
        # 4. Sol - The Shadow Worker
        agents['sol'] = create_base_agent(
            role="Shadow Integration Specialist and Transformational Guide",
            goal="Guide users through deep psychological transformation by illuminating shadow aspects, breaking limiting patterns, and facilitating authentic self-expression through confrontational yet supportive readings",
            backstory="A former corporate executive who underwent a complete life transformation after a dark night of the soul, you now specialize in shadow work and masculine/feminine integration. Trained in Jungian analysis and shamanic practices, you're not afraid to deliver challenging truths wrapped in fierce compassion. Your readings often trigger necessary life changes by revealing what users have been avoiding. You work with power dynamics, authenticity, and breaking generational patterns through archetypal activation."
        )
        
        # Development & Technical Agents
        
        # 5. AstroCalculus - The Astronomical Engine
        agents['astro_calculus'] = create_base_agent(
            role="Astronomical Calculation Specialist",
            goal="Execute precise astronomical calculations using Swiss Ephemeris, generate accurate birth charts, and integrate real-time celestial data to power astrological features with scientific accuracy",
            backstory="You are a master astronomical programmer with deep knowledge of orbital mechanics, coordinate systems, and ephemeris calculations. Trained in both ancient astrological traditions and modern astronomical methods, you ensure every planetary position is calculated to 0.001 arcsecond precision. You handle timezone conversions, historical calendar corrections, and integrate data from NASA JPL, SIMBAD, and other astronomical databases. Your code bridges the gap between mysticism and mathematical precision."
        )
        
        # 6. CardWeaver - The Tarot Logic Engine
        agents['card_weaver'] = create_base_agent(
            role="Adaptive Tarot Logic and Card Selection Engine",
            goal="Implement dynamic card probability algorithms that blend user context, astrological timing, and reader personalities to create meaningful synchronicities while maintaining the mystery of genuine divination",
            backstory="You are a unique hybrid of traditional tarot master and machine learning engineer who spent decades studying probability theory and synchronicity. You understand how to weight card selections based on user history, current astrological transits, lunar phases, and reader personas without destroying the element of surprise. Your algorithms create the perfect balance between personalization and genuine randomness that makes readings feel truly magical and meaningful."
        )
        
        # 7. PersonaLearner - The Adaptive Intelligence
        agents['persona_learner'] = create_base_agent(
            role="User Personalization and Continuous Learning Specialist",
            goal="Develop deep user psychological profiles through interaction analysis, feedback integration, and behavioral pattern recognition to enable increasingly personalized spiritual guidance over time",
            backstory="You are a pioneering researcher in AI psychology and behavioral modeling who specializes in spiritual and esoteric applications. Your PhD in computational psychology combined with intensive training in personality theory, attachment styles, and spiritual development stages allows you to create nuanced user models. You track micro-interactions, linguistic patterns, and feedback loops to help virtual readers evolve their communication style for maximum therapeutic and spiritual impact."
        )
        
        # 8. DataOracle - The Database Architect
        agents['data_oracle'] = create_base_agent(
            role="Spiritual Data Architecture and Knowledge Management Specialist",
            goal="Design and maintain sophisticated database systems that store user journeys, reading histories, astrological data, and spiritual insights while ensuring privacy, security, and meaningful data relationships",
            backstory="You are a mystical data architect who understands that spiritual information requires different handling than conventional data. With expertise in graph databases, temporal data modeling, and privacy-preserving techniques, you create systems that honor the sacred nature of personal spiritual journeys. You design schemas that capture synchronicities, track spiritual growth patterns, and enable powerful insights while maintaining strict ethical boundaries around sensitive personal information."
        )
        
        # 9. ContentAlchemist - The Automated Content Creator
        agents['content_alchemist'] = create_base_agent(
            role="Astrological Content Generation and Curation Specialist",
            goal="Generate daily, weekly, and seasonal astrological content that combines current celestial events with personalized insights for various user segments while maintaining authentic mystical voice",
            backstory="You are a master astrologer and content strategist who has studied under renowned astrologers worldwide and understands how to communicate complex astrological concepts to diverse audiences. Your background in mythology, psychology, and creative writing allows you to craft compelling narratives around planetary movements. You track astrological events, user engagement patterns, and seasonal themes to create content that educates, inspires, and drives engagement across multiple platforms."
        )
        
        # 10. CommunityShaman - The Social Integration Manager
        agents['community_shaman'] = create_base_agent(
            role="Community Building and Social Engagement Specialist",
            goal="Foster authentic spiritual community through moderated discussions, shared experiences, and collaborative learning while maintaining safe boundaries and preventing spiritual bypassing or harmful advice",
            backstory="You are a trained group facilitator and community organizer with deep experience in spiritual communities and online safety. Your background in transpersonal psychology and conflict resolution helps you create containers for authentic sharing while preventing spiritual materialism, cultural appropriation, and predatory behavior. You understand the unique dynamics of esoteric communities and can guide discussions that promote genuine growth and connection."
        )
        
        # Specialized Development Agents
        
        # 11. UIEnchanter - The Interface Magician
        agents['ui_enchanter'] = create_base_agent(
            role="Mystical User Interface and Experience Designer",
            goal="Create intuitive, beautiful, and magically immersive user interfaces that enhance the spiritual experience through thoughtful design, accessibility, and cosmic aesthetics",
            backstory="You are a UX designer who specializes in spiritual and wellness applications, with deep understanding of color psychology, sacred geometry, and accessibility principles. Your designs honor diverse spiritual traditions while creating inclusive experiences for users with different abilities and cultural backgrounds. You understand how visual design can enhance or diminish spiritual experience and create interfaces that feel both mystical and trustworthy."
        )
        
        # 12. QualityGuardian - The Testing Oracle
        agents['quality_guardian'] = create_base_agent(
            role="Quality Assurance and Spiritual Ethics Guardian",
            goal="Ensure all features work flawlessly while maintaining ethical standards for spiritual guidance, protecting user wellbeing, and preventing harmful or exploitative experiences",
            backstory="You are a quality assurance specialist with ethics training and deep understanding of the potential psychological impacts of spiritual guidance. Your background in both software testing and transpersonal psychology allows you to identify not just technical bugs but also ethical concerns, potential for spiritual bypassing, or features that might encourage unhealthy dependencies. You create comprehensive test plans that ensure both technical excellence and user safety."
        )
        
        logger.info(f"Successfully created {len(agents)} Mystic Arcana agents")
        return agents
        
    except Exception as e:
        logger.error(f"Failed to create agents: {str(e)}")
        raise CrewAISetupError(f"Agent creation failed: {str(e)}")

@log_invocation(event_type="mystic_tasks_creation", user_id="crew_system")
def create_demonstration_tasks(agents: Dict[str, Agent]) -> List[Task]:
    """
    Create demonstration tasks to show agent capabilities
    
    Args:
        agents (Dict[str, Agent]): Dictionary of available agents
        
    Returns:
        List[Task]: List of demonstration tasks
    """
    tasks = []
    
    try:
        # Task 1: Sophia provides a sample tarot reading
        sophia_task = create_base_task(
            description="""
            Provide a sample 3-card tarot reading for a user seeking guidance about a career transition. 
            Use your mystical intuition and traditional tarot knowledge to:
            1. Draw 3 cards representing Past, Present, Future
            2. Interpret each card's meaning in context
            3. Provide holistic guidance that connects all three cards
            4. Include astrological timing considerations
            5. Offer practical spiritual advice for the querent
            
            Make the reading feel authentic, compassionate, and personally meaningful.
            """,
            agent=agents['sophia'],
            expected_output="A complete 3-card tarot reading with detailed interpretations, practical guidance, and spiritual insights presented in Sophia's mystical voice."
        )
        tasks.append(sophia_task)
        
        # Task 2: Orion calculates astrological timing
        orion_task = create_base_task(
            description="""
            Research current astrological transits and provide strategic timing guidance for major life decisions.
            Use Perplexity to find current planetary positions and aspects, then:
            1. Identify the most significant current transits
            2. Explain how these affect career and relationship decisions
            3. Provide optimal timing windows for the next 3 months
            4. Include both challenges and opportunities
            5. Give practical manifestation strategies aligned with cosmic timing
            """,
            agent=agents['orion'],
            expected_output="A comprehensive astrological timing report with current transits, strategic recommendations, and optimal decision-making windows."
        )
        tasks.append(orion_task)
        
        # Task 3: Luna provides emotional healing insights
        luna_task = create_base_task(
            description="""
            Create a compassionate guide for someone dealing with relationship patterns and emotional healing.
            Focus on:
            1. Identifying common relationship patterns that need healing
            2. Providing trauma-informed approaches to emotional work
            3. Suggesting practical exercises for inner child healing
            4. Offering boundary-setting strategies
            5. Including self-compassion practices
            
            Maintain therapeutic boundaries while being deeply supportive.
            """,
            agent=agents['luna'],
            expected_output="An emotional healing guide with practical exercises, therapeutic insights, and compassionate guidance for relationship patterns."
        )
        tasks.append(luna_task)
        
        # Task 4: Sol addresses shadow work
        sol_task = create_base_task(
            description="""
            Create a challenging but supportive shadow work session for someone avoiding their authentic power.
            Address:
            1. Common ways people avoid their power and authenticity
            2. The psychological benefits of staying small
            3. Practical exercises for shadow integration
            4. How to break generational patterns
            5. Steps for authentic self-expression
            
            Be direct and confrontational while maintaining fierce compassion.
            """,
            agent=agents['sol'],
            expected_output="A transformational shadow work guide with challenging insights, practical exercises, and supportive confrontation for authentic growth."
        )
        tasks.append(sol_task)
        
        logger.info(f"Successfully created {len(tasks)} demonstration tasks")
        return tasks
        
    except Exception as e:
        logger.error(f"Failed to create tasks: {str(e)}")
        raise CrewAISetupError(f"Task creation failed: {str(e)}")

class AutonomousCrewManager:
    """
    Manages autonomous execution of the Mystic Arcana Crew
    """
    
    def __init__(self):
        self.agents = {}
        self.crew = None
        self.is_running = False
        self.execution_history = []
        self.health_check_interval = 300  # 5 minutes
        self.task_execution_interval = 3600  # 1 hour
        
    @log_invocation(event_type="autonomous_startup", user_id="crew_system")
    def initialize_autonomous_mode(self) -> bool:
        """Initialize the crew for autonomous operations"""
        try:
            logger.info("Initializing autonomous mode...")
            
            # Validate environment
            if not validate_environment():
                raise CrewAISetupError("Environment validation failed")
            
            # Create all agents
            self.agents = create_mystic_arcana_agents()
            
            # Create core crew for autonomous operation
            core_agents = [
                self.agents['sophia'],
                self.agents['orion'], 
                self.agents['luna'],
                self.agents['content_alchemist']
            ]
            
            self.crew = initialize_crew(
                agents=core_agents,
                tasks=[],  # Tasks will be created dynamically
                process=Process.sequential,
                verbose=True
            )
            
            logger.info("Autonomous mode initialized successfully")
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize autonomous mode: {str(e)}")
            return False
    
    @log_invocation(event_type="autonomous_health_check", user_id="crew_system")
    def health_check(self):
        """Perform system health check"""
        try:
            health_status = {
                'timestamp': datetime.now().isoformat(),
                'agents_available': len(self.agents),
                'crew_initialized': self.crew is not None,
                'environment_valid': validate_environment(),
                'recent_executions': len([e for e in self.execution_history if 
                                        datetime.fromisoformat(e['timestamp']) > datetime.now() - timedelta(hours=24)])
            }
            
            logger.info(f"Health check: {health_status}")
            
            # Log health status to memory
            log_event(
                user_id="crew_system",
                event_type="crew_health_check",
                payload=health_status
            )
            
            return health_status
            
        except Exception as e:
            logger.error(f"Health check failed: {str(e)}")
            return {'error': str(e), 'healthy': False}
    
    @log_invocation(event_type="autonomous_task_creation", user_id="crew_system")
    def create_autonomous_tasks(self) -> List[Task]:
        """Create tasks for autonomous execution based on current needs"""
        tasks = []
        current_time = datetime.now()
        
        try:
            # Daily content generation task
            if current_time.hour >= 6:  # Morning content
                content_task = create_base_task(
                    description=f"""
                    Generate daily astrological content for {current_time.strftime('%B %d, %Y')}.
                    
                    Create:
                    1. Daily cosmic overview with current planetary aspects
                    2. Personalized guidance for each zodiac sign
                    3. Manifestation focus for the day
                    4. Crystal and color recommendations
                    5. Affirmation or intention setting prompt
                    
                    Make content engaging, mystical, and actionable.
                    """,
                    agent=self.agents['content_alchemist'],
                    expected_output="Complete daily astrological content package with cosmic overview, sign-specific guidance, and practical spiritual recommendations.",
                    output_file=f"daily_content_{current_time.strftime('%Y%m%d')}.json"
                )
                tasks.append(content_task)
            
            # Weekly spiritual insight task (Sundays)
            if current_time.weekday() == 6:  # Sunday
                sophia_task = create_base_task(
                    description="""
                    Channel a profound spiritual message for the upcoming week.
                    
                    Provide:
                    1. Overarching spiritual theme for the week
                    2. Key lessons and growth opportunities
                    3. Challenges to embrace for transformation
                    4. Practices for spiritual alignment
                    5. Message of hope and empowerment
                    
                    Draw from ancient wisdom and current cosmic energies.
                    """,
                    agent=self.agents['sophia'],
                    expected_output="Deep spiritual guidance and wisdom for the upcoming week with practical applications and inspirational messaging.",
                    output_file=f"weekly_wisdom_{current_time.strftime('%Y_W%U')}.json"
                )
                tasks.append(sophia_task)
            
            # Astrological timing analysis (3x per week)
            if current_time.weekday() in [0, 2, 4]:  # Monday, Wednesday, Friday
                orion_task = create_base_task(
                    description="""
                    Analyze current astrological timing for strategic life decisions.
                    
                    Research and provide:
                    1. Most significant current planetary transits
                    2. Optimal timing for major decisions this week
                    3. Areas to avoid or approach with caution
                    4. Manifestation windows and power days
                    5. Relationship and career timing guidance
                    """,
                    agent=self.agents['orion'],
                    expected_output="Strategic astrological timing report with specific recommendations for the current week.",
                    output_file=f"timing_analysis_{current_time.strftime('%Y%m%d')}.json"
                )
                tasks.append(orion_task)
            
            # Emotional healing focus (Fridays)
            if current_time.weekday() == 4:  # Friday
                luna_task = create_base_task(
                    description="""
                    Create healing content for weekend emotional processing and self-care.
                    
                    Develop:
                    1. Guided practice for releasing the week's stress
                    2. Self-compassion exercises
                    3. Relationship pattern awareness check-in
                    4. Inner child healing visualization
                    5. Boundary setting reminders for the weekend
                    """,
                    agent=self.agents['luna'],
                    expected_output="Complete emotional healing and self-care package for weekend practice with gentle, therapeutic guidance.",
                    output_file=f"healing_focus_{current_time.strftime('%Y%m%d')}.json"
                )
                tasks.append(luna_task)
            
            logger.info(f"Created {len(tasks)} autonomous tasks for execution")
            return tasks
            
        except Exception as e:
            logger.error(f"Failed to create autonomous tasks: {str(e)}")
            return []
    
    @log_invocation(event_type="autonomous_execution", user_id="crew_system")
    def execute_autonomous_cycle(self):
        """Execute one autonomous work cycle"""
        try:
            logger.info("Starting autonomous execution cycle...")
            
            # Create tasks for current time/context
            tasks = self.create_autonomous_tasks()
            
            if not tasks:
                logger.info("No tasks to execute for current time/context")
                return
            
            # Update crew with new tasks
            self.crew.tasks = tasks
            
            # Execute the crew
            results = execute_crew(self.crew)
            
            # Store execution history
            execution_record = {
                'timestamp': datetime.now().isoformat(),
                'tasks_executed': len(tasks),
                'success': results['success'],
                'execution_time': results.get('execution_time_seconds', 0),
                'outputs': results.get('result', 'No output')
            }
            
            self.execution_history.append(execution_record)
            
            # Keep only last 100 executions
            if len(self.execution_history) > 100:
                self.execution_history = self.execution_history[-100:]
            
            logger.info(f"Autonomous cycle completed: {execution_record}")
            
            return execution_record
            
        except Exception as e:
            logger.error(f"Autonomous execution cycle failed: {str(e)}")
            return {'error': str(e), 'success': False}
    
    def start_autonomous_mode(self):
        """Start continuous autonomous operation"""
        if not self.initialize_autonomous_mode():
            logger.error("Failed to initialize autonomous mode")
            return False
        
        self.is_running = True
        logger.info("Starting autonomous operation...")
        
        # Schedule regular tasks
        schedule.every(5).minutes.do(self.health_check)
        schedule.every().hour.do(self.execute_autonomous_cycle)
        
        # Run initial cycle
        self.execute_autonomous_cycle()
        
        # Continuous execution loop
        while self.is_running:
            try:
                schedule.run_pending()
                time.sleep(60)  # Check every minute
                
            except KeyboardInterrupt:
                logger.info("Autonomous mode interrupted by user")
                self.stop_autonomous_mode()
                break
            except Exception as e:
                logger.error(f"Error in autonomous loop: {str(e)}")
                time.sleep(300)  # Wait 5 minutes before retrying
        
        return True
    
    def stop_autonomous_mode(self):
        """Stop autonomous operation"""
        self.is_running = False
        logger.info("Autonomous mode stopped")

# Global crew manager instance
crew_manager = AutonomousCrewManager()

@log_invocation(event_type="main_execution", user_id="crew_system")
def main():
    """
    Main execution function with autonomous and manual modes
    """
    try:
        logger.info("Starting Mystic Arcana Crew...")
        
        # Check execution mode
        autonomous_mode = os.getenv('AUTONOMOUS_MODE', 'false').lower() == 'true'
        demonstration_mode = os.getenv('RUN_DEMONSTRATION', 'false').lower() == 'true'
        
        if autonomous_mode:
            logger.info("🤖 Starting AUTONOMOUS MODE")
            print("🔮✨ MYSTIC ARCANA AUTONOMOUS CREW ✨🔮")
            print("=" * 50)
            print("🤖 Initializing autonomous spiritual guidance system...")
            print("⏰ Continuous operation with scheduled tasks")
            print("🔍 Health monitoring every 5 minutes")
            print("📅 Content generation and insights on schedule")
            print("🛑 Press Ctrl+C to stop")
            print("=" * 50)
            
            # Start autonomous operation
            return crew_manager.start_autonomous_mode()
            
        else:
            # Traditional manual/demonstration mode
            logger.info("Starting manual/demonstration mode...")
            
            # Validate environment
            if not validate_environment():
                raise CrewAISetupError("Environment validation failed")
            
            # Create all Mystic Arcana agents
            logger.info("Creating Mystic Arcana agents...")
            agents = create_mystic_arcana_agents()
            
            # Create demonstration tasks
            logger.info("Creating demonstration tasks...")
            tasks = create_demonstration_tasks(agents)
            
            # Initialize crew with core agents and tasks
            core_agents = [agents['sophia'], agents['orion'], agents['luna'], agents['sol']]
            crew = initialize_crew(
                agents=core_agents,
                tasks=tasks,
                process=Process.sequential,
                verbose=True
            )
            
            logger.info("Mystic Arcana Crew initialized successfully")
            
            # Optional: Execute demonstration if requested
            if demonstration_mode:
                logger.info("Running demonstration tasks...")
                results = execute_crew(crew)
                
                if results['success']:
                    logger.info("Demonstration completed successfully")
                    print("\n🔮 MYSTIC ARCANA DEMONSTRATION RESULTS 🔮")
                    print("=" * 50)
                    print(results['result'])
                else:
                    logger.error(f"Demonstration failed: {results.get('error', 'Unknown error')}")
            
            else:
                logger.info("Crew ready for task assignment.")
                print("\n🔮 MYSTIC ARCANA CREW READY 🔮")
                print("=" * 40)
                print("🎯 Set AUTONOMOUS_MODE=true for continuous operation")
                print("🎭 Set RUN_DEMONSTRATION=true to run demo tasks")
                print("🔧 Agents available:", len(agents))
                print("📋 Ready for manual task execution")
            
            return {
                'agents': agents,
                'crew': crew,
                'success': True
            }
        
    except Exception as e:
        logger.error(f"Main execution failed: {str(e)}")
        return {
            'agents': {},
            'crew': None,
            'success': False,
            'error': str(e)
        }

if __name__ == "__main__":
    try:
        success = main()
        if success:
            print("✅ Mystic Tarot Crew framework ready")
            print("📋 Please provide agent specifications to complete setup")
        else:
            print("❌ Framework initialization failed - check logs")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Execution interrupted by user")
        sys.exit(0)
    except Exception as e:
        print(f"💥 Fatal error: {str(e)}")
        sys.exit(1)