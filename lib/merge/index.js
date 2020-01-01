const fs = require('fs'),
    path = require('path'),
    child_process = require('child_process'),
    copy = require('../copy');
const util = require("../util");

module.exports = function merge(options, callback) {

    let source, dest;
    switch (options.args.length) {
        case 0:
            source = "./"
            console.info(">> ncfx merge -> ncfx merge ./");
            break;
        case 1:
            console.info(">> ncfx merge [source] -> ncfx merge [source]");
            source = options.args[0];
            break;
        default:
            source = options.args[0];
            dest = options.args[1];
            console.info(">> ncfx merge [source] [dest]");
            break;
    }

    let basePath = process.cwd(),
        currentPath = path.resolve(basePath, source);

    if (!fs.existsSync(currentPath)) {
        throw new Error(`${currentPath} is not exists`);
    }

    const dependencies = {};
    const pack = util.readJson(currentPath);
    pack.dependencies = {};

    if(dest){
        pack.dest = dest;
    }
    if (!pack.dest) {
        pack.dest = path.resolve(currentPath, '../merge');
    }
    const depTarget = {}, projects = [];
    pack.servers.forEach(item => {
        if (item.source && fs.existsSync(`${item.source}/build/`)) {
            const pk = util.readJson(`${path.resolve(basePath, item.source)}/package.json`);
            if (pk) {
                if (pk.dependencies) {
                    Object.keys(pk.dependencies).forEach(function (key) {
                        let cur = pk.dependencies[key];
                        if (depTarget[key]) {
                            if (util.isArray(depTarget[key])) {
                                if (!depTarget[key].find(c => c.version == cur))
                                    depTarget[key].push({
                                        version: cur,
                                        path: `${item.source}`
                                    });
                            } else {
                                if (depTarget[key] != cur)
                                    depTarget[key] = [depTarget[key], {
                                        version: cur,
                                        path: `${item.source}`
                                    }];
                            }
                        } else {
                            depTarget[key] = {
                                version: cur,
                                path: `${item.source}`
                            };
                        }
                    });
                }
                projects.push({
                    name: item.name,
                    source: item.source,
                    dest: `${pack.dest}/${item.name}`
                })
            }
        }
    });

    // 判断主目录是否存在，不存在则创建
    if (!fs.existsSync(pack.dest)) {
        util.mkdirs(pack.dest);
    }

    // 第一步： 对于版本冲突的依赖，做出提醒，合并出最高版本
    Object.keys(depTarget).forEach(function (key) {
        if (typeof depTarget[key] !== 'string') {
            let max = {version: ''};
            if (util.isArray(depTarget[key])) {
                depTarget[key].forEach(item => {
                    if (util.versionStringCompare(max.version, item.version) < 0) {
                        max = item;
                    }
                })
                console.warn(`MERGE[${key}] version conflict: ${depTarget[key].version}, merge result: ${max.version}`);
            } else {
                max = depTarget[key];
            }

            depTarget[key] = max;
            dependencies[key] = max.version;
        }
    });

    // 第二步： 核心文件
    writeApp(`${pack.dest}`, projects);
    writePackage(`${pack.dest}`)

    // 第三步：server
    projects.forEach(item => {
        if (fs.existsSync(path.join(pack.dest, item.name))) {
            util.removeFolder(path.join(pack.dest, item.name));
            console.info(`MERGE[server] begin coverage server: ${path.join(pack.dest, item.name)}/`);
        }
        copy(Object.assign({}, options, {args: [path.join(item.source, 'build'), path.join(pack.dest, item.name)]}), callback);
    })

    // 第四步：主进程的依赖包：child_process
    if (!fs.existsSync(path.join(`${pack.dest}`, 'node_modules/child_process'))) {
        child_process.exec(
            `npm install --prefix ${pack.dest} child_process@1.0.2 --save`,
            function (error, stdout, stderr) {
                if (error !== null) {
                    console.error('exec error: ' + error);
                }
                console.info(`npm install --prefix ${pack.dest} child_process --save`);
            }
        );
    }

    // 第五步：移动node_modules
    Object.keys(depTarget).forEach(function (key) {
        copyModule(depTarget[key].path, pack.dest, key);
    });

    function copyModule(root, dest, key) {
        if (fs.existsSync(`${root}/node_modules/${key}/`) && !fs.existsSync(`${dest}/node_modules/${key}/`)) {
            console.info(root, dest, key);
            copy(Object.assign({}, options, {args: [`${root}/node_modules/${key}/`, `${dest}/node_modules/${key}/`]}));
        }
        // 若该包也有依赖，仍然需要对其进行复制
        if (fs.existsSync(`${root}/node_modules/${key}/package.json`)) {
            const pk = util.readJson(`${root}/node_modules/${key}/package.json`);
            if (pk && pk.dependencies) {
                const deps = Object.assign(pk.dependencies, pk._phantomChildren || {}, pk.peerDependencies || {});
                Object.keys(deps).forEach(function (key2) {
                    copyModule(root, dest, key2);
                });
            }
        }
    }


    function writeApp(dest, projects) {
        const arr = ['app.js', 'README.md', 'start.bat', 'start.sh', 'shutdown.sh', 'site-start.sh', 'site-shutdown.sh'];
        arr.forEach(item => {
            let result = util.readFile(path.resolve(__dirname, `./spare/${item}`));
            if (item == 'app.js') {
                const contents = [];
                projects.forEach(item => {
                    const cur = {
                        name: item.name,
                        path: `./${item.name}/app.js`
                    };
                    contents.push(JSON.stringify(cur))
                })
                result = result.replace("const appsPath = [];", `const appsPath = [${contents.join(', ')}];`);
            }
            util.writeFile(path.resolve(dest, item), result)
        })
    }

    function writePackage(dest){
        dependencies["child_process"] = "1.0.2";
        // package.json
        pack.dependencies = dependencies;
        result = JSON.stringify(pack, "", "  ")
        util.writeFile(path.resolve(dest, "package.json"), result);
    }
}


