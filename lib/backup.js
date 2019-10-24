const fs = require('fs'),
    path = require('path'),
    archiver = require('archiver');

module.exports = function ncfx(source, dest) {

    let basePath = process.cwd(),
        currentPath = path.resolve(basePath, source);

    // 创建输出流
    var output = fs.createWriteStream(getTargetPath());
    var archive = archiver('zip', {
        zlib: {level: 9} // Sets the compression level.
    });

    // 监听完成事件
    output.on('close', function () {
        console.info((archive.pointer() / 1024 / 1024).toFixed(2) + 'M');
        console.info('目标项目备份完成');
    });

    // 监听错误事件
    archive.on('error', function (err) {
        status = false;
        throw err;
    });

    // 建立输出管道
    archive.pipe(output);

    startBackup(currentPath);

    function getTargetPath() {
        let arr = currentPath.split(/\/|\\/g);
        let projectName = arr[arr.length - 1];
        let date = new Date();
        projectName += "_" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "." + date.getHours() + "-backup.zip";
        return path.resolve(dest, projectName);
    }

    function startBackup(source) {
        var dirList = fs.readdirSync(source);
        const map = {
            'src': {file: true, name: 'src'},
            'node_modules': {file: false, name: 'node_modules'},
            '.gitignore': {file: true, name: '.gitignore'},
            'package.json': {file: true, name: 'package.json'},
            'package-lock.json': {file: true, name: 'package-lock.json'},
            'tsconfig.json': {file: true, name: 'tsconfig.json'},
            'README.md': {file: true, name: 'README.md'}

        };
        dirList.forEach(function (item) {
            if (map[item] != undefined) {
                if (map[item].file) {
                    archive.file(path.resolve(source, item), {name: map[item].name});
                } else {
                    archive.directory(path.resolve(source, item) + '/', map[item].name);
                }
            }
        });
        archive.finalize();
    }
}


