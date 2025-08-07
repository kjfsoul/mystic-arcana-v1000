# 🤖 Claude Session Management Commands

_Complete workflow for efficient Claude sessions with Mystic Arcana project_

## 🚀 **Session Startup Routine**

Copy and paste these commands at the start of each Claude session:

```bash
# 1. Initialize Project Context
/init

# 2. Read Current Memory State
mcp__memory__read_graph()

# 3. Check Agent Registry Status
cat /agents/registry.json

# 4. Review Recent Activity
cat logs/agent-activity/$(date +%Y-%m-%d).log

# 5. Check for Errors
cat logs/errors/latest.log

# 6. Search for Today's Work
mcp__memory__search_nodes("$(date +%Y-%m-%d)")
```

## 📖 **Reading Memory & Context Commands**

### **Project Memory Access**

```bash
# Quick project memory access
/memory                              # Access memory management
#                                   # Shortcut for memory operations

# Read entire knowledge graph
mcp__memory__read_graph()

# Search for specific topics
mcp__memory__search_nodes("mobile responsiveness")
mcp__memory__search_nodes("privacy policy")
mcp__memory__search_nodes("Augment Agent")
mcp__memory__search_nodes("layout issues")

# Open specific entities
mcp__memory__open_nodes(["Project Status", "Technical Achievements", "Outstanding Issues"])
```

### **Context & Logs Reading**

```bash
# Session logs
cat logs/agent-activity/$(date +%Y-%m-%d).log
cat logs/errors/latest.log
cat logs/reports/daily-summary.log

# Agent registry status
cat /agents/registry.json

# Agent discovery log
cat /docs/agent-discovery.md

# Check recent progress
tail -20 logs/agent-activity/$(date +%Y-%m-%d).log
```

## ✍️ **Writing Memory & Context Commands**

### **Record Achievements**

```javascript
// Create new technical milestone
mcp__memory__create_entities([
  {
    name: "Privacy Policy Implementation",
    entityType: "Technical Milestone",
    observations: [
      "Created comprehensive privacy policy page at /legal/privacy",
      "Fixed hydration errors in LegalDocument component",
      "Added responsive footer with legal links",
      "Implemented complete legal framework",
    ],
  },
]);

// Add observations to existing project
mcp__memory__add_observations([
  {
    entityName: "Mystic Arcana Project",
    contents: [
      "Privacy policy implementation completed January 2025",
      "Mobile responsiveness issues identified and documented",
      "Legal framework fully operational",
    ],
  },
]);

// Create relations between achievements
mcp__memory__create_relations([
  {
    from: "Privacy Policy Implementation",
    to: "Legal Compliance Phase",
    relationType: "completed_as_part_of",
  },
]);
```

### **Record Issues & TODOs**

```javascript
// Document current issues
mcp__memory__create_entities([
  {
    name: "Mobile Layout Issues",
    entityType: "Technical Issue",
    observations: [
      "Three-panel layout breaks on mobile devices",
      "Content gets cut off on small screens",
      "Multiple competing layout systems need consolidation",
      "Requires responsive Tailwind CSS implementation",
    ],
  },
]);

// Add urgent TODOs
mcp__memory__add_observations([
  {
    entityName: "Outstanding Tasks",
    contents: [
      "Fix mobile responsiveness in src/app/page.tsx",
      "Consolidate 4 different layout systems",
      "Implement mobile-first responsive design",
      "Test on various device sizes",
    ],
  },
]);
```

## 🤖 **Augment Agent Monitoring**

### **Check Agent Activity**

```bash
# Monitor Augment Agent status
cat /agents/registry.json | jq '.agents[] | select(.name | contains("Augment"))'

# Watch agent activity in real-time
tail -f logs/agent-activity/$(date +%Y-%m-%d).log | grep "Augment"

# Search for Augment updates
mcp__memory__search_nodes("Augment")
mcp__memory__search_nodes("agent activity")
mcp__memory__search_nodes("parallel work")
```

### **MCP Server Status**

```bash
# Check MCP configuration
cat .cursor/mcp.json

# Verify Augment connection
cat .cursor/mcp.json | jq '.mcpServers."augment-agent"'
```

## 🔄 **Session End Routine**

Copy and paste these commands before ending each Claude session:

```javascript
// 1. Record session summary
mcp__memory__add_observations([
  {
    entityName: "Session $(date +%Y-%m-%d)",
    contents: [
      "Session completed: [DESCRIBE WHAT WAS ACCOMPLISHED]",
      "Files modified: [LIST KEY FILES]",
      "Issues resolved: [LIST RESOLVED ISSUES]",
      "Next priorities: [LIST NEXT STEPS]",
    ],
  },
]);

// 2. Update project status
mcp__memory__create_relations([
  {
    from: "Session $(date +%Y-%m-%d)",
    to: "Mystic Arcana Project",
    relationType: "contributed_to",
  },
]);
```

```bash
# 3. Update agent registry
echo "Session ended: $(date)" >> logs/agent-activity/$(date +%Y-%m-%d).log

# 4. Create daily summary
echo "## Session Summary $(date +%Y-%m-%d)
- Accomplished: [FILL IN]
- Files changed: [FILL IN]
- Next session priorities: [FILL IN]" >> logs/reports/daily-summary.log
```

## 🎯 **Quick Reference Commands**

| **Action**             | **Command**                          | **Purpose**               |
| ---------------------- | ------------------------------------ | ------------------------- |
| **Start Session**      | `/init`                              | Refresh project context   |
| **Memory Search**      | `mcp__memory__search_nodes("topic")` | Find specific information |
| **Agent Status**       | `cat /agents/registry.json`          | Check parallel work       |
| **Recent Activity**    | `tail logs/agent-activity/*.log`     | Monitor recent activity   |
| **Record Achievement** | `mcp__memory__add_observations()`    | Document progress         |
| **Check Errors**       | `cat logs/errors/latest.log`         | Review issues             |
| **Project Memory**     | `/memory`                            | Access memory system      |

## 🔧 **Emergency Commands**

### **When Things Break**

```bash
# Check build status
npm run build

# Review error logs
cat logs/errors/latest.log
tail -50 logs/agent-activity/$(date +%Y-%m-%d).log

# Search for related issues
mcp__memory__search_nodes("error")
mcp__memory__search_nodes("build failure")
```

### **Context Recovery**

```bash
# Full project rescan
/init

# Rebuild memory context
mcp__memory__read_graph()

# Check agent registry for conflicts
cat /agents/registry.json
```

## 📋 **Session Templates**

### **Copy-Paste Session Starter**

```
/init
mcp__memory__read_graph()
cat /agents/registry.json
mcp__memory__search_nodes("$(date +%Y-%m-%d)")
```

### **Copy-Paste Session Ender**

```javascript
mcp__memory__add_observations([
  {
    entityName: "Session $(date +%Y-%m-%d)",
    contents: ["Session completed with: [DESCRIBE ACCOMPLISHMENTS]"],
  },
]);
```

---

**💡 Pro Tip**: Bookmark this file and copy-paste the relevant sections at the start and end of each Claude session for maximum efficiency!
