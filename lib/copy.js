const fs = require('fs'),
    path = require('path');

module.exports = function ncfx(source, dest, options, callback) {
    let cback = callback;

    if (!callback) {
        cback = options;
        options = {};
    }

    let basePath = process.cwd(),
        currentPath = path.resolve(basePath, source),
        targetPath = path.resolve(basePath, dest),
        filter = options.filter,
        rename = options.rename,
        transform = options.transform,
        clobber = options.clobber !== false,
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
        return getStats(source);
    }

    function getStats(source) {
        let stat = dereference ? fs.stat : fs.lstat;
        if (running >= limit) {
            return setImmediate(function () {
                console.log(running, limit, source);
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
            }
            else if (stats.isFile()) {
                if (filter) {
                    if (filter instanceof RegExp) {
                        if (!filter.test(source)) {
                            return;
                        }
                    }
                    else if (typeof filter === 'function') {
                        if (!filter(source)) {
                            return;
                        }
                    }
                }
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
        if (rename) {
            target = rename(target);
        }
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
            console.info("copy file task has been over!");
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


