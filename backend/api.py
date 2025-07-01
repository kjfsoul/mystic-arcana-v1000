# api.py

"""FastAPI application for the modular agentic framework."""

import yaml
import importlib
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any

from framework.orchestrator import Orchestrator, LLM, MemoryDB, AuditLogger
from framework.registry import AgentRegistry
from framework.tools import ToolManager

# Initialize FastAPI app
app = FastAPI(title="Agentic Framework API", version="1.1.0-config-driven")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Request Model
class RequestModel(BaseModel):
    user_id: str
    task_type: str
    spread_type: str = None
    query: str = None
    birth_data: Dict[str, Any] = None
    data: Any = None

# Global orchestrator instance
orchestrator = None

def initialize_framework():
    """Initialize the framework components and register agents from config.yaml."""
    global orchestrator
    
    print("Initializing framework components...")

    # Initialize core components
    llm_instance = LLM()
    tool_manager_instance = ToolManager()
    agent_registry = AgentRegistry()
    memory_db = MemoryDB()
    audit_logger = AuditLogger()
    orchestrator = Orchestrator(agent_registry, memory_db, audit_logger)

    # --- Configuration-Driven Agent Registration ---
    print("Registering agents from config.yaml...")
    
    # Correctly locate config.yaml relative to this file
    config_path = Path(__file__).parent / "config.yaml"
    
    with open(config_path, 'r') as f:
        config = yaml.safe_load(f)

    for agent_config in config.get('agents_to_register', []):
        try:
            agent_id = agent_config['id']
            module_path = agent_config['module']
            class_name = agent_config['class']
            agent_specific_config = agent_config.get('config', {})

            module = importlib.import_module(module_path)
            agent_class = getattr(module, class_name)
            
            # Note: The agent_id from the config is passed to the agent instance
            agent_instance = agent_class(agent_id, llm_instance, tool_manager_instance)
            agent_registry.register_agent(agent_id, agent_instance, agent_specific_config)
        except (ImportError, AttributeError, KeyError) as e:
            print(f"Error registering agent from config {agent_config.get('id', 'N/A')}: {e}")

    print("Framework initialization complete.")

@app.on_event("startup")
async def startup_event():
    initialize_framework()

@app.post("/v1/request")
async def process_request(request: RequestModel):
    if not orchestrator:
        raise HTTPException(status_code=503, detail="Framework not initialized")
    try:
        request_dict = request.dict(exclude_unset=True)
        response = orchestrator.process_request(request_dict)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing request: {str(e)}")

@app.get("/")
async def root():
    return {"message": "Mystic Arcana Agentic Framework is running. See /docs for API documentation."}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Agentic Framework API is running"}
