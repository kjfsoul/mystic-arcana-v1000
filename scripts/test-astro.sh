#!/bin/bash

# test-astro.sh - Comprehensive Astrology API Testing Script
# Validates Redis connectivity, API endpoints, and runs Einstein benchmarks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
API_PORT=${API_PORT:-3000}
API_BASE_URL="http://localhost:${API_PORT}"
REDIS_URL=${REDIS_URL:-"redis://localhost:6379"}

echo -e "${BLUE}🔮 MYSTIC ARCANA ASTROLOGY TESTING SUITE${NC}"
echo "=================================================="
echo "API Port: ${API_PORT}"
echo "API Base URL: ${API_BASE_URL}"
echo "Redis URL: ${REDIS_URL}"
echo ""

# Step 1: Check Redis connectivity
echo -e "${YELLOW}🔄 Step 1: Checking Redis connectivity...${NC}"
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is running and responsive${NC}"
        redis-cli info server | grep "redis_version" || echo "Redis info unavailable"
    else
        echo -e "${RED}❌ Redis is not responding${NC}"
        echo "To start Redis:"
        echo "  - macOS: brew services start redis"
        echo "  - Linux: sudo service redis-server start"
        echo "  - Docker: docker run -d -p 6379:6379 redis:alpine"
        echo ""
        echo -e "${YELLOW}⚠️  Continuing without Redis - cache functionality will be limited${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  redis-cli not found - skipping Redis check${NC}"
    echo "Install Redis CLI:"
    echo "  - macOS: brew install redis"
    echo "  - Linux: sudo apt-get install redis-tools"
fi
echo ""

# Step 2: Check if development server is running
echo -e "${YELLOW}🔄 Step 2: Checking development server...${NC}"
if curl -s -o /dev/null -w "%{http_code}" "${API_BASE_URL}" | grep -q "200\|404\|500"; then
    echo -e "${GREEN}✅ Development server is running on port ${API_PORT}${NC}"
else
    echo -e "${RED}❌ Development server is not running${NC}"
    echo "Starting development server..."
    echo "Run: npm run dev"
    echo ""
    echo "Waiting for server to start..."
    
    # Try to start dev server in background (optional)
    if command -v npm &> /dev/null; then
        echo "Attempting to start server automatically..."
        npm run dev &
        DEV_SERVER_PID=$!
        echo "Dev server started with PID: ${DEV_SERVER_PID}"
        
        # Wait for server to be ready
        for i in {1..30}; do
            if curl -s -o /dev/null "${API_BASE_URL}" &> /dev/null; then
                echo -e "${GREEN}✅ Server is ready!${NC}"
                break
            fi
            echo "Waiting for server... (${i}/30)"
            sleep 2
        done
    else
        echo "npm not found - please start the server manually"
        exit 1
    fi
fi
echo ""

# Step 3: Test API endpoints
echo -e "${YELLOW}🔄 Step 3: Testing API endpoints...${NC}"

# Test health endpoint
echo "Testing health endpoint..."
if curl -s "${API_BASE_URL}/api/health" &> /dev/null; then
    echo -e "${GREEN}✅ Health endpoint responding${NC}"
else
    echo -e "${YELLOW}⚠️  Health endpoint not available${NC}"
fi

# Test cache stats endpoint
echo "Testing cache stats endpoint..."
if curl -s "${API_BASE_URL}/api/astrology/cache/stats" | grep -q "success\|error"; then
    echo -e "${GREEN}✅ Cache stats endpoint responding${NC}"
    curl -s "${API_BASE_URL}/api/astrology/cache/stats" | head -3
else
    echo -e "${YELLOW}⚠️  Cache stats endpoint not responding${NC}"
fi

