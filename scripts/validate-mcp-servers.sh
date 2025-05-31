#!/bin/bash

# MCP Server Validation Script
# This script tests each MCP server configuration to identify connection issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration files
MCP_CONFIG=".mcp.json"
ROO_CONFIG=".roo/mcp.json"

# Output files
REPORT_FILE="mcp-validation-report.txt"
WORKING_SERVERS_FILE="mcp-working-servers.json"
BROKEN_SERVERS_FILE="mcp-broken-servers.json"

echo -e "${BLUE}=== MCP Server Validation Script ===${NC}"
echo "Testing MCP server configurations..."
echo

# Initialize counters
total_servers=0
working_servers=0
broken_servers=0

# Initialize arrays
declare -a working_list=()
declare -a broken_list=()

# Function to check if command exists
check_command() {
    local cmd="$1"
    if command -v "$cmd" >/dev/null 2>&1; then
        return 0
    else
        return 1
    fi
}

# Function to check environment variable
check_env_var() {
    local var="$1"
    if [[ -n "${!var}" ]]; then
        echo -e "    ${GREEN}✓${NC} Environment variable $var is set"
        return 0
    else
        echo -e "    ${RED}✗${NC} Environment variable $var is not set"
        return 1
    fi
}

# Function to test MCP server connection
test_mcp_connection() {
    local server_name="$1"
    local command="$2"
    local timeout_duration=5
    
    echo -e "    ${BLUE}Testing MCP connection...${NC}"
    
    # Create a temporary test script
    cat > "/tmp/test_mcp_${server_name}.js" << 'EOF'
const { spawn } = require('child_process');

const serverName = process.argv[2];
const command = process.argv[3];

console.log(`Testing MCP server: ${serverName} with command: ${command}`);

const child = spawn(command, [], {
    stdio: ['pipe', 'pipe', 'pipe']
});

let hasResponded = false;

// Send MCP initialize request
const initRequest = {
    jsonrpc: "2.0",
    id: 1,
    method: "initialize",
    params: {
        protocolVersion: "2024-11-05",
        capabilities: {},
        clientInfo: {
            name: "validation-test",
            version: "1.0.0"
        }
    }
};

child.stdin.write(JSON.stringify(initRequest) + '\n');

child.stdout.on('data', (data) => {
    try {
        const response = JSON.parse(data.toString());
        if (response.id === 1 && !response.error) {
            console.log('✓ MCP server responded successfully');
            hasResponded = true;
            process.exit(0);
        }
    } catch (e) {
        // Ignore parse errors
    }
});

child.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
});

child.on('close', (code) => {
    if (!hasResponded) {
        console.log(`✗ MCP server connection failed (exit code: ${code})`);
        process.exit(1);
    }
});

// Timeout after 5 seconds
setTimeout(() => {
    if (!hasResponded) {
        console.log('✗ MCP server connection timeout');
        child.kill();
        process.exit(1);
    }
}, 5000);
EOF

    # Run the test
    if timeout $timeout_duration node "/tmp/test_mcp_${server_name}.js" "$server_name" "$command" 2>/dev/null; then
        echo -e "    ${GREEN}✓${NC} MCP connection successful"
        rm -f "/tmp/test_mcp_${server_name}.js"
        return 0
    else
        echo -e "    ${RED}✗${NC} MCP connection failed"
        rm -f "/tmp/test_mcp_${server_name}.js"
        return 1
    fi
}

