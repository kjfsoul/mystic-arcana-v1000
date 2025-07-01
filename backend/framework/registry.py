
"""Module for managing agent registration and discovery."""

from typing import Dict, Any, List
from framework.interfaces import Agent, AgentNotFound

class AgentRegistry:
    """Manages the registration, retrieval, and discovery of agents."""

    def __init__(self):
        """Initializes the AgentRegistry with an empty dictionary for agents."""
        self.agents: Dict[str, Dict[str, Any]] = {}

    def register_agent(self, agent_id: str, agent_instance: Agent, config: Dict[str, Any]):
        """Registers an agent with its instance and configuration.

        Args:
            agent_id (str): A unique identifier for the agent.
            agent_instance (Agent): An instance of the Agent class.
            config (Dict[str, Any]): A dictionary containing the agent's configuration.
        """
        self.agents[agent_id] = {
            "instance": agent_instance,
            "config": config,
            "capabilities": agent_instance.get_capabilities()
        }
        print(f"Agent {agent_id} registered with capabilities: {self.agents[agent_id]['capabilities']}")

    def get_agent(self, agent_id: str) -> Agent:
        """Retrieves an agent instance by its ID.

        Args:
            agent_id (str): The unique identifier of the agent to retrieve.

        Returns:
            Agent: The Agent instance if found.

        Raises:
            AgentNotFound: If no agent with the given ID is found.
        """
        agent_data = self.agents.get(agent_id)
        if not agent_data:
            raise AgentNotFound(f"Agent with ID '{agent_id}' not found.")
        return agent_data["instance"]

    def find_agents_by_capability(self, capability: str) -> List[str]:
        """Finds agents that possess a specific capability.

        Args:
            capability (str): The capability to search for (e.g., "tarot_interpretation").

        Returns:
            List[str]: A list of agent IDs that have the specified capability.
        """
        return [aid for aid, data in self.agents.items() if capability in data["capabilities"]]


