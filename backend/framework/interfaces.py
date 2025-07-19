
"""Module for core agent interfaces and exceptions."""

from abc import ABC, abstractmethod

class AgentNotFound(Exception):
    """Custom exception raised when an agent is not found in the registry."""
    pass

class Agent(ABC):
    """Abstract base class for all agents in the framework."""

    def __init__(self, agent_id: str, llm_model: 'LLM', tools: 'ToolManager'):
        """Initializes an Agent instance.

        Args:
            agent_id (str): A unique identifier for the agent.
            llm_model (LLM): An instance of the LLM (Large Language Model) to be used by the agent.
            tools (ToolManager): An instance of the ToolManager for accessing various tools.
        """
        self.agent_id = agent_id
        self.llm_model = llm_model
        self.tools = tools

    @abstractmethod
    def get_capabilities(self) -> list[str]:
        """Abstract method to define the capabilities of the agent.

        Returns:
            list[str]: A list of strings, each representing a capability (e.g., "tarot_interpretation").
        """
        raise NotImplementedError

    @abstractmethod
    def execute(self, task: dict, context: dict) -> dict:
        """Abstract method for the main execution logic of the agent.

        Args:
            task (dict): A dictionary containing the task details for the agent to perform.
            context (dict): A dictionary containing contextual information for the task.

        Returns:
            dict: A dictionary containing the result of the agent's execution.
        """
        raise NotImplementedError
