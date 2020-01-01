const path = require("path");
const log4js = require("log4js");
const spawn = require('child_process').spawn;

//保存被子进程实例数组
const workers = {};

//这里的子进程理论上可以无限多
const appsPath = [];


class Thread {
    static createWorker(app) {
        if (!app || !app.name || !app.path) {
            return;
        }
        const logger = log4js.getLogger(app.name);
        //保存spawn返回的进程实例
        let worker = spawn('node', [app.path]);

        //监听子进程exit事件
        worker.on('exit', function (code) {
            if (code != 0) {
                logger.info(worker)
                logger.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                logger.info('worker pid:' + worker.pid + ', path "' + app.path + '" exited');
                logger.info(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
                delete workers[worker.pid];
                Thread.createWorker(app);
            }
        });
        workers[worker.pid] = worker;
        logger.info('create worker:' + worker.pid + ', path "' + app.path + '" start success');

        worker.stdout.on('data', (data) => {
            logger.info(data.toString());
        });

        worker.stderr.on('data', (data) => {
            logger.info(data.toString());
        });
    }

    static async start() {
        //启动所有子进程
        for (let i = appsPath.length - 1; i >= 0; i--) {
            await Thread.sleep(300); // 间隔300毫秒
            appsPath[i].path = path.resolve(__dirname, appsPath[i].path);
            Thread.createWorker(appsPath[i]);
        }
    }

    /**
     * 异步延迟
     * @param {number} time 延迟的时间,单位毫秒
     */
    static sleep(time = 0) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, time);
        })
    };


    /**
     *
     * @param options
     * option.filename
     * option.level
     * @returns {any}
     */
    static initHttpLog(options) {
        const config = {
            appenders: {
                CONSOLE: {type: 'console'},
                FILE: {
                    type: 'dateFile',
                    filename: 'default',
                    pattern: 'yyyy-MM-dd.log',
                    maxLogSize: 104800,
                    maxLogSize: 10 * 1000 * 1000,
                    numBackups: 3,
                    alwaysIncludePattern: true
                }
            },
            categories: {
                default: {appenders: ['CONSOLE', 'FILE'], level: 'debug'}
            },
            replaceConsole: true
        };
        if (options.filename) {
            config.appenders.FILE.filename = options.filename;
        }
        log4js.configure(config);
        let logger = log4js.getLogger('CONSOLE');
        let level = log4js.levels.DEBUG;
        if (options) {
            logger = log4js.getLogger('REQUEST');
            if (options.level) {
                level = log4js.levels[options.level.toUpperCase()]
            }
        }
        return log4js.connectLogger(logger, {level})
    }
}

Thread.initHttpLog({filename: path.join(__dirname, './logs/server'), type: "file", level: "info"})
Thread.start().then(() => {
    //父进程退出时杀死所有子进程
    process.on('exit', function () {
        for (let pid in workers) {
            workers[pid].kill('SIGHUP');
        }
    });
});
