#!/bin/bash
# Test script for /api/astrology/calculate endpoint
# Tests Einstein birth data and various error conditions

API_URL="http://localhost:3002/api/astrology/calculate"

echo "🧪 Testing /api/astrology/calculate endpoint"
echo "============================================="

# Test 1: Valid Einstein data
echo "1️⃣  Testing valid Einstein birth data..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Albert Einstein",
    "date": "1879-03-14T11:30:00.000Z",
    "latitude": 48.4,
    "longitude": 10.0,
    "city": "Ulm",
    "country": "Germany"
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  2>/dev/null | jq '.'

echo "----------------------------------------"

# Test 2: Missing required fields
echo "2️⃣  Testing missing latitude (should return 400)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "date": "1990-01-01T12:00:00.000Z",
    "longitude": 10.0
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  2>/dev/null | jq '.'

echo "----------------------------------------"

# Test 3: Invalid date format
echo "3️⃣  Testing invalid date format (should return 400)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "date": "invalid-date",
    "latitude": 40.7,
    "longitude": -74.0
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  2>/dev/null | jq '.'

echo "----------------------------------------"

# Test 4: Out of range coordinates
echo "4️⃣  Testing out of range coordinates (should return 400)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "date": "1990-01-01T12:00:00.000Z",
    "latitude": 95.0,
    "longitude": 200.0
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  2>/dev/null | jq '.'

echo "----------------------------------------"

# Test 5: Minimal valid data
echo "5️⃣  Testing minimal valid data (required fields only)..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2000-01-01T00:00:00.000Z",
    "latitude": 0.0,
    "longitude": 0.0
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  2>/dev/null | jq '.'

echo "----------------------------------------"

# Test 6: GET endpoint info
echo "6️⃣  Testing GET endpoint for API documentation..."
curl -X GET "$API_URL" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n\n" \
  2>/dev/null | jq '.'

echo "✅ Testing complete!"

# Quick performance test
echo ""
echo "🚀 Performance Test - 5 identical Einstein requests..."
echo "=================================================="

for i in {1..5}; do
  echo -n "Request $i: "
  curl -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Albert Einstein",
      "date": "1879-03-14T11:30:00.000Z",
      "latitude": 48.4,
      "longitude": 10.0
    }' \
    -w "Status: %{http_code}, Time: %{time_total}s" \
    -s -o /dev/null
  echo ""
done

echo ""
echo "📊 Check response headers for cache status:"
echo "X-Cache-Status: HIT (cached) or MISS (calculated)"
echo "X-Response-Time: Response time in milliseconds"
echo "X-Calculation-Method: Which engine was used"