const fs = require('fs'),
    path = require('path');

/**
 * 读取文件内容
 * @param path
 * @returns {*}
 */
function readFile(path) {
    try {
        let data = fs.readFileSync(path);
        return data.toString('utf-8');
    } catch (e) {
        console.error("readFile: ", e);
    }
    return null;
}

function readJson(source) {
    try {
        let data = readFile(source);
        return JSON.parse(data);
    } catch (e) {
        console.error(e);
    }
    return null;
}

function writeFile(dest, content) {
    let opts = {
        encoding: 'utf8',
        stdio: [process.stdin, process.stdout, process.stderr]
    }
    fs.writeFileSync(dest, content, opts);
}

function mkdirs(dirname) {
    if (!fs.existsSync(dirname)) {
        // 判断上级目录是否存在
        if (mkdirs(path.dirname(dirname))) {
            fs.mkdirSync(dirname);
        } else {
            return false;
        }
    }
    return true;
}

function isArray(it) {
    return Object.prototype.toString.call(it) === '[object Array]';
}

/**
 * 版本比较（各个安装包的版本号）
 * @param preVersion
 * @param lastVersion
 * @returns {number}
 */
function versionStringCompare(preVersion = '', lastVersion = '') {
    preVersion = preVersion.replace(/[^0-9\.]/g, '');
    lastVersion = lastVersion.replace(/[^0-9\.]/g, '');
    let sources = preVersion.split('.');
    let dests = lastVersion.split('.');
    let maxL = Math.max(sources.length, dests.length);
    let result = 0;
    for (let i = 0; i < maxL; i++) {
        let preValue = sources.length > i ? sources[i] : 0;
        let preNum = isNaN(Number(preValue)) ? preValue.charCodeAt() : Number(preValue);
        let lastValue = dests.length > i ? dests[i] : 0;
        let lastNum = isNaN(Number(lastValue)) ? lastValue.charCodeAt() : Number(lastValue);
        if (preNum < lastNum) {
            result = -1;
            break;
        } else if (preNum > lastNum) {
            result = 1;
            break;
        }
    }
    return result;
}

/**
 * 删除文件夹
 * @param source
 */
function removeFolder(source) {
    if (fs.existsSync(source)) {
        const files = fs.readdirSync(source);//读取该文件夹
        files.forEach(function (file) {
            var stats = fs.statSync(path.join(source, file));
            if (stats.isDirectory()) {
                removeFolder(path.join(source, file));
            } else {
                // 删除文件
                fs.unlinkSync(path.join(source, file));
            }
        });
        // 已经清空文件夹，删除该目录
        fs.rmdirSync(source);
    }
}

function trim(str) {
    return str.replace(/(?:^[ \t\n\r]+)|(?:[ \t\n\r]+$)/g, '');
}

module.exports = {
    readFile, readJson, writeFile, mkdirs, removeFolder,
    isArray, trim,
    versionStringCompare
};