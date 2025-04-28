#!/bin/bash

# Set API base URL
BASE_URL="http://localhost:3004"

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 添加一个测试会话ID
TEST_SESSION_ID="test-session-123"

# Helper function to check response status
check_response() {
    local response=$1
    local http_code=$2

    echo -e "${YELLOW}HTTP Status Code: $http_code${NC}"
    echo -e "${YELLOW}Response Body: $response${NC}"

    if [ "$http_code" -ge 400 ]; then
        echo -e "${RED}Failed with HTTP $http_code${NC}"
        return 1
    elif [ -z "$response" ]; then
        echo -e "${RED}Empty response${NC}"
        return 1
    elif [[ $response == *"\"errors\""* ]]; then
        echo -e "${RED}Failed: $response${NC}"
        return 1
    else
        echo -e "${GREEN}Success${NC}"
        return 0
    fi
}

echo -e "${YELLOW}Testing Cart Service API...${NC}"
echo "--------------------------"

# 1. Add item to cart
echo -e "\n${YELLOW}1. Adding item to cart${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -c cookie.txt -X POST "$BASE_URL/api/cart/add?sessionId=$TEST_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "item": {
      "itemId": "test-product-1",
      "itemName": "Test Product",
      "unitPrice": 9.99,
      "quantity": 2
    }
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 2. Get cart
echo -e "\n${YELLOW}2. Getting cart${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt "$BASE_URL/api/cart?sessionId=$TEST_SESSION_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 3. Remove item from cart
echo -e "\n${YELLOW}3. Removing item from cart${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt -X POST "$BASE_URL/api/cart/remove?sessionId=$TEST_SESSION_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "itemId": "test-product-1"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 4. Clear cart
echo -e "\n${YELLOW}4. Clearing cart${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt -X POST "$BASE_URL/api/cart/clear?sessionId=$TEST_SESSION_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Clean up cookie file
rm -f cookie.txt

echo -e "\n${GREEN}Test Complete!${NC}" 