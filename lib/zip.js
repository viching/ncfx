const fs = require('fs'),
    path = require('path'),
    archiver = require('archiver');

module.exports = function zip(options, callback) {

    let cback = callback;

    let source, dest;
    switch (options.args.length) {
        case 0:
            source = "./"
            console.info(">> ncfx zip -> ncfx zip ./ [../prejectName.zip]");
            break;
        case 1:
            source = './';
            console.info(">> ncfx zip [dest] -> ncfx zip ./ [dest]");
            dest = options.args[0];
            break;
        default:
            source = options.args[0];
            dest = options.args[1];
            console.info(">> ncfx zip [source] [dest]");
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
    if (!dest.endsWith(".zip")) {
        let arr = currentPath.split(/\/|\\/g);
        let zipName = arr[arr.length - 1];
        zipName += ".zip";
        dest = path.resolve(dest, zipName);
    }

    try {
        startZip(currentPath, options.list, options.exclude);
        cback();
    } catch (e) {
        cback(e)
    }


    function startZip(source, list, exclude) {
        var archive = getArchive();
        var dirList = fs.readdirSync(source);
        dirList.forEach(function (item) {
            if (list) {
                let fr = list.find(c => c == item);
                if(!exclude && !fr || exclude && fr){
                    return;
                }
            }
            let stats = fs.statSync(path.join(source, item));
            if (stats.isDirectory()) {
                archive.directory(path.resolve(source, item) + '/', item);
            } else {
                archive.file(path.resolve(source, item), {name: item});
            }
        });
        archive.finalize();
    }

    function getArchive() {
        // 创建输出流
        var output = fs.createWriteStream(dest);
        var archive = archiver('zip', {
            zlib: {level: 9} // Sets the compression level.
        });

        // 监听完成事件
        output.on('close', function () {
            console.info((archive.pointer() / 1024 / 1024).toFixed(2) + 'M');
            console.info('目标项目压缩完成');
        });

        // 监听错误事件
        archive.on('error', function (err) {
            status = false;
            throw err;
        });

        // 建立输出管道
        archive.pipe(output);
        return archive;
    }
}


