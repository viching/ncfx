#!/bin/bash
# 查询主进程
mainId=$(ps -ef | grep ' dist/server.js' | grep -v grep | awk '{print $2}')

if [ -n "$mainId" ]; then

    # 查主进程的进程树
    ptree=`pstree -apnh ${mainId}`

    # 获取所有进程PID
    pids=`echo $ptree | awk 'BEGIN{ FS="node," ; RS=" " } NF>1 { print $NF }'`
    # 开始关闭所有进程（主进程在进程表的第一个）
    for pid in $pids
        do
            echo ">>> 主进程：$mainId， 当前关闭：kill -9 ${pid}"
            kill -9 ${pid}
        done
fi

echo -en ">>> 关闭完成\n\n"