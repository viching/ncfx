# ncfx - for copy,backup,publish project

copy some static file for build, or compress some project or directory to other directory as zip file.  
this repository base on ncp.

## Command Line usage

Usage is simple: `ncfx [source] [dest] [--operate=cp|bc|pb] [--limit=concurrency limit]
[--filter=filter] --stopOnErr`

soure: 源文件夹  
dest:目标文件夹或目标文件  
operate: 操作类型：cp 即 copy, bc 即 backup, pb 即 publish  
limit: 限制同时处理的最大文件数  
filter: ex_ 表示排除文件后缀, in_ 表示包含文件后缀， 后缀名条件在标识符后面用`_`隔开，如：ex_ts_json  
stopOnErr: 错误回调函数  

## Programmatic usage

```javascript
var ncfx = require('ncfx');

ncfx.copy(source, destination, function (err) {
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

## Test example
copy:
./bin/ncfx E:\\project-10-02\\viching-server-workflow\\build ./build --operate=cp --filter=ex_ts

backup:
./bin/ncfx E:\\project-10-02\\viching-server-workflow D:\\workspace-pool\\backup --operate=bc

publish:
./bin/ncfx E:\\project-10-02\\viching-server-workflow D:\\workspace-pool\\product --operate=pb



