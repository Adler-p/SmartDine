#!/bin/bash

# 设置测试会话ID和Redis键
TEST_SESSION_ID="test-session-123"
SESSION_KEY="session:$TEST_SESSION_ID"

# 创建测试会话数据
SESSION_DATA='{
  "role": "customer",
  "tableId": "test-table-1",
  "cart": []
}'

# 向Redis中添加测试会话数据
echo "Setting test session in Redis..."
docker exec -it smartdine-redis-1 redis-cli SET "$SESSION_KEY" "$SESSION_DATA" EX 900

echo "Test session initialized with ID: $TEST_SESSION_ID"
echo "Session will expire in 15 minutes." 