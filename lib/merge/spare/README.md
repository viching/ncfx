

### 启动前端：

forever start -l site.log -a --max-old-space-size=2048 dist/server.js  &tail -f site.log

### 运行后台：

### 删除两天前的日志
find ./logs/ -mtime +2 -exec rm -rf {} \;

### 清理缓存
echo 3 > /proc/sys/vm/drop_caches \;

### 启动后台服务(命令已经封装为shell)
./start.sh

### 关闭后台服务（命令已经封装为shell）
./shutdown.sh

## 自动重启(解决频繁崩溃问题)
npm install forever -g

核心内容：forever start -l site.log -a --max-old-space-size=2048 dist/server.js  &tail -f site.log

### 启动前端服务(命令已经封装为shell)
./site-start.sh

### 关闭前端服务（命令已经封装为shell）
./site-shutdown.sh

## 错误处理

如运行start.sh,但是一直提示文件中有\r存在($’\r’:command not found,).

方法一：需要通过以下命令进行修改：
打开：vi start.sh
输入：:set fileformat=unix 
回车后保存退出：:wq

方法二：
执行：dos2unix start.sh




