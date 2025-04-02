#!/bin/bash

# Set API base URLs
PAYMENT_URL="http://localhost:3003"
AUTH_URL="http://localhost:3000"
ORDERS_URL="http://localhost:3002"

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Generate random emails for testing
CUSTOMER_EMAIL="customer_$(date +%s)@test.com"
STAFF_EMAIL="staff_$(date +%s)@test.com"

# Helper function: Check response status
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

echo -e "${YELLOW}Testing Payment Service API...${NC}"
echo "--------------------------"

# 1. Register customer account
echo -e "\n${YELLOW}1. Register Customer Account${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -c customer_cookie.txt -X POST $AUTH_URL/api/users/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"password123\",
    \"name\": \"Test Customer\",
    \"role\": \"customer\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 2. Customer login
echo -e "\n${YELLOW}2. Customer Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b customer_cookie.txt -c customer_cookie.txt -X POST $AUTH_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"password123\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Extract customer session cookie
CUSTOMER_SESSION=$(grep -o "session\s.*" customer_cookie.txt | awk '{print $2}')
if [ -z "$CUSTOMER_SESSION" ]; then
    echo -e "${RED}Failed to extract customer session cookie${NC}"
    exit 1
fi
echo -e "${GREEN}Customer session cookie extracted successfully${NC}"

# 3. Register staff account
echo -e "\n${YELLOW}3. Register Staff Account${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -c staff_cookie.txt -X POST $AUTH_URL/api/users/signup \
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

# 4. Staff login
echo -e "\n${YELLOW}4. Staff Login${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -b staff_cookie.txt -c staff_cookie.txt -X POST $AUTH_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$STAFF_EMAIL\",
    \"password\": \"password123\"
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Extract staff session cookie
STAFF_SESSION=$(grep -o "session\s.*" staff_cookie.txt | awk '{print $2}')
if [ -z "$STAFF_SESSION" ]; then
    echo -e "${RED}Failed to extract staff session cookie${NC}"
    exit 1
fi
echo -e "${GREEN}Staff session cookie extracted successfully${NC}"

# 5. Create new order as customer
echo -e "\n${YELLOW}5. Create New Order (Customer)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X POST $ORDERS_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "menuItemId": "65f2b89c52f810b88c95c123",
        "name": "Test Dish",
        "price": 1000,
        "quantity": 2
      }
    ]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Extract order ID
if [ ! -z "$BODY" ]; then
    ORDER_ID=$(echo $BODY | grep -o '"id":"[^"]*' | tail -n 1 | cut -d'"' -f4)
    if [ -z "$ORDER_ID" ]; then
        echo -e "${RED}Failed to get order ID from response${NC}"
        echo -e "${YELLOW}Response was: $BODY${NC}"
        exit 1
    else
        echo -e "${GREEN}Order ID: $ORDER_ID${NC}"
    fi
else
    echo -e "${RED}Empty response when creating order${NC}"
    exit 1
fi

# Wait for order creation to complete
sleep 1

# 6. Create payment as customer
echo -e "\n${YELLOW}6. Create New Payment (Customer)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X POST $PAYMENT_URL/api/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"amount\": 2000
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Extract payment ID
if [ ! -z "$BODY" ]; then
    PAYMENT_ID=$(echo $BODY | grep -o '"id":"[^"]*' | tail -n 1 | cut -d'"' -f4)
    if [ -z "$PAYMENT_ID" ]; then
        echo -e "${RED}Failed to get payment ID from response${NC}"
        echo -e "${YELLOW}Response was: $BODY${NC}"
        exit 1
    else
        echo -e "${GREEN}Payment ID: $PAYMENT_ID${NC}"
    fi
else
    echo -e "${RED}Empty response when creating payment${NC}"
    exit 1
fi

# Wait for payment creation to complete
sleep 1

# 7. Get payment details
echo -e "\n${YELLOW}7. Get Payment Details (Customer)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" $PAYMENT_URL/api/payments/$PAYMENT_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 8. List all payments (staff only)
echo -e "\n${YELLOW}8. List All Payments (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" $PAYMENT_URL/api/payments)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 9. Update payment status to pending
echo -e "\n${YELLOW}9. Update Payment Status to Pending (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT $PAYMENT_URL/api/payments/$PAYMENT_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Wait for status update to complete
sleep 1

# 10. Update payment status to completed
echo -e "\n${YELLOW}10. Update Payment Status to Completed (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT $PAYMENT_URL/api/payments/$PAYMENT_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 11. Test invalid payment ID
echo -e "\n${YELLOW}11. Test Invalid Payment ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" $PAYMENT_URL/api/payments/invalid_id)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${GREEN}Expected 404 error received${NC}"
else
    echo -e "${RED}Unexpected response for invalid payment ID${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 12. Test invalid status transition
echo -e "\n${YELLOW}12. Test Invalid Status Transition${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT $PAYMENT_URL/api/payments/$PAYMENT_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "pending"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}Expected 400 error received (invalid transition)${NC}"
else
    echo -e "${RED}Unexpected response for invalid status transition${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 13. Test unauthorized access
echo -e "\n${YELLOW}13. Test Unauthorized Access${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $PAYMENT_URL/api/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"amount\": 2000
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}Expected 401 error received${NC}"
else
    echo -e "${RED}Unexpected response for unauthorized access${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 14. Test payment creation authorization
echo -e "\n${YELLOW}14. Test Payment Creation Authorization (Not Order Owner)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X POST $PAYMENT_URL/api/payments \
  -H "Content-Type: application/json" \
  -d "{
    \"orderId\": \"$ORDER_ID\",
    \"amount\": 2000
  }")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}Expected 401 error received (not order owner)${NC}"
else
    echo -e "${RED}Unexpected response for unauthorized payment creation${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# Clean up cookie files
rm -f customer_cookie.txt staff_cookie.txt

echo -e "\n${GREEN}Test Complete!${NC}" 