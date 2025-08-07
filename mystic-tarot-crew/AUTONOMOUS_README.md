# 🔮 Mystic Arcana Autonomous Crew System

## Overview

The Mystic Arcana Autonomous Crew is a self-operating AI system that continuously generates spiritual content, astrological insights, and mystical guidance using 12 specialized AI agents powered by CrewAI and Anthropic Claude.

## 🤖 Autonomous Features

### **Continuous Operation**

- **24/7 autonomous execution** with scheduled task generation
- **Health monitoring** every 5 minutes with automated recovery
- **Content generation** based on astrological timing
- **Intelligent task scheduling** using real-time context

### **Scheduled Content Generation**

- **Daily Content** (6 AM onwards): Astrological overview, zodiac guidance, manifestation focus
- **Weekly Wisdom** (Sundays): Deep spiritual insights for the upcoming week
- **Timing Analysis** (Mon/Wed/Fri): Strategic astrological guidance for decision-making
- **Healing Focus** (Fridays): Emotional processing and self-care content

### **Intelligent Agents**

#### **Core Spiritual Agents**

- **Sophia** - Mystic Oracle & Primary Tarot Interpreter
- **Orion** - Cosmic Strategist & Astrological Life Coach
- **Luna** - Emotional Healer & Relationship Guide
- **Sol** - Shadow Integration Specialist

#### **Technical Agents**

- **ContentAlchemist** - Automated content generation specialist
- **AstroCalculus** - Astronomical calculations and ephemeris data
- **CardWeaver** - Adaptive tarot logic engine
- **PersonaLearner** - User personalization and learning

#### **Development Agents**

- **DataOracle** - Spiritual data architecture
- **CommunityShaman** - Social integration manager
- **UIEnchanter** - Mystical interface designer
- **QualityGuardian** - Ethics and testing specialist

## 🚀 Quick Start

### **Prerequisites**

```bash
# Required API Keys
export ANTHROPIC_API_KEY="your-anthropic-api-key"
export PERPLEXITY_API_KEY="your-perplexity-api-key"  # Optional but recommended
```

### **Autonomous Mode (Recommended)**

```bash
# Start continuous autonomous operation
./start_autonomous.sh

# Or manually:
export AUTONOMOUS_MODE=true
python main.py
```

### **Demonstration Mode**

```bash
# Run demonstration tasks
./start_demo.sh

# Or manually:
export RUN_DEMONSTRATION=true
python main.py
```

### **Manual Mode**

```bash
# Initialize crew without running tasks
python main.py
```

## 📁 Output Structure

```
mystic-tarot-crew/
├── crew_memory_logs/          # Autonomous execution logs
├── output/                    # Generated content files
│   ├── daily_content_YYYYMMDD.json
│   ├── weekly_wisdom_YYYY_WXX.json
│   ├── timing_analysis_YYYYMMDD.json
│   └── healing_focus_YYYYMMDD.json
├── crew_operations.log        # System operations log
└── main.py                    # Main autonomous system
```

## ⚙️ Configuration

### **Environment Variables**

| Variable             | Required | Default | Description                            |
| -------------------- | -------- | ------- | -------------------------------------- |
| `AUTONOMOUS_MODE`    | No       | `false` | Enable continuous autonomous operation |
| `RUN_DEMONSTRATION`  | No       | `false` | Run demonstration tasks                |
| `ANTHROPIC_API_KEY`  | Yes      | -       | Anthropic Claude API key for agents    |
| `PERPLEXITY_API_KEY` | No       | -       | Perplexity API key for research tasks  |

### **Scheduling Configuration**

The autonomous system uses intelligent scheduling based on:

- **Time of day** (morning content generation)
- **Day of week** (weekly wisdom on Sundays)
- **Astrological timing** (content aligned with cosmic events)
- **System health** (automatic recovery and monitoring)

## 🔍 Monitoring & Health Checks

