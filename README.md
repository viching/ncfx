# ncfx - Asynchronous recursive file & directory copying

[![Build Status](https://secure.travis-ci.org/AvianFlu/ncfx.png)](http://travis-ci.org/AvianFlu/ncfx)

Think `cp -r`, but pure node, and asynchronous.  `ncfx` can be used both as a CLI tool and programmatically.

## Command Line usage

Usage is simple: `ncfx [source] [dest] [--operate=cp|bc|pb] [--limit=concurrency limit]
[--filter=filter] --stopOnErr`

The 'filter' is a Regular Expression - matched files will be copied.

The 'concurrency limit' is an integer that represents how many pending file system requests `ncfx` has at a time.

'stoponerr' is a boolean flag that will tell `ncfx` to stop immediately if any
errors arise, rather than attempting to continue while logging errors. The default behavior is to complete as many copies as possible, logging errors along the way.

If there are no errors, `ncfx` will output `done.` when complete.  If there are errors, the error messages will be logged to `stdout` and to `./ncfx-debug.log`, and the copy operation will attempt to continue.

## Programmatic usage

Programmatic usage of `ncfx` is just as simple.  The only argument to the completion callback is a possible error.  

```javascript
var ncfx = require('ncfx').ncfx;

ncfx.limit = 16;

ncfx(source, destination, function (err) {
 if (err) {
   return console.error(err);
 }
 console.log('done!');
});
```

You can also call ncfx like `ncfx(source, destination, options, callback)`. 
`options` should be a dictionary. Currently, such options are available:

  * `options.operate` - use `cp`,`bc` or `pb`, for copy,backup and pblish.
  
  * `options.filter` - a `RegExp` instance, against which each file name is
    tested to determine whether to copy it or not, or a function taking single
    parameter: copied file name, returning `true` or `false`, determining
    whether to copy file or not.

  * `options.transform` - a function: `function (read, write) { read.pipe(write) }`
  used to apply streaming transforms while copying.

  * `options.clobber` - boolean=true. if set to false, `ncfx` will not overwrite 
  destination files that already exist.

  * `options.dereference` - boolean=false. If set to true, `ncfx` will follow symbolic
  links. For example, a symlink in the source tree pointing to a regular file
  will become a regular file in the destination tree. Broken symlinks will result in
  errors.

  * `options.stopOnErr` - boolean=false.  If set to true, `ncfx` will behave like `cp -r`,
  and stop on the first error it encounters. By default, `ncfx` continues copying, logging all
  errors and returning an array.

  * `options.errs` - stream. If `options.stopOnErr` is `false`, a stream can be provided, and errors will be written to this stream.

Please open an issue if any bugs arise.  As always, I accept (working) pull requests, and refunds are available at `/dev/null`.


该正则表达式不能生效：
./bin/ncfx ./lib ./build --filter=^((?!\\.ts$).)*$

常见的一些特殊字符
* 任意个任意字符
? 一个任意字符
[..] []中的任意一个字符,这里也类似于正则表达式,中括号内可以是具体的一些字符,如[abcd]也可以是用-指定的一个范围,如[a-d]
# 注释
(空格) 参数分隔符
cmd 命令替换
| 管道
& 后台执行
; 命令分隔符(可以在同一行执行两个命令,用;分割)
~ 用户home目录

转义:
./bin/ncfx ./lib ./build --filter=^\(\(\?\!\\.ts$\).\)\*\$

./bin/ncfx ./lib ./build --filter=^\(\(\?\!\\.ts$\).\)\*$

// 包含
./bin/ncfx ./lib ./build --filter=in_js
// 排除
./bin/ncfx ./lib ./build --filter=ex_ts

copy:
./bin/ncfx E:\\project-10-02\\viching-server-workflow\\build ./build --operate=cp --filter=ex_ts

backup:
./bin/ncfx E:\\project-10-02\\viching-server-workflow D:\\workspace-pool\\backup --operate=bc

publish:
./bin/ncfx E:\\project-10-02\\viching-server-workflow D:\\workspace-pool\\product --operate=pb



