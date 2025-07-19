# registry.py — FULL REWRITE for Mystic Arcana agent registration

from interfaces import Agent
from virtual_agent_readers import (
    NovaReaderAgent,
    LunaReaderAgent,
    SageReaderAgent,
    SolReaderAgent
)

agent_registry = {}

def register_virtual_reader_agents():
    agent_registry["virtual_reader_nova"] = NovaReaderAgent()
    agent_registry["virtual_reader_luna"] = LunaReaderAgent()
    agent_registry["virtual_reader_sage"] = SageReaderAgent()
    agent_registry["virtual_reader_sol"] = SolReaderAgent()

def get_agent(agent_id: str) -> Agent:
    if agent_id not in agent_registry:
        raise ValueError(f"Agent with ID '{agent_id}' not registered.")
    return agent_registry[agent_id]


def register_all_agents():
    register_virtual_reader_agents()
    # Add additional agent registration here (e.g., tarot, astrology)

# Ensure agents are registered when this module is loaded
register_all_agents()
