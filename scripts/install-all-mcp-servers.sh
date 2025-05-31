#!/bin/bash

# Comprehensive MCP Servers Installation and Configuration Script
# This script attempts to install all specified MCP servers and updates configuration files.

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Comprehensive MCP Server Setup ===${NC}"
echo

# Configuration files
MCP_CONFIG=".mcp.json"
ROO_GLOBAL_CONFIG="/Users/kfitz/Library/Application Support/Cursor/User/globalStorage/rooveterinaryinc.roo-cline/settings/mcp_settings.json"
MCP_TESTER_SCRIPT="scripts/mcp-tester.js"

# Provided JSON configuration (from user feedback)
read -r -d '' USER_MCP_CONFIG_JSON << 'EOF'
{
  "mcpServers": {
    "filesystem": {
      "command": "filesystem-mcp-server",
      "args": [],
      "env": {}
    },
    "filesystem-alt": {
      "command": "mcp-server-fs",
      "args": [],
      "env": {}
    },
    "file-operations": {
      "command": "mcp-file-operations-server",
      "args": [],
      "env": {}
    },
    "text-editor": {
      "command": "tumf/mcp-text-editor",
      "args": [],
      "env": {}
    },
    "text-editor-alt": {
      "command": "mcp-server-text-editor",
      "args": [],
      "env": {}
    },
    "git": {
      "command": "git",
      "args": [],
      "env": {}
    },
    "git-mcp": {
      "command": "git-mcp45",
      "args": [],
      "env": {}
    },
    "github": {
      "command": "github-mcp-server",
      "args": [],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    },
    "git-ingest": {
      "command": "mcp-git-ingest",
      "args": [],
      "env": {}
    },
    "language-server": {
      "command": "isaacphi/mcp-language-server",
      "args": [],
      "env": {}
    },
    "react-analyzer": {
      "command": "azer/react-analyzer-mcp",
      "args": [],
      "env": {}
    },
    "file-scope": {
      "command": "admica/FileScopeMCP",
      "args": [],
      "env": {}
    },
    "claude-code": {
      "command": "SDGLBL/mcp-claude-code",
      "args": [],
      "env": {}
    },
    "commands": {
      "command": "mcp-server-commands",
      "args": [],
      "env": {}
    },
    "windows-cli": {
      "command": "Windows-Command-Line-MCP-Server",
      "args": [],
      "env": {}
    },
    "mac-shell": {
      "command": "mac-shell-mcp",
      "args": [],
      "env": {}
    },
    "unix-manual": {
      "command": "mcp-unix-manual",
      "args": [],
      "env": {}
    },
    "code-runner": {
      "command": "mcp-code-runner",
      "args": [],
      "env": {}
    },
    "vscode": {
      "command": "vscode-mcp-server",
      "args": [],
      "env": {}
    },

    "fetch": {
      "command": "fetch",
      "args": [],
      "env": {}
    },
    "firecrawl": {
      "command": "FireCrawl",
      "args": [],
      "env": {
        "FIRECRAWL_API_KEY": "${FIRECRAWL_API_KEY}"
      }
    },
    "dbhub": {
      "command": "DBHub",
      "args": [],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    },
    "gateway": {
      "command": "gateway",
      "args": [],
      "env": {}
    },
    "supabase": {
      "command": "mcp-supabase",
      "args": [],
      "env": {
        "SUPABASE_URL": "${SUPABASE_URL}",
        "SUPABASE_ANON_KEY": "${SUPABASE_ANON_KEY}"
      }
    },
    "mysql": {
      "command": "mysql-mcp-server",
      "args": [],
      "env": {
        "MYSQL_CONNECTION_STRING": "${MYSQL_CONNECTION_STRING}"
      }
    },
    "mcp-link": {
      "command": "automation-ai-labs/mcp-link",
      "args": [],
      "env": {}
    },
    "openapi": {
      "command": "snaggle-ai/openapi-mcp-server",
      "args": [],
      "env": {}
    },
    "openapi-any": {
      "command": "mcp-server-any-openapi",
      "args": [],
      "env": {}
    },

    "security-audit": {
      "command": "mcp-security-audit",
      "args": [],
      "env": {}
    },
    "semgrep": {
      "command": "mcp-server-semgrep",
      "args": [],
      "env": {
        "SEMGREP_APP_TOKEN": "${SEMGREP_APP_TOKEN}"
      }
    },
    "osv": {
      "command": "OSV-MCP",
      "args": [],
      "env": {}
    },
    "deebo": {
      "command": "Deebo",
      "args": [],
      "env": {}
    },
    "claude-debugs": {
      "command": "jasonjmcghee/claude-debugs-for-you",
      "args": [],
      "env": {}
    },
    "user-feedback": {
      "command": "mrexodia/user-feedback-mcp",
      "args": [],
      "env": {}
    },
    "interactive": {
      "command": "interactive-mcp",
      "args": [],
      "env": {}
    },
    "human-loop": {
      "command": "mcp-human-loop",
      "args": [],
      "env": {}
    },
    "heimdall": {
      "command": "heimdall",
      "args": [],
      "env": {}
    },

    "ragdocs": {
      "command": "RagDocs",
      "args": [],
      "env": {}
    },
    "ragdocs-server": {
      "command": "mcp-server-ragdocs",
      "args": [],
      "env": {}
    },
    "context7": {
      "command": "context7-mcp",
      "args": [],
      "env": {}
    },
    "mcpdoc": {
      "command": "mcpdoc",
      "args": [],
      "env": {}
    },
    "basic-memory": {
      "command": "basic-memory",
      "args": [],
      "env": {}
    },
    "mem0": {
      "command": "mem0-mcp",
      "args": [],
      "env": {}
    },
    "chain-of-draft": {
      "command": "mcp-chain-of-draft-server",
      "args": [],
      "env": {}
    },
    "memgpt": {
      "command": "Memgpt-MCP-Server",
      "args": [],
      "env": {}
    },
    "optimized-memory": {
      "command": "optimized-memory-mcp-serverv2",
      "args": [],
      "env": {}
    },

    "nextjs-dev": {
      "command": "MCP-Dev-NextJS",
      "args": [],
      "env": {}
    },
    "react-ui": {
      "command": "MCP-React-UI",
      "args": [],
      "env": {}
    },
    "netlify-docs": {
      "command": "MCP-Netlify-EdgeDocs",
      "args": [],
      "env": {}
    },
    "fullstack-turbo": {
      "command": "MCP-Fullstack-Turbo",
      "args": [],
      "env": {}
    },
    "ai-function-pack": {
      "command": "MCP-AI-FunctionPack",
      "args": [],
      "env": {}
    },
    "cms-headless": {
      "command": "MCP-CMS-Headless",
      "args": [],
      "env": {}
    },
    "commerce-stripe": {
      "command": "MCP-Commerce-Stripe",
      "args": [],
      "env": {
        "STRIPE_SECRET_KEY": "${STRIPE_SECRET_KEY}",
        "STRIPE_WEBHOOK_SECRET": "${STRIPE_WEBHOOK_SECRET}"
      }
    },
    "design-system-tailwind": {
      "command": "MCP-Design-System-Tailwind",
      "args": [],
      "env": {}
    }
  }
}
EOF

