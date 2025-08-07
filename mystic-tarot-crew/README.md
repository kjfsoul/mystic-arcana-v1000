# Mystic Arcana CrewAI Framework

A production-ready CrewAI implementation featuring 12 specialized AI agents for the Mystic Arcana tarot and astrology platform.

## 🧙‍♀️ Agent Roster

### Core Virtual Readers (Production)

- **Sophia** - Mystic Oracle & Primary Tarot Interpreter
- **Orion** - Cosmic Strategist & Astrological Life Coach
- **Luna** - Emotional Healer & Relationship Guide
- **Sol** - Shadow Integration Specialist & Transformational Guide

### Technical Development Agents

- **AstroCalculus** - Astronomical Calculation Engine
- **CardWeaver** - Adaptive Tarot Logic Engine
- **PersonaLearner** - User Personalization Specialist
- **DataOracle** - Spiritual Data Architecture Specialist
- **ContentAlchemist** - Automated Content Creator
- **CommunityShaman** - Social Integration Manager
- **UIEnchanter** - Mystical Interface Designer
- **QualityGuardian** - QA & Spiritual Ethics Guardian

## 🚀 Quick Start

### 1. Environment Setup

```bash
# Create environment file
cp .env.example .env

# Add your API keys
PERPLEXITY_API_KEY=your_key_here
RUN_DEMONSTRATION=false
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Test Setup

```bash
python test_setup.py
```

### 4. Initialize Crew

```bash
python main.py
```

### 5. Run Demonstration (Optional)

```bash
# Set in .env file
RUN_DEMONSTRATION=true
python main.py
```

## 🔧 Key Features

### Perplexity API Integration

- **@tool** decorated function for CrewAI compatibility
- Comprehensive error handling and timeouts
- Configurable model selection
- Citation and source tracking

### Agentic Memory Logging

- All actions logged to `../mystic-arcana-v1000/A-mem/`
- `@log_invocation` decorator on key functions
- Development process tracking
- Agent action history

### Production-Ready Architecture

- Environment validation
- Custom exception handling
- Comprehensive logging
- Type hints and documentation
- Modular agent creation

### Demonstration Tasks

The framework includes sample tasks showcasing each agent's capabilities:

- Sophia: 3-card tarot reading for career transition
- Orion: Astrological timing guidance
- Luna: Emotional healing and relationship patterns
- Sol: Shadow work and authentic power

## 📁 Project Structure

```
mystic-tarot-crew/
├── main.py              # Core CrewAI framework
├── requirements.txt     # Python dependencies
├── test_setup.py       # Setup validation
├── README.md           # This file
├── .env               # Environment variables
└── crew_operations.log # Runtime logs
```

## 🛠️ Development Usage

### Creating Custom Tasks

```python
from main import create_base_task, create_mystic_arcana_agents

agents = create_mystic_arcana_agents()

custom_task = create_base_task(
    description="Your task description",
    agent=agents['sophia'],  # or any other agent
    expected_output="Expected output description"
)
```

### Agent Specializations

- **Virtual Readers**: Focus on user-facing spiritual guidance
- **Technical Agents**: Handle backend calculations and data
- **Development Agents**: Support platform development and QA

### Error Handling

All functions include comprehensive error handling:

- API timeout protection
- Environment validation
- Graceful degradation
- Detailed logging

## 🔮 Integration with Mystic Arcana

This CrewAI framework integrates with the main Mystic Arcana platform:

- Shares agentic memory system
- Uses same environment configuration
- Supports platform's 78-card tarot system
- Connects to astronomical calculation services

## 📊 Monitoring & Logging

### Agentic Memory

- Development actions logged to `A-mem` store
- Agent creation and execution tracking
- Memory events per agent action

### Application Logs

- Runtime logs in `crew_operations.log`
- Console output for development
- Error tracking and debugging

## 🧪 Testing

Run the test suite to verify setup:

```bash
python test_setup.py
```

Tests include:

- Import validation
- Environment variable checks
- Agentic memory integration
- Agent creation verification

## 🚀 Production Deployment

For production use:

1. Set appropriate environment variables
2. Configure logging levels
3. Set up monitoring for agent performance
4. Implement proper error alerting
5. Scale agent execution based on demand

## 📝 Development Notes

- All shell commands should use `memlog-ma` prefix for memory logging
- Python functions should use `@log_invocation` decorator
- Environment variables are validated on startup
- Agent creation is logged and tracked
- Demonstration mode can be enabled for testing

---

**Ready to activate the mystical AI collective!** 🔮✨
