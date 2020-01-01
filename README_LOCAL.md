# ncfx - for copy,backup,product project

copy some static file for build, or compress some project or directory to other directory as zip file.
this repository base on ncp.

# install

remove old version:
npm remove ncfx --save

install latest version:
cnpm install ncfx@latest --save --by=npm

install global(全局安装的时候可能会因为发布时依赖还未安装完全而导致失败):
cnpm install ncfx@latest -g --by=npm

## Test example
copy:
./bin/ncfx copy E:\\project-ts\\viching-server-workflow\\build ./build --f='!**/*.ts'
./bin/ncfx copy E:\\project-ts\\viching-server-workflow\\build ./build --f='!**/*.ts,!**/*.map'
./bin/ncfx copy E:\\project-ts\\viching-server-workflow\\build ./build --f='**/*.map'
./bin/ncfx copy E:\\project-ts\\viching-server-workflow\\build ./build --f='**/repository/**,!**/*.ts'

zip
./bin/ncfx zip
./bin/ncfx zip D:\\workspace-pool\\product\\server

backup:
./bin/ncfx backup D:\\workspace\\project-10-02\\viching-server-workflow D:\\workspace-pool\\backup

product:
./bin/ncfx product D:\\workspace\\project-10-02\\viching-server-workflow D:\\workspace-pool\\product

merge:
./bin/ncfx merge D:\\workspace\\project-10-02\\ncfx\\test\\package.json
./bin/ncfx merge D:\\workspace\\project-10-02\\ncfx\\test\\package.json --filter='!**/*.map'

generate
./bin/ncfx generate D:\\workspace-pool\\product\\common index
./bin/ncfx generate class file-name.service.ts



