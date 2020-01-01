#!/bin/bash
# 查询主进程
mainId=$(ps -ef | grep ' dist/server.js' | grep -v grep | awk '{print $2}')

if [ -n "$mainId" ]; then
    echo "node max-old-space-size=2048 dist/server.js 已经在运行"
else
    # 清理日志
    rm -rf ./dist/site.log ./dist/err.log
    # 启动服务
    forever start -o ./dist/site.log -e ./dist/err.log  -a -n --max-old-space-size=2048 dist/server.js  &tail -f site.log
fi
