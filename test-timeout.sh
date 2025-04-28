#!/bin/bash

# 设置超时时间（秒）
TIMEOUT=5

echo "Testing connection to cart service with ${TIMEOUT}s timeout..."

# 使用超时参数测试连接
timeout $TIMEOUT curl -v http://localhost:3004/test

# 检查退出状态
if [ $? -eq 124 ]; then
  echo "Connection timed out after ${TIMEOUT}s"
else
  echo "Connection completed with exit code $?"
fi 