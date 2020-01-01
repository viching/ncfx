const fs = require('fs'),
    path = require('path'),
    zip = require('./zip');

module.exports = function product(options, callback) {

    let cback = callback;

    let source, dest;
    switch (options.args.length) {
        case 0:
            source = "./"
            console.info(">> ncfx product -> ncfx product ./ ../");
            break;
        case 1:
            source = './';
            console.info(">> ncfx product [dest] -> ncfx product ./ [dest]");
            dest = options.args[0];
            break;
        default:
            source = options.args[0];
            dest = options.args[1];
            console.info(">> ncfx product [source] [dest]");
            break;
    }

    if (!callback) {
        cback = options.callback || function () {
        };
    }

    let basePath = process.cwd(),
        currentPath = path.resolve(basePath, source)
    if (!dest) {
        dest = path.resolve(currentPath, "../");
    }
    let targetPath = getTargetPath();
    if (!options.list) {
        options.list = [
            'build',
            'dist',
            'node_modules',
            'package.json',
            'README.md'
        ];
    }

    try {
        zip(Object.assign({}, options, {args: [currentPath, targetPath]}));
        cback();
    } catch (e) {
        cback(e)
    }

    function getTargetPath() {
        let arr = currentPath.split(/\/|\\/g);
        let projectName = arr[arr.length - 1];
        let date = new Date();
        projectName += "_" + date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + "." + date.getHours() + "-release.zip";
        return path.resolve(dest, projectName);
    }
}


