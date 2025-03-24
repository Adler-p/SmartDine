#!/bin/bash

# 设置 API 基础 URL
BASE_URL="http://localhost:3002"
AUTH_URL="http://localhost:3000"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 生成随机邮箱用于测试
CUSTOMER_EMAIL="customer_$(date +%s)@test.com"
STAFF_EMAIL="staff_$(date +%s)@test.com"

# 辅助函数：检查响应状态
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

echo -e "${YELLOW}Testing Orders Service API...${NC}"
echo "--------------------------"

# 1. 注册客户账号
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

# 2. 客户登录
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

# 3. 注册员工账号
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

# 4. 员工登录
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

# 5. 客户创建订单
echo -e "\n${YELLOW}5. Create New Order (Customer)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X POST $BASE_URL/api/orders \
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

# 提取订单ID
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

# 等待1秒确保订单创建完成
sleep 1

# 6. 获取订单详情
echo -e "\n${YELLOW}6. Get Order Details${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" $BASE_URL/api/orders/$ORDER_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 7. 员工更新订单状态为准备中
echo -e "\n${YELLOW}7. Update Order Status to In Preparation (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT $BASE_URL/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in:preparation"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 等待1秒确保状态更新完成
sleep 1

# 8. 员工更新订单状态为已完成
echo -e "\n${YELLOW}8. Update Order Status to Completed (Staff)${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$STAFF_SESSION" -X PUT $BASE_URL/api/orders/$ORDER_ID/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed"
  }')
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
check_response "$BODY" "$HTTP_CODE"

# 9. 测试取消订单
echo -e "\n${YELLOW}9. Test Order Cancellation${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X POST $BASE_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
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
    ORDER_TO_CANCEL_ID=$(echo $BODY | grep -o '"id":"[^"]*' | tail -n 1 | cut -d'"' -f4)
    if [ -z "$ORDER_TO_CANCEL_ID" ]; then
        echo -e "${RED}Failed to get order ID for cancellation${NC}"
        echo -e "${YELLOW}Response was: $BODY${NC}"
        exit 1
    else
        echo -e "${GREEN}Order to cancel ID: $ORDER_TO_CANCEL_ID${NC}"
    fi
else
    echo -e "${RED}Empty response when creating order to cancel${NC}"
    exit 1
fi

# 等待1秒确保订单创建完成
sleep 1

RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" -X DELETE $BASE_URL/api/orders/$ORDER_TO_CANCEL_ID)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
# 注意：取消订单返回204状态码
if [ "$HTTP_CODE" -eq 204 ]; then
    echo -e "${GREEN}Order cancelled successfully (204 No Content)${NC}"
else
    check_response "$BODY" "$HTTP_CODE"
fi

# 10. 测试无效订单ID
echo -e "\n${YELLOW}10. Test Invalid Order ID${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -H "Cookie: session=$CUSTOMER_SESSION" $BASE_URL/api/orders/invalid_id)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | sed '$d')
if [ "$HTTP_CODE" -eq 404 ]; then
    echo -e "${GREEN}Expected 404 error received${NC}"
else
    echo -e "${RED}Unexpected response for invalid order ID${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 11. 测试未授权访问
echo -e "\n${YELLOW}11. Test Unauthorized Access${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/orders \
  -H "Content-Type: application/json" \
  -d '{
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
if [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}Expected 401 error received${NC}"
else
    echo -e "${RED}Unexpected response for unauthorized access${NC}"
    check_response "$BODY" "$HTTP_CODE"
fi

# 清理 cookie 文件
rm -f customer_cookie.txt staff_cookie.txt

echo -e "\n${GREEN}Test Complete!${NC}" 