# Function to validate a single server
validate_server() {
    local server_name="$1"
    local server_config="$2"
    
    echo -e "${YELLOW}Testing server: $server_name${NC}"
    
    # Extract command from config
    local command=$(echo "$server_config" | jq -r '.command')
    local args=$(echo "$server_config" | jq -r '.args // []')
    local env_vars=$(echo "$server_config" | jq -r '.env // {} | keys[]' 2>/dev/null || true)
    
    echo "  Command: $command"
    echo "  Args: $args"
    
    local issues=()
    
    # Check 1: Command format validation
    if [[ "$command" == *"/"* ]] && [[ "$command" != *"bin"* ]] && [[ "$command" != *"usr"* ]]; then
        echo -e "    ${RED}✗${NC} Command appears to be GitHub-style reference: $command"
        issues+=("github-style-command")
    fi
    
    # Check 2: Command availability
    if ! check_command "$command"; then
        echo -e "    ${RED}✗${NC} Command '$command' not found in PATH"
        issues+=("command-not-found")
    else
        echo -e "    ${GREEN}✓${NC} Command '$command' found"
    fi
    
    # Check 3: Environment variables
    local env_issues=0
    if [[ -n "$env_vars" ]]; then
        echo "    Required environment variables:"
        while IFS= read -r var; do
            if [[ -n "$var" ]]; then
                if ! check_env_var "$var"; then
                    env_issues=$((env_issues + 1))
                fi
            fi
        done <<< "$env_vars"
        
        if [[ $env_issues -gt 0 ]]; then
            issues+=("missing-env-vars")
        fi
    fi
    
    # Check 4: MCP connection test (only if command exists and no critical issues)
    if check_command "$command" && [[ $env_issues -eq 0 ]]; then
        if ! test_mcp_connection "$server_name" "$command"; then
            issues+=("mcp-connection-failed")
        fi
    else
        echo -e "    ${YELLOW}⚠${NC} Skipping MCP connection test due to previous issues"
        issues+=("skipped-connection-test")
    fi
    
    # Determine overall status
    if [[ ${#issues[@]} -eq 0 ]]; then
        echo -e "    ${GREEN}✓ WORKING${NC}"
        working_list+=("$server_name")
        working_servers=$((working_servers + 1))
        return 0
    else
        echo -e "    ${RED}✗ BROKEN (${issues[*]})${NC}"
        broken_list+=("$server_name:${issues[*]}")
        broken_servers=$((broken_servers + 1))
        return 1
    fi
}

# Main validation function
main() {
    # Check if config file exists
    if [[ ! -f "$MCP_CONFIG" ]]; then
        echo -e "${RED}Error: $MCP_CONFIG not found${NC}"
        exit 1
    fi
    
    # Check if jq is available
    if ! check_command "jq"; then
        echo -e "${RED}Error: jq is required but not installed${NC}"
        echo "Install with: brew install jq"
        exit 1
    fi
    
    # Check if node is available
    if ! check_command "node"; then
        echo -e "${RED}Error: Node.js is required but not installed${NC}"
        exit 1
    fi
    
    echo "Configuration file: $MCP_CONFIG"
    echo
    
    # Start report
    {
        echo "MCP Server Validation Report"
        echo "Generated: $(date)"
        echo "=========================="
        echo
    } > "$REPORT_FILE"
    
    # Get list of servers
    local servers=$(jq -r '.mcpServers | keys[]' "$MCP_CONFIG")
    
    # Count total servers
    total_servers=$(echo "$servers" | wc -l | tr -d ' ')
    
    echo "Found $total_servers MCP servers to validate"
    echo
    
    # Validate each server
    while IFS= read -r server_name; do
        local server_config=$(jq -c ".mcpServers[\"$server_name\"]" "$MCP_CONFIG")
        validate_server "$server_name" "$server_config"
        echo
        
        # Add to report
        {
            echo "Server: $server_name"
            echo "Status: $(if [[ " ${working_list[*]} " =~ " $server_name " ]]; then echo "WORKING"; else echo "BROKEN"; fi)"
            echo "Command: $(echo "$server_config" | jq -r '.command')"
            echo "---"
        } >> "$REPORT_FILE"
        
    done <<< "$servers"
    
    # Generate summary
    echo -e "${BLUE}=== VALIDATION SUMMARY ===${NC}"
    echo "Total servers: $total_servers"
    echo -e "Working servers: ${GREEN}$working_servers${NC}"
    echo -e "Broken servers: ${RED}$broken_servers${NC}"
    echo
    
    # Generate working servers config
    echo "{" > "$WORKING_SERVERS_FILE"
    echo "  \"mcpServers\": {" >> "$WORKING_SERVERS_FILE"
    
    local first=true
    for server in "${working_list[@]}"; do
        if [[ "$first" == true ]]; then
            first=false
        else
            echo "," >> "$WORKING_SERVERS_FILE"
        fi
        
        local server_config=$(jq -c ".mcpServers[\"$server\"]" "$MCP_CONFIG")
        echo "    \"$server\": $server_config" >> "$WORKING_SERVERS_FILE"
    done
    
    echo "" >> "$WORKING_SERVERS_FILE"
    echo "  }" >> "$WORKING_SERVERS_FILE"
    echo "}" >> "$WORKING_SERVERS_FILE"
    
    # Generate broken servers list
    {
        echo "{"
        echo "  \"brokenServers\": ["
        local first=true
        for item in "${broken_list[@]}"; do
            if [[ "$first" == true ]]; then
                first=false
            else
                echo ","
            fi
            local server_name=$(echo "$item" | cut -d: -f1)
            local issues=$(echo "$item" | cut -d: -f2-)
            echo "    {"
            echo "      \"name\": \"$server_name\","
            echo "      \"issues\": \"$issues\""
            echo -n "    }"
        done
        echo ""
        echo "  ]"
        echo "}"
    } > "$BROKEN_SERVERS_FILE"
    
    echo -e "${BLUE}Reports generated:${NC}"
    echo "  - $REPORT_FILE (detailed report)"
    echo "  - $WORKING_SERVERS_FILE (working servers config)"
    echo "  - $BROKEN_SERVERS_FILE (broken servers list)"
    echo
    
    if [[ $broken_servers -gt 0 ]]; then
        echo -e "${YELLOW}Recommendations:${NC}"
        echo "1. Replace $MCP_CONFIG with $WORKING_SERVERS_FILE to use only working servers"
        echo "2. Install missing MCP server packages"
        echo "3. Set required environment variables"
        echo "4. Fix GitHub-style command references"
    else
        echo -e "${GREEN}All MCP servers are working correctly!${NC}"
    fi
}

# Run main function
main "$@"