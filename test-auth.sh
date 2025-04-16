#!/bin/bash

# Set API base URL
BASE_URL="http://localhost:3000"

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Generate random email for testing
RANDOM_EMAIL="test_$(date +%s)@test.com"

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

echo -e "${YELLOW}Testing Auth Service API...${NC}"
echo "--------------------------"

# 1. Test User Signup
echo -e "\n${YELLOW}1. Testing User Signup${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -c cookie.txt -X POST $BASE_URL/api/users/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password123\",
    \"name\": \"Test User\",
    \"role\": \"customer\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 2. Test User Signin
echo -e "\n${YELLOW}2. Testing User Signin${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt -c cookie.txt -X POST $BASE_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password123\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 3. Test Get Current User
echo -e "\n${YELLOW}3. Testing Get Current User${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt $BASE_URL/api/users/currentuser)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 4. Test Signout
echo -e "\n${YELLOW}4. Testing Signout${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt -X POST $BASE_URL/api/users/signout)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 5. Verify Current User After Signout
echo -e "\n${YELLOW}5. Verifying Current User After Signout${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b cookie.txt $BASE_URL/api/users/currentuser)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 6. Test Invalid Login
echo -e "\n${YELLOW}6. Testing Invalid Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@test.com",
    "password": "wrongpassword"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}Expected 400 error received${NC}"
else
    echo -e "${RED}Unexpected response for invalid login${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# Clean up cookie file
rm -f cookie.txt

echo -e "\n${GREEN}Test Complete!${NC}" 