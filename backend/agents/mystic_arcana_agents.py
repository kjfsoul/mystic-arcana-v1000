# agents/mystic_arcana_agents.py

from framework.interfaces import Agent

class MockCardSelectorAgent(Agent):
    """A mock agent for selecting cards."""
    def get_capabilities(self) -> list[str]:
        return ["card_selection"]

    def execute(self, task: dict, context: dict) -> dict:
        print(f"MockCardSelectorAgent: Executing task {task.get('action')}")
        spread_type = task.get("spread", "three_card")
        if spread_type == "three_card":
            return {"cards": ["The Fool", "The Magician", "The High Priestess"]}
        elif spread_type == "celtic_cross":
            return {"cards": [f"Card {i+1}" for i in range(10)]}
        return {"cards": ["Default Card 1", "Default Card 2"]}

class MockTarotReaderAgent(Agent):
    """A mock agent for interpreting tarot readings."""
    def get_capabilities(self) -> list[str]:
        return ["tarot_interpretation", "persona_based_response"]

    def execute(self, task: dict, context: dict) -> dict:
        print(f"MockTarotReaderAgent: Executing task {task.get('action')}")
        if task.get("action") == "interpret":
            cards = task.get("cards", [])
            user_query = task.get("user_query", "")
            astrology_proxy = self.tools.get_agent_proxy("astrology_data_agent")
            astrology_context = {}
            if astrology_proxy:
                astrology_context = astrology_proxy.get_astrological_context(
                    user_id=context.get("user_id", "mock_user"),
                    birth_data=context.get("birth_data", {})
                )
                context["astrology_data"] = astrology_context
            prompt = f"Interpret the following tarot cards: {', '.join(cards)}. User query: {user_query}. Astrological context: {astrology_context.get('astrology_context', 'None')}"
            llm_response = self.llm_model.generate(prompt, persona=self.agent_id)
            ambiguity_score = 0.0
            if "unclear" in llm_response.lower() or "ambiguous" in llm_response.lower():
                ambiguity_score = 0.8
            return {"interpretation": llm_response, "ambiguity_score": ambiguity_score}
        return {"error": "Unknown action"}

class MockAstrologyDataAgent(Agent):
    """A mock agent for providing astrological data."""
    def get_capabilities(self) -> list[str]:
        return ["astrology_charting", "data_retrieval"]

    def execute(self, task: dict, context: dict) -> dict:
        print(f"MockAstrologyDataAgent: Executing task {task.get('action')}")
        if task.get("action") == "generate_chart":
            birth_data = task.get("birth_data", {})
            swiss_ephemeris_api = self.tools.get_tool("swiss_ephemeris_api")
            chart_data = swiss_ephemeris_api.get_chart(birth_data)
            return {"chart": chart_data, "summary": "Basic astrological chart generated."}
        elif task.get("action") == "get_context":
            return self.get_astrological_context(task.get("user_id"), task.get("birth_data"))
        return {"error": "Unknown action"}

    def get_astrological_context(self, user_id: str, birth_data: dict) -> dict:
        print(f"MockAstrologyDataAgent: Getting astrological context for user {user_id}")
        swiss_ephemeris_api = self.tools.get_tool("swiss_ephemeris_api")
        chart_data = swiss_ephemeris_api.get_chart(birth_data)
        processed_context = {"astrology_context": f"Sun in {chart_data['planets']['sun']}, Moon in {chart_data['planets']['moon']}"}
        return processed_context
