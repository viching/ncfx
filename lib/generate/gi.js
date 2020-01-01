const fs = require('fs'),
    path = require('path');
const util = require("../util");

module.exports = function generateIndex(currentPath, fileName) {

    const results = readFiles(currentPath, true);

    const indexContent = {
        importPart: [],
        exportPart: []
    };

    results.forEach(result => {
        let path = result.source.replace(currentPath, ".").replace(/\\/g, "/");
        path = path.substring(0, path.length - ".ts".length);
        if (path !== "./") {
            indexContent.importPart.push(`import {${result.targets.join(", ")}} from '${path}';`);
        }
        indexContent.exportPart.push(...result.targets);
    })

    let content = indexContent.importPart.join("\r\n");
    content += "\r\n\r\n\r\n";

    // 升序排序
    indexContent.exportPart.sort(function (a, b) {
        return a.localeCompare(b)
    });
    content += `export {${"\r\n"}  ${indexContent.exportPart.join(", ")}${"\r\n"}}`;
    util.writeFile(path.join(currentPath, fileName), content);

    function readFiles(source, root) {
        const results = [];
        if (fs.existsSync(source)) {
            const files = fs.readdirSync(source);//读取该文件夹
            if (!root) {
                // 查询是否有index.ts
                let index;
                files.forEach(function (file) {
                    if (file == 'index.ts') {
                        index = file;
                    }
                });
                if (index) {
                    let childs = readIndex(source);
                    results.push(...childs);
                    return results;
                }
            }
            files.forEach(function (file) {
                let stats = fs.statSync(path.join(source, file));
                if (stats.isDirectory()) {
                    let childs = readFiles(path.join(source, file), false);
                    if (childs && childs.length) {
                        results.push(...childs);
                    }
                } else if (file.endsWith(".ts")) {
                    if (!root || root && file != 'index.ts') {
                        let child = readExport(path.join(source, file));
                        child && results.push(child);
                    }
                }
            });
        }
        return results;
    }

    function readIndex(source) {
        const content = util.readFile(path.join(source, 'index.ts'));
        if (content == null) {
            return null;
        }
        const requires = [];
        // 查找requires: import {coreConfig} from "../config/core";
        content.replace(/import([ ]+){([ \n\r]+)?([a-zA-Z0-9_\$, ]+)([ \n\r]+)?}([ ]+)from([ ]+)['"](.+)['"]/g, function () {
            if (arguments[7] && arguments[7].startsWith("./")) {
                let targets = [], _source = path.resolve(source, arguments[7] + ".ts");
                let cur = arguments[3];
                if (cur) {
                    cur = cur.split(",");
                    cur.forEach(item => targets.push(util.trim(item)));
                }
                requires.push({
                    source: _source,
                    targets
                })
            }
        })
        return requires;
    }

    function readExport(source) {
        const content = util.readFile(source);
        if (content == null) {
            return null;
        }
        const targets = [];

        // export default expression;
        // export default function (…) { … } // also class, function*
        // export default function name1(…) { … } // also class, function*
        // export { name1 as default, … };
        // export * from …;

        // 第一种：export const name = {};
        content.replace(/export([ ]+)const([ ]+)([a-zA-Z0-9_\$]+)([ ]+)?=([ ]+)?/g, function () {
            arguments[3] && targets.push(util.trim(arguments[3]));
        })

        // 第二种：export {};
        content.replace(/export([ ]+){([ \n\r]+)?([a-zA-Z0-9_\$, ]+)([ \n\r]+)?}([ ]+)?/g, function () {
            let cur = arguments[3];
            if (cur) {
                cur = cur.split(",");
                cur.forEach(item => targets.push(util.trim(item)));
            }
        })

        // 第三种：export abstract? class|interface|function name
        content.replace(/export([ ]+)(abstract([ ]+))?(class|interface|function)([ ]+)([a-zA-Z0-9_\$]+)([ ]+)?/g, function () {
            arguments[6] && targets.push(util.trim(arguments[6]));
        })

        // 升序排序
        targets.sort(function (a, b) {
            return a.localeCompare(b)
        });

        return {
            source,
            targets
        }
    }
}