#!/bin/bash

# Set API base URL
BASE_URL="http://localhost:3001"
AUTH_URL="http://localhost:3000"

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Generate random emails for testing
CUSTOMER_EMAIL="customer_$(date +%s)@test.com"
STAFF_EMAIL="staff_$(date +%s)@test.com"

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

echo -e "${YELLOW}Testing Menu Service API...${NC}"
echo "--------------------------"

# 1. Register staff account
echo -e "\n${YELLOW}1. Register Staff Account${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $AUTH_URL/api/users/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$STAFF_EMAIL\",
    \"password\": \"password123\",
    \"name\": \"Test Staff\",
    \"role\": \"staff\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 2. Staff login and get cookie
echo -e "\n${YELLOW}2. Staff Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -c staff_cookie.txt -X POST $AUTH_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$STAFF_EMAIL\",
    \"password\": \"password123\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Extract the session cookie value - new format
SESSION_VALUE=$(grep -o "session\s.*" staff_cookie.txt | awk '{print $2}')
if [ -z "$SESSION_VALUE" ]; then
    echo -e "${RED}Failed to extract session cookie${NC}"
    exit 1
fi

echo -e "${GREEN}Session cookie extracted successfully${NC}"

# 3. Create menu item with session cookie
echo -e "\n${YELLOW}3. Create Menu Item${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/menu \
  -H "Content-Type: application/json" \
  -H "Cookie: session=$SESSION_VALUE" \
  -d '{
    "name": "Test Burger",
    "description": "A delicious test burger",
    "price": 1299,
    "category": "Main Course",
    "imageUrl": "https://example.com/burger.jpg",
    "availability": "available"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Extract menu item ID
if [ ! -z "$BODY" ]; then
    MENU_ITEM_ID=$(echo $BODY | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    if [ -z "$MENU_ITEM_ID" ]; then
        echo -e "${RED}Failed to get menu item ID from response${NC}"
        echo -e "${YELLOW}Response was: $BODY${NC}"
        exit 1
    fi
else
    echo -e "${RED}Empty response when creating menu item${NC}"
    exit 1
fi

# 4. Get menu item
echo -e "\n${YELLOW}4. Get Menu Item${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$SESSION_VALUE" $BASE_URL/api/menu/$MENU_ITEM_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 5. Update menu item
echo -e "\n${YELLOW}5. Update Menu Item${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$SESSION_VALUE" -X PUT $BASE_URL/api/menu/$MENU_ITEM_ID \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Test Burger",
    "price": 1499,
    "availability": "out_of_stock"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 6. Get all menu items
echo -e "\n${YELLOW}6. Get All Menu Items${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$SESSION_VALUE" $BASE_URL/api/menu)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 7. Test invalid menu item ID
echo -e "\n${YELLOW}7. Test Invalid Menu Item ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$SESSION_VALUE" $BASE_URL/api/menu/invalid_id)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${GREEN}Expected 404 error received${NC}"
else
    echo -e "${RED}Unexpected response for invalid menu item ID${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 8. Test unauthorized menu item creation
echo -e "\n${YELLOW}8. Test Unauthorized Menu Item Creation${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/menu \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthorized Item",
    "description": "This should fail",
    "price": 999,
    "category": "Test"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}Expected 401 error received${NC}"
else
    echo -e "${RED}Unexpected response for unauthorized access${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# Clean up cookie files
rm -f staff_cookie.txt

echo -e "\n${GREEN}Test Complete!${NC}" 