# Check prerequisites
check_prerequisites() {
    echo "Checking prerequisites..."
    if ! command -v npm >/dev/null 2>&1; then
        echo -e "${RED}❌ npm is required but not installed${NC}"
        echo "Please install Node.js and npm first"
        exit 1
    fi
    if ! command -v npx >/dev/null 2>&1; then
        echo -e "${RED}❌ npx is required but not installed${NC}"
        echo "Please install Node.js and npm first"
        exit 1
    fi
    if ! command -v jq >/dev/null 2>&1; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        echo "Install with: brew install jq"
        exit 1
    fi
    echo -e "${GREEN}✅ Node.js, npm, and jq are available${NC}"
}

# Function to install an npm package globally
install_npm_package() {
    local package_name="$1"
    echo "Attempting to install ${package_name}..."
    if npm install -g "${package_name}" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ ${package_name} installed successfully${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠️ Failed to install ${package_name}${NC}"
        return 1
    fi
}

# Main installation and configuration process
main() {
    check_prerequisites

    echo -e "${BLUE}Parsing user-provided MCP configuration...${NC}"
    local servers_json=$(echo "$USER_MCP_CONFIG_JSON" | jq -c '.mcpServers')
    local server_names=$(echo "$servers_json" | jq -r 'keys[]')

    # Prepare the new configuration with corrections
    local new_mcp_config="{ \"mcpServers\": {} }"

    echo -e "${BLUE}Attempting to install and configure servers...${NC}"
    for server_name in $server_names; do
        local server_config=$(echo "$servers_json" | jq -c ".\"${server_name}\"")
        local command=$(echo "$server_config" | jq -r '.command')
        local args=$(echo "$server_config" | jq -r '.args // []')
        local env_vars=$(echo "$server_config" | jq -r '.env // {}')

        echo -e "\n${YELLOW}Processing server: ${server_name}${NC}"
        echo "  Original Command: ${command}"

        local corrected_command="$command"
        local install_package=""
        local notes=""

        # --- Command Correction and Installation Strategy ---
        if [[ "$command" == *"/"* ]] && [[ "$command" != *"bin"* ]] && [[ "$command" != *"usr"* ]]; then
            # Appears to be a GitHub-style reference or similar, try to infer npm package name
            local inferred_name=$(echo "$command" | awk -F'/' '{print $NF}')
            if [[ "$inferred_name" == "mcp-"* ]]; then
                corrected_command="$inferred_name"
                install_package="@modelcontextprotocol/${inferred_name}"
                notes+=" (Command corrected from GitHub-style reference. Attempting npm install.)"
            elif [[ "$inferred_name" == "FileScopeMCP" ]]; then
                corrected_command="FileScopeMCP" # Keep as is, might be a specific binary
                notes+=" (Likely a specific binary, not an npm package.)"
            else
                corrected_command="${inferred_name}" # Default to just the last part
                notes+=" (Command corrected from GitHub-style reference. May require specific installation.)"
            fi
        elif [[ "$command" == "filesystem-mcp-server" ]]; then
            corrected_command="mcp-server-filesystem"
            install_package="@modelcontextprotocol/server-filesystem"
            notes+=" (Command corrected. Attempting npm install.)"
        elif [[ "$command" == "mcp-server-fs" ]]; then
            install_package="@modelcontextprotocol/server-filesystem" # Often same as filesystem
            notes+=" (Attempting npm install.)"
        elif [[ "$command" == "mcp-file-operations-server" ]]; then
            install_package="@modelcontextprotocol/server-file-operations"
            notes+=" (Attempting npm install.)"
        elif [[ "$command" == "git" ]]; then
            notes+=" (Git is usually pre-installed. No npm install needed.)"
        elif [[ "$command" == "fetch" ]]; then
            install_package="@modelcontextprotocol/server-fetch"
            notes+=" (Attempting npm install.)"
        elif [[ "$command" == "FireCrawl" ]]; then
            install_package="firecrawl-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for FireCrawl.)"
        elif [[ "$command" == "DBHub" ]]; then
            install_package="dbhub-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for DBHub.)"
        elif [[ "$command" == "gateway" ]]; then
            install_package="gateway-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Gateway.)"
        elif [[ "$command" == "OSV-MCP" ]]; then
            install_package="osv-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for OSV.)"
        elif [[ "$command" == "Deebo" ]]; then
            install_package="deebo-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Deebo.)"
        elif [[ "$command" == "RagDocs" ]]; then
            install_package="ragdocs-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for RagDocs.)"
        elif [[ "$command" == "Memgpt-MCP-Server" ]]; then
            install_package="memgpt-mcp-server" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Memgpt.)"
        elif [[ "$command" == "MCP-Dev-NextJS" ]]; then
            install_package="mcp-dev-nextjs" # Assuming this is the npm package name
            notes+=" (Attempting npm install for NextJS Dev.)"
        elif [[ "$command" == "MCP-React-UI" ]]; then
            install_package="mcp-react-ui" # Assuming this is the npm package name
            notes+=" (Attempting npm install for React UI.)"
        elif [[ "$command" == "MCP-Netlify-EdgeDocs" ]]; then
            install_package="mcp-netlify-edgedocs" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Netlify Docs.)"
        elif [[ "$command" == "MCP-Fullstack-Turbo" ]]; then
            install_package="mcp-fullstack-turbo" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Fullstack Turbo.)"
        elif [[ "$command" == "MCP-AI-FunctionPack" ]]; then
            install_package="mcp-ai-functionpack" # Assuming this is the npm package name
            notes+=" (Attempting npm install for AI Function Pack.)"
        elif [[ "$command" == "MCP-CMS-Headless" ]]; then
            install_package="mcp-cms-headless" # Assuming this is the npm package name
            notes+=" (Attempting npm install for CMS Headless.)"
        elif [[ "$command" == "MCP-Commerce-Stripe" ]]; then
            install_package="mcp-commerce-stripe" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Commerce Stripe.)"
        elif [[ "$command" == "MCP-Design-System-Tailwind" ]]; then
            install_package="mcp-design-system-tailwind" # Assuming this is the npm package name
            notes+=" (Attempting npm install for Design System Tailwind.)"
        elif [[ "$command" == "mcp-server-"* ]] || [[ "$command" == "basic-memory" ]] || [[ "$command" == "mem0-mcp" ]] || [[ "$command" == "context7-mcp" ]] || [[ "$command" == "mcpdoc" ]] || [[ "$command" == "interactive-mcp" ]] || [[ "$command" == "human-loop" ]] || [[ "$command" == "heimdall" ]]; then
            install_package="@modelcontextprotocol/${command}" # Common pattern
            notes+=" (Attempting npm install.)"
        fi

        if [[ -n "$install_package" ]]; then
            install_npm_package "$install_package" || true # Continue even if install fails
        fi

        # --- Environment Variable Check ---
        local env_vars_keys=$(echo "$env_vars" | jq -r 'keys[]' 2>/dev/null || true)
        if [[ -n "$env_vars_keys" ]]; then
            echo "  Required Environment Variables:"
            for var_name in $env_vars_keys; do
                if [[ -z "${!var_name}" ]]; then
                    echo -e "    ${RED}✗ ${var_name} is NOT set. This server may not work.${NC}"
                    notes+=" (Missing ENV: ${var_name})"
                else
                    echo -e "    ${GREEN}✓ ${var_name} is set.${NC}"
                fi
            done
        fi

        # --- Special handling for filesystem server args ---
        if [[ "$server_name" == "filesystem" ]]; then
            args='["/Users/kfitz/Documents/Projects/Mystic_Arcana_App/mystic_arcana_v1000"]'
            notes+=" (Added workspace directory as argument for filesystem server.)"
        fi

        # Construct the updated server entry
        local updated_server_config=$(jq -n \
            --arg cmd "$corrected_command" \
            --argjson args "$args" \
            --argjson env "$env_vars" \
            '{command: $cmd, args: $args, env: $env}')

        # Add notes to the server config (as a comment or special field if possible, or just log)
        # For now, just log the notes. We can't add comments to JSON directly.
        if [[ -n "$notes" ]]; then
            echo "  Notes: ${notes}"
        fi

        # Add to the new configuration JSON
        new_mcp_config=$(echo "$new_mcp_config" | jq ".mcpServers.\"${server_name}\" = ${updated_server_config}")
    done

    echo -e "${BLUE}Updating .mcp.json...${NC}"
    cp "$MCP_CONFIG" "${MCP_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)" || true # Backup existing
    echo "$new_mcp_config" | jq '.' > "$MCP_CONFIG"
    echo -e "${GREEN}✅ Updated ${MCP_CONFIG}${NC}"

    echo -e "${BLUE}Updating global mcp_settings.json...${NC}"
    cp "$ROO_GLOBAL_CONFIG" "${ROO_GLOBAL_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)" || true # Backup existing
    echo "$new_mcp_config" | jq '.' > "$ROO_GLOBAL_CONFIG"
    echo -e "${GREEN}✅ Updated ${ROO_GLOBAL_CONFIG}${NC}"

    echo -e "${BLUE}Running MCP tester to verify installations...${NC}"
    if [[ -f "$MCP_TESTER_SCRIPT" ]]; then
        node "$MCP_TESTER_SCRIPT"
    else
        echo -e "${YELLOW}⚠️ MCP tester script not found at ${MCP_TESTER_SCRIPT}, skipping test.${NC}"
    fi

    echo -e "\n${GREEN}=== Comprehensive MCP Setup Complete ===${NC}"
    echo -e "${BLUE}Summary:${NC}"
    echo "• Attempted installation of all specified MCP servers."
    echo "• Corrected common command format issues in configuration."
    echo "• Updated both local and global MCP configuration files."
    echo "• Provided notes on missing environment variables and potential issues."
    echo -e "\n${YELLOW}IMPORTANT:${NC} Please restart your MCP client/IDE (Roo/Cursor) for all changes to take full effect."
    echo "Review the output above for any failed installations or missing environment variables."
}

# Run the main function
main "$@"