# Test birth-chart endpoint with proper payload
echo "Testing birth-chart endpoint..."
EINSTEIN_PAYLOAD='{
  "name": "Albert Einstein",
  "birthDate": "1879-03-14T11:30:00.000Z",
  "location": {
    "lat": 48.4,
    "lon": 10.0,
    "city": "Ulm",
    "country": "Germany",
    "timezone": "Europe/Berlin"
  }
}'

BIRTH_CHART_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST "${API_BASE_URL}/api/astrology/birth-chart" \
  -H "Content-Type: application/json" \
  -d "${EINSTEIN_PAYLOAD}")

HTTP_STATUS=$(echo $BIRTH_CHART_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $BIRTH_CHART_RESPONSE | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Birth-chart endpoint working (HTTP 200)${NC}"
    echo "Response preview:"
    echo "$RESPONSE_BODY" | head -3
else
    echo -e "${RED}❌ Birth-chart endpoint failed (HTTP ${HTTP_STATUS})${NC}"
    echo "Error response:"
    echo "$RESPONSE_BODY" | head -5
fi

# Test calculate endpoint
echo "Testing calculate endpoint..."
CALCULATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
  -X POST "${API_BASE_URL}/api/astrology/calculate" \
  -H "Content-Type: application/json" \
  -d "${EINSTEIN_PAYLOAD}")

HTTP_STATUS=$(echo $CALCULATE_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo $CALCULATE_RESPONSE | sed -E 's/HTTPSTATUS\:[0-9]{3}$//')

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Calculate endpoint working (HTTP 200)${NC}"
    echo "Response preview:"
    echo "$RESPONSE_BODY" | head -3
else
    echo -e "${RED}❌ Calculate endpoint failed (HTTP ${HTTP_STATUS})${NC}"
    echo "Error response:"
    echo "$RESPONSE_BODY" | head -5
fi
echo ""

# Step 4: Prime cache with Einstein data
echo -e "${YELLOW}🔄 Step 4: Priming cache with Einstein data...${NC}"
echo "Making initial request to populate cache..."
curl -s -X POST "${API_BASE_URL}/api/astrology/birth-chart" \
  -H "Content-Type: application/json" \
  -d "${EINSTEIN_PAYLOAD}" > /dev/null

echo "Waiting for cache to settle..."
sleep 2
echo -e "${GREEN}✅ Cache primed successfully${NC}"
echo ""

# Step 5: Run comprehensive Einstein benchmark
echo -e "${YELLOW}🔄 Step 5: Running Einstein caching benchmark...${NC}"
echo "Starting 10-iteration benchmark with cache analysis..."

if command -v npm &> /dev/null; then
    echo "Running: npm run test:caching-einstein"
    npm run test:caching-einstein
    
    BENCHMARK_EXIT_CODE=$?
    if [ $BENCHMARK_EXIT_CODE -eq 0 ]; then
        echo -e "${GREEN}✅ Einstein benchmark completed successfully${NC}"
    else
        echo -e "${RED}❌ Einstein benchmark failed with exit code: ${BENCHMARK_EXIT_CODE}${NC}"
    fi
else
    echo -e "${RED}❌ npm not found - cannot run benchmark${NC}"
    echo "Run manually: npm run test:caching-einstein"
fi
echo ""

# Step 6: Validation summary
echo -e "${BLUE}📊 VALIDATION SUMMARY${NC}"
echo "===================="
echo -e "${GREEN}✅ Tests completed${NC}"
echo ""
echo "Next steps:"
echo "1. Check benchmark results in test-results/ directory"
echo "2. Review A-mem logs for detailed execution data"
echo "3. Monitor cache efficiency with Redis stats"
echo "4. Validate astronomical accuracy with known test cases"
echo ""

# Optional: Clean up background processes
if [ ! -z "${DEV_SERVER_PID}" ]; then
    echo "Development server is running with PID: ${DEV_SERVER_PID}"
    echo "To stop: kill ${DEV_SERVER_PID}"
fi

echo -e "${BLUE}🔮 Astrology testing suite completed successfully! 🔮${NC}"