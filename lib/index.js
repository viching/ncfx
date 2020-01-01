const copy = require('../lib/copy');
const zip = require('../lib/zip');
const backup = require('../lib/backup');
const product = require('./product');
const merge = require('../lib/merge');
const generate = require('../lib/generate');

module.exports = {
    copy,
    c: copy,
    zip,
    z: zip,
    backup,
    b: backup,
    product,
    p: product,
    merge,
    m: merge,
    generate,
    g: generate
};