# ncfx - for copy,backup,product project

copy some static file for build, or compress some project or directory to other directory as zip file.  
this repository base on ncp.

# 安装

安装在全局环境下即可，无需安装为项目依赖。

移除老版本:   
npm remove ncfx -g

安装最新版本:  
cnpm install ncfx -g
或
cnpm install ncfx@latest -g

# 功能介绍

|功能|名称|参数|
|----|----|----|
|copy|拷贝|目标路径，目的地址，过滤参数|
|zip|压缩|目标路径，目的地址，过滤参数|
|backup|备份|目标路径，目的地址，过滤参数|
|product|发布|目标路径，目的地址，过滤参数|
|merge|合并|目标路径，过滤参数|
|generate|生成文件|文件类型，文件名，文件路径|



## 测试案例
copy:
ncfx copy ./src ./build --f='!**/*.ts'
ncfx copy ./src ./build --f='!**/*.ts,!**/*.map'
ncfx copy ./src ./build --f='**/*.map'
ncfx copy ./src./build --f='**/repository/**,!**/*.ts'

zip
.ncfx zip
.ncfx zip D:\\temp

backup:
ncfx backup D:\\workflow D:\\backup

product:
ncfx product D:\\workflow D:\\product 

merge:
ncfx merge D:\\test\\package.json
ncfx merge D:\\test\\package.json --filter='!**/*.map'

generate
ncfx generate D:\\common index
ncfx generate class xx.ts



