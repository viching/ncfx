const fs = require('fs'),
    path = require('path');

module.exports = function copy(options, callback) {
    let cback = callback;

    let source, dest;
    switch (options.args.length) {
        case 0:
            console.error(">> 至少需要一个目标地址: ncfx copy [dest]");
            return;
        case 1:
            source = "./";
            console.info(">> ncfx copy [dest] -> ncfx copy ./ [dest]");
            dest = options.args[0];
            break;
        default:
            source = options.args[0];
            dest = options.args[1];
            console.info(">> ncfx copy [source] [dest]");
            break;
    }

    if (!callback) {
        cback = options.callback || function(){};
    }

    let basePath = process.cwd(),
        currentPath = path.resolve(basePath, source),
        targetPath = path.resolve(basePath, dest),
        transform = options.transform,
        clobber = true,
        modified = options.modified,
        dereference = options.dereference,
        errs = null,
        started = 0,
        finished = 0,
        running = 0,
        limit = options.limit || 16;

    limit = (limit < 1) ? 1 : (limit > 512) ? 512 : limit;

    startCopy(currentPath);

    function startCopy(source) {
        if (!fs.existsSync(currentPath)) {
            console.error(`'${currentPath}' is not exists`);
            return;
        }
        return getStats(source);
    }

    function getStats(source) {
        let stat = dereference ? fs.stat : fs.lstat;
        if (running >= limit) {
            return setImmediate(function () {
                getStats(source);
            });
        }
        stat(source, function (err, stats) {
            let item = {};
            if (err) {
                return onError(err);
            }

            // We need to get the mode from the stats object and preserve it.
            item.name = source;
            item.mode = stats.mode;
            item.mtime = stats.mtime; //modified time
            item.atime = stats.atime; //access time

            if (stats.isDirectory()) {
                // 存在文件时才开始创建目录，否则不创建
                return copyDir(item.name);
            } else if (stats.isFile()) {
                if (options.filter && !options.filter(source)) {
                    return;
                }
                // console.info("copy: ", source)
                started++;
                running++;
                return onFile(item);
            }
            else if (stats.isSymbolicLink()) {
                // Symlinks don't really need to know about the mode.
                return onLink(source);
            }
        });
    }

    function onFile(file) {
        let target = file.name.replace(currentPath, targetPath);
        // 创建多级目录
        mkdirs(path.dirname(target));
        isWritable(target, function (writable) {
            if (writable) {
                return copyFile(file, target);
            }
            if (clobber) {
                rmFile(target, function () {
                    copyFile(file, target);
                });
            }
            if (modified) {
                let stat = dereference ? fs.stat : fs.lstat;
                stat(target, function (err, stats) {
                    //if souce modified time greater to target modified time copy file
                    if (file.mtime.getTime() > stats.mtime.getTime())
                        copyFile(file, target);
                    else return cb();
                });
            }
            else {
                return cb();
            }
        });
    }

    function copyFile(file, target) {
        let readStream = fs.createReadStream(file.name),
            writeStream = fs.createWriteStream(target, {mode: file.mode});

        readStream.on('error', onError);
        writeStream.on('error', onError);

        if (transform) {
            transform(readStream, writeStream, file);
        } else {
            writeStream.on('open', function () {
                readStream.pipe(writeStream);
            });
        }
        writeStream.once('finish', function () {
            // console.log(`COPY[finished]`, source, target);
            if (modified) {
                //target file modified date sync.
                fs.utimesSync(target, file.atime, file.mtime);
                cb();
            }
            else cb();
        });
    }

    function rmFile(file, done) {
        fs.unlink(file, function (err) {
            if (err) {
                return onError(err);
            }
            return done();
        });
    }

    function copyDir(dir) {
        fs.readdir(dir, function (err, items) {
            if (err) {
                return onError(err);
            }
            items.forEach(function (item) {
                startCopy(path.join(dir, item));
            });
            return cb();
        });
    }

    function onLink(link) {
        let target = link.replace(currentPath, targetPath);
        fs.readlink(link, function (err, resolvedPath) {
            if (err) {
                return onError(err);
            }
            checkLink(resolvedPath, target);
        });
    }

    function checkLink(resolvedPath, target) {
        if (dereference) {
            resolvedPath = path.resolve(basePath, resolvedPath);
        }
        isWritable(target, function (writable) {
            if (writable) {
                return makeLink(resolvedPath, target);
            }
            fs.readlink(target, function (err, targetDest) {
                if (err) {
                    return onError(err);
                }
                if (dereference) {
                    targetDest = path.resolve(basePath, targetDest);
                }
                if (targetDest === resolvedPath) {
                    return cb();
                }
                return rmFile(target, function () {
                    makeLink(resolvedPath, target);
                });
            });
        });
    }

    function makeLink(linkPath, target) {
        fs.symlink(linkPath, target, function (err) {
            if (err) {
                return onError(err);
            }
            return cb();
        });
    }

    function isWritable(path, done) {
        fs.lstat(path, function (err) {
            if (err) {
                if (err.code === 'ENOENT') return done(true);
                return done(false);
            }
            return done(false);
        });
    }

    function onError(err) {
        if (options.stopOnError) {
            return cback(err);
        }
        else if (!errs && options.errs) {
            errs = fs.createWriteStream(options.errs);
        }
        else if (!errs) {
            errs = [];
        }
        if (typeof errs.write === 'undefined') {
            errs.push(err);
        }
        else {
            errs.write(err.stack + '\n\n');
        }
        return cb();
    }

    function cb(skipped) {
        if (!skipped) running--;
        finished++;
        if ((started === finished) && (running === 0)) {
            if (cback !== undefined) {
                return errs ? cback(errs) : cback(null);
            }
        }
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
}


