const generateIndex = require("./gi");
const generateClass = require("./gc");

const fs = require('fs'),
    path = require('path');

module.exports = function generate(options, callback) {

    let source, target, fileName;
    switch (options.args.length) {
        case 0:
            target = "index";
            fileName = "index.ts";
            source = "./";
            console.info(">> ncfx generate -> ncfx generate index index.ts ./");
            break;
        case 1:
            target = options.args[0];
            fileName = "index.ts";
            source = "./";
            console.info(">> ncfx generate [target] -> ncfx generate [target] index.ts ./");
            break;
        case 2:
            target = options.args[0];
            fileName = options.args[1];
            source = "./";
            console.info(">> ncfx generate [target] [fileName] ./");
            break;
        default:
            target = options.args[0];
            fileName = options.args[1];
            source = options.args[2];
            console.info(">> ncfx generate [target] [fileName] [source]");
            break;
    }

    let basePath = process.cwd(),
        currentPath = path.resolve(basePath, source);

    if (!fs.existsSync(currentPath)) {
        throw new Error(`${currentPath} is not exists`);
    }

    try {
        if (target == "index" || target == "i") {
            generateIndex(currentPath, fileName);
        }

        if (target == "class" || target == "c") {
            if(fileName == 'index.ts'){
                throw new Error("fileName is needed");
            }
            generateClass(currentPath, fileName);
        }

        callback();
    } catch (e) {
        callback(e);
    }
}

