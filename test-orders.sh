#!/bin/bash

# Set API base URLs
BASE_URL="http://localhost:3002"
AUTH_URL="http://localhost:3000"

# Color definitions
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Generate random emails for testing
CUSTOMER_EMAIL="customer_$(date +%s)@test.com"
STAFF_EMAIL="staff_$(date +%s)@test.com"

# Helper function: Check response status with error extraction
check_response() {
    local response=$1
    local http_code=$2
    
    echo -e "${YELLOW}HTTP Status Code: $http_code${NC}"
    echo -e "${YELLOW}Response Body: $response${NC}"
    
    if [ "$http_code" -ge 400 ]; then
        echo -e "${RED}Failed with HTTP $http_code${NC}"
        # Extract error message from either errors array or error field
        if [[ $response == *"\"errors\""* ]]; then
            ERROR_MSG=$(echo "$response" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
            if [ ! -z "$ERROR_MSG" ]; then
                echo -e "${RED}Error message: $ERROR_MSG${NC}"
            fi
        elif [[ $response == *"\"error\""* ]]; then
            ERROR_MSG=$(echo "$response" | grep -o '"error":"[^"]*"' | head -1 | cut -d'"' -f4)
            if [ ! -z "$ERROR_MSG" ]; then
                echo -e "${RED}Error message: $ERROR_MSG${NC}"
            fi
        fi
        return 1
    elif [ -z "$response" ]; then
        echo -e "${RED}Empty response${NC}"
        return 1
    elif [[ $response == *"\"errors\""* ]]; then
        ERROR_MSG=$(echo "$response" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ ! -z "$ERROR_MSG" ]; then
            echo -e "${RED}Error message: $ERROR_MSG${NC}"
        else
            echo -e "${RED}Failed: $response${NC}"
        fi
        return 1
    else
        echo -e "${GREEN}Success${NC}"
        return 0
    fi
}

# Helper function: Generate UUID (fallback)
generate_uuid() {
    if command -v uuidgen &> /dev/null; then
        uuidgen | tr '[:upper:]' '[:lower:]'
    else
        # Python fallback for UUID generation
        python -c 'import uuid; print(str(uuid.uuid4()))'
    fi
}

# Helper function: Ensure UUID format
ensure_uuid_format() {
    local id=$1
    # Check if ID is already in UUID format
    if [[ $id =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
        echo "$id"
    else
        # Generate a new UUID if not in correct format
        local uuid=$(generate_uuid)
        echo -e "${YELLOW}Converting non-UUID format ID to: $uuid${NC}"
        echo "$uuid"
    fi
}

echo -e "${BLUE}===============================================${NC}"
echo -e "${BLUE}       ORDERS SERVICE TEST SCRIPT            ${NC}"
echo -e "${BLUE}===============================================${NC}"

echo -e "${YELLOW}Testing Orders Service API...${NC}"
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

# Extract the customer session cookie
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

# Extract the staff session cookie
STAFF_SESSION=$(grep -o "session\s.*" staff_cookie.txt | awk '{print $2}')
if [ -z "$STAFF_SESSION" ]; then
    echo -e "${RED}Failed to extract staff session cookie${NC}"
    exit 1
fi
echo -e "${GREEN}Staff session cookie extracted successfully${NC}"

# 5. Create new order as customer
echo -e "\n${YELLOW}5. Create New Order (Customer)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X POST "$BASE_URL/api/orders?test=true" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "table-123",
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

# Extract order ID with UUID validation
if [ ! -z "$BODY" ]; then
    # Try to extract from orderId field
    ORDER_ID=$(echo "$BODY" | grep -o '"orderId":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    # If not found, try id field
    if [ -z "$ORDER_ID" ]; then
        ORDER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -z "$ORDER_ID" ]; then
        echo -e "${RED}Failed to extract Order ID from response${NC}"
        echo -e "${YELLOW}Raw response: $BODY${NC}"
        # Generate a UUID as fallback
        ORDER_ID=$(generate_uuid)
        echo -e "${YELLOW}Using generated UUID as fallback: $ORDER_ID${NC}"
    else
        echo -e "${GREEN}Successfully extracted Order ID: $ORDER_ID${NC}"
        
        # Ensure UUID format
        ORIGINAL_ORDER_ID=$ORDER_ID
        ORDER_ID=$(ensure_uuid_format "$ORDER_ID")
        
        if [ "$ORIGINAL_ORDER_ID" != "$ORDER_ID" ]; then
            echo -e "${YELLOW}Order ID converted from: $ORIGINAL_ORDER_ID -> UUID: $ORDER_ID${NC}"
        fi
    fi
else
    echo -e "${RED}Empty response when creating order${NC}"
    exit 1
fi

# Wait to ensure order creation is complete
sleep 1

# 6. Get order details
echo -e "\n${YELLOW}6. Get Order Details${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" "$BASE_URL/api/orders/$ORDER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 7. Update order status to in preparation (staff)
echo -e "\n${YELLOW}7. Update Order Status to In Preparation (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT "$BASE_URL/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in:preparation"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# Wait to ensure status update is complete
sleep 1

# 8. Update order status to completed (staff)
echo -e "\n${YELLOW}8. Update Order Status to Completed (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT "$BASE_URL/api/orders/$ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 9. Test order cancellation 
echo -e "\n${YELLOW}9. Test Order Cancellation${NC}"
# First, create another order to cancel
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X POST "$BASE_URL/api/orders?test=true" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "table-456",
    "items": [
      {
        "menuItemId": "65f2b89c52f810b88c95c124",
        "name": "Test Dish 2",
        "price": 1500,
        "quantity": 1
      }
    ]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

if [ ! -z "$BODY" ]; then
    # Try to extract from orderId field
    ORDER_TO_CANCEL_ID=$(echo "$BODY" | grep -o '"orderId":"[^"]*"' | head -1 | cut -d'"' -f4)
    
    # If not found, try id field
    if [ -z "$ORDER_TO_CANCEL_ID" ]; then
        ORDER_TO_CANCEL_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    fi
    
    if [ -z "$ORDER_TO_CANCEL_ID" ]; then
        echo -e "${RED}Failed to extract Order ID for cancellation${NC}"
        echo -e "${YELLOW}Raw response: $BODY${NC}"
        exit 1
    else
        echo -e "${GREEN}Order to cancel ID: $ORDER_TO_CANCEL_ID${NC}"
        
        # Ensure UUID format
        ORIGINAL_ORDER_ID=$ORDER_TO_CANCEL_ID
        ORDER_TO_CANCEL_ID=$(ensure_uuid_format "$ORDER_TO_CANCEL_ID")
        
        if [ "$ORIGINAL_ORDER_ID" != "$ORDER_TO_CANCEL_ID" ]; then
            echo -e "${YELLOW}Order ID converted from: $ORIGINAL_ORDER_ID -> UUID: $ORDER_TO_CANCEL_ID${NC}"
        fi
    fi
else
    echo -e "${RED}Empty response when creating order to cancel${NC}"
    exit 1
fi

# Wait to ensure order creation is complete
sleep 1

# Try to cancel the order (using staff account to update status to 'cancelled')
echo -e "${YELLOW}Attempting to cancel order: $ORDER_TO_CANCEL_ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT "$BASE_URL/api/orders/$ORDER_TO_CANCEL_ID/status" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "cancelled"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

# Accept either 200 OK (successful update) or 204 No Content as success
if [ "$HTTP_CODE" -eq 204 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}Order cancelled successfully (HTTP $HTTP_CODE)${NC}"
else
    check_response "$BODY" "$HTTP_CODE"
fi

# Verify the order is actually cancelled
echo -e "\n${YELLOW}Verifying order is cancelled${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" "$BASE_URL/api/orders/$ORDER_TO_CANCEL_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
    if [[ $BODY == *"\"orderStatus\":\"cancelled\""* ]]; then
        echo -e "${GREEN}Order status verified as cancelled${NC}"
    else
        echo -e "${RED}Order exists but not cancelled: $BODY${NC}"
    fi
else
    # It's also possible the order was deleted, not just cancelled
    check_response "$BODY" "$HTTP_CODE"
fi

# 10. Test invalid order ID
echo -e "\n${YELLOW}10. Test Invalid Order ID${NC}"
INVALID_ID="invalid-order-id-format"
echo -e "${YELLOW}Using Invalid ID: $INVALID_ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" "$BASE_URL/api/orders/$INVALID_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 404 ] || [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}Expected 404/400 error received (${HTTP_CODE})${NC}"
    if [ ! -z "$BODY" ]; then
        ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ ! -z "$ERROR_MSG" ]; then
            echo -e "${YELLOW}Error message: $ERROR_MSG${NC}"
        fi
    fi
else
    echo -e "${RED}Unexpected response for invalid order ID${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 11. Test unauthorized access
echo -e "\n${YELLOW}11. Test Unauthorized Access${NC}"
echo -e "${YELLOW}Attempting request without session cookie${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/orders?test=true" \
  -H "Content-Type: application/json" \
  -d '{
    "tableId": "table-123",
    "items": [
      {
        "menuItemId": "65f2b89c52f810b88c95c123",
        "price": 1000,
        "quantity": 1
      }
    ]
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 403 ] || [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${GREEN}Expected 401/403/400 error received (${HTTP_CODE})${NC}"
    if [ ! -z "$BODY" ]; then
        # Try to extract message from various error formats
        if [[ $BODY == *"\"message\""* ]]; then
            ERROR_MSG=$(echo "$BODY" | grep -o '"message":"[^"]*"' | head -1 | cut -d'"' -f4)
        elif [[ $BODY == *"\"error\""* ]]; then
            ERROR_MSG=$(echo "$BODY" | grep -o '"error":"[^"]*"' | head -1 | cut -d'"' -f4)
        fi
        
        if [ ! -z "$ERROR_MSG" ]; then
            echo -e "${YELLOW}Error message: $ERROR_MSG${NC}"
        fi
    fi
else
    echo -e "${RED}Unexpected response for unauthorized access: ${HTTP_CODE}${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# Clean up cookie files
rm -f customer_cookie.txt staff_cookie.txt

echo -e "\n${GREEN}Test Complete!${NC}"
echo -e "${BLUE}===============================================${NC}" 