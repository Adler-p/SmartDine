#!/bin/bash

# 设置 API 基础 URL
BASE_URL="http://localhost:3000"

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# 生成随机邮箱
RANDOM_EMAIL="test_$(date +%s)@test.com"

echo "Testing Auth Service API..."
echo "-------------------------"

# 1. 测试注册
echo -e "\n${GREEN}1. Testing User Signup${NC}"
SIGNUP_RESPONSE=$(curl -s -c cookie.txt -X POST $BASE_URL/api/users/signup \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password\",
    \"name\": \"Test User\",
    \"role\": \"customer\"
  }")
echo "Response: $SIGNUP_RESPONSE"

# 2. 测试登录
echo -e "\n${GREEN}2. Testing User Signin${NC}"
SIGNIN_RESPONSE=$(curl -s -b cookie.txt -c cookie.txt -X POST $BASE_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RANDOM_EMAIL\",
    \"password\": \"password\"
  }")
echo "Response: $SIGNIN_RESPONSE"

# 3. 测试获取当前用户
echo -e "\n${GREEN}3. Testing Get Current User${NC}"
CURRENT_USER_RESPONSE=$(curl -s -b cookie.txt $BASE_URL/api/users/currentuser)
echo "Response: $CURRENT_USER_RESPONSE"

# 4. 测试登出
echo -e "\n${GREEN}4. Testing Signout${NC}"
SIGNOUT_RESPONSE=$(curl -s -b cookie.txt -X POST $BASE_URL/api/users/signout)
echo "Response: $SIGNOUT_RESPONSE"

# 5. 验证登出后获取当前用户
echo -e "\n${GREEN}5. Verifying Current User After Signout${NC}"
VERIFY_RESPONSE=$(curl -s -b cookie.txt $BASE_URL/api/users/currentuser)
echo "Response: $VERIFY_RESPONSE"

# 6. 测试无效登录
echo -e "\n${GREEN}6. Testing Invalid Login${NC}"
INVALID_LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/users/signin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nonexistent@test.com",
    "password": "wrongpassword"
  }')
echo "Response: $INVALID_LOGIN_RESPONSE"

# 清理 cookie 文件
rm -f cookie.txt 