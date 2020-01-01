#!/bin/bash
# 查询主进程
mainId=$(ps -ef | grep 'node --max-old-space-size=1024 ./app.js' | grep -v grep | awk '{print $2}')

if [ -n "$mainId" ]; then
    echo "node --max-old-space-size=1024 ./app.js 已经在运行"
else
    # 清理日志
    find ./logs/ -mtime +2 -exec rm -rf {} \;
    # 需要加上这一行，否则nouhup不生效，原因是：找不到环境变量，所以先source一下
    source /etc/profile
    # 启动服务
    node --max-old-space-size=1024 ./app.js >/dev/null 2>&1 &
fi