### **Automatic Health Monitoring**

- **Health checks** every 5 minutes
- **Execution monitoring** with success/failure tracking
- **Memory logging** of all autonomous activities
- **Error recovery** with automatic retry mechanisms

### **Health Check Data**

```json
{
  "timestamp": "2025-01-31T12:00:00",
  "agents_available": 12,
  "crew_initialized": true,
  "environment_valid": true,
  "recent_executions": 8
}
```

### **Viewing Logs**

```bash
# Real-time autonomous operation logs
tail -f crew_operations.log

# Memory logs (JSON format)
ls crew_memory_logs/

# Generated content
ls output/
```

## 🛠️ Troubleshooting

### **Common Issues**

1. **API Key Errors**

   ```bash
   # Verify API keys are set
   echo $ANTHROPIC_API_KEY
   echo $PERPLEXITY_API_KEY
   ```

2. **Permission Errors**

   ```bash
   # Make scripts executable
   chmod +x start_autonomous.sh
   chmod +x start_demo.sh
   ```

3. **Dependency Issues**

   ```bash
   # Reinstall dependencies
   pip install -r requirements.txt --upgrade
   ```

4. **Memory/Performance Issues**

   ```bash
   # Check memory usage
   ps aux | grep python

   # Restart autonomous mode
   pkill -f "python main.py"
   ./start_autonomous.sh
   ```

### **Manual Intervention**

If autonomous mode encounters issues:

1. **Stop gracefully**: `Ctrl+C` in the terminal
2. **Check logs**: Review `crew_operations.log` for errors
3. **Verify environment**: Ensure API keys are valid
4. **Restart**: Use `./start_autonomous.sh` to resume

## 📊 Performance Metrics

### **Execution Tracking**

- **Task completion rate**: Tracked in execution history
- **Execution time**: Monitored for performance optimization
- **Success/failure ratio**: Health monitoring with alerts
- **Content generation volume**: Daily/weekly output tracking

### **Memory Management**

- **Execution history**: Last 100 operations stored
- **Log rotation**: Automatic cleanup of old logs
- **Memory efficiency**: Optimized for long-running operation

## 🔮 Spiritual AI Integration

### **Astrological Timing**

- Content generation aligned with **lunar phases**
- **Planetary transit** awareness for timing recommendations
- **Seasonal themes** incorporated into spiritual guidance
- **Cosmic event** integration for special content

### **Personalization Engine**

- **User behavior analysis** for content adaptation
- **Spiritual development tracking** over time
- **Preference learning** for reading styles
- **Synchronicity pattern** recognition

### **Ethical Guidelines**

- **Trauma-informed** approach to emotional content
- **Cultural sensitivity** in spiritual practices
- **Boundary respect** in personal guidance
- **Privacy protection** for user data

## 🚀 Advanced Usage

### **Custom Task Injection**

```python
# Add custom tasks to autonomous cycle
crew_manager.crew.tasks.append(custom_task)
```

### **Agent Customization**

```python
# Access specific agents
sophia = crew_manager.agents['sophia']
orion = crew_manager.agents['orion']
```

### **Content Pipeline Integration**

```python
# Hook into content generation
def custom_content_processor(content):
    # Process generated content
    return enhanced_content
```

## 📝 Development Notes

- **CrewAI Framework**: Version 0.28.0+ required
- **Anthropic Claude**: Haiku model for cost efficiency
- **Memory System**: Local JSON-based logging
- **Async Operations**: Future enhancement planned
- **Scaling**: Designed for single-instance operation

## 🔒 Security Considerations

- **API Key Management**: Use environment variables only
- **Log Sanitization**: No sensitive data in logs
- **Rate Limiting**: Configured for API compliance
- **Error Handling**: Graceful degradation on failures

---

_This autonomous system represents the convergence of artificial intelligence and spiritual wisdom, creating a continuously evolving oracle for the digital age._ ✨🔮
