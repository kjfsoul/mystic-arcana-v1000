from interfaces import Agent
from typing import Dict

class NovaReaderAgent(Agent):
    def __init__(self):
        self.persona = "Nova — The Cosmic Futurist"
        self.style = "Ethereal and visionary"
        self.memory = {}

    def run(self, input_data: Dict) -> Dict:
        user_id = input_data.get("user_id")
        reading_context = input_data.get("context")
        self.update_profile(user_id, reading_context)

        return {
            "persona": self.persona,
            "style": self.style,
            "message": f"Greetings, starlit one. Your spread reveals a cosmic ripple through {reading_context}. Be bold in vision, soft in trust."
        }

    def update_profile(self, user_id, context):
        if user_id not in self.memory:
            self.memory[user_id] = []
        self.memory[user_id].append(context)


class LunaReaderAgent(Agent):
    def __init__(self):
        self.persona = "Luna — The Empathic Oracle"
        self.style = "Soft and flowing"
        self.memory = {}

    def run(self, input_data: Dict) -> Dict:
        user_id = input_data.get("user_id")
        reading_context = input_data.get("context")
        self.update_profile(user_id, reading_context)

        return {
            "persona": self.persona,
            "style": self.style,
            "message": f"Beloved, I feel the tides within you. This {reading_context} whispers of intuition and dreams untended. Be gentle as you explore."
        }

    def update_profile(self, user_id, context):
        if user_id not in self.memory:
            self.memory[user_id] = []
        self.memory[user_id].append(context)


class SageReaderAgent(Agent):
    def __init__(self):
        self.persona = "Sage — The Elder Mystic"
        self.style = "Gravelly and wise"
        self.memory = {}

    def run(self, input_data: Dict) -> Dict:
        user_id = input_data.get("user_id")
        reading_context = input_data.get("context")
        self.update_profile(user_id, reading_context)

        return {
            "persona": self.persona,
            "style": self.style,
            "message": f"Ah… the currents shift. This {reading_context} demands contemplation. Pause. Reflect. The lesson is rooted deep in time."
        }

    def update_profile(self, user_id, context):
        if user_id not in self.memory:
            self.memory[user_id] = []
        self.memory[user_id].append(context)


class SolReaderAgent(Agent):
    def __init__(self):
        self.persona = "Sol — The Bold Prophet"
        self.style = "Direct and motivational"
        self.memory = {}

    def run(self, input_data: Dict) -> Dict:
        user_id = input_data.get("user_id")
        reading_context = input_data.get("context")
        self.update_profile(user_id, reading_context)

        return {
            "persona": self.persona,
            "style": self.style,
            "message": f"Let’s go! The {reading_context} is your launchpad. Rise, act, and claim your path. The stars await your move."
        }

    def update_profile(self, user_id, context):
        if user_id not in self.memory:
            self.memory[user_id] = []
        self.memory[user_id].append(context)
