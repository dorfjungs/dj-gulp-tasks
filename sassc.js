const gulp = require('gulp');
const rename = require('gulp-rename');
const ignore = require('gulp-ignore');
const watch = require('gulp-watch');
const run = require('gulp-run');
const windows = /^win/.test(process.platform);
const pathSep = windows ? ';' : ':';

module.exports = {
    compile: (config, callback) => {
        setTimeout(() => {
            let promises = [];

            for (let i = 0, len = config.files.length; i < len; i++) {
                promises.push(new Promise((resolve, reject) => {
                    let files = config.files[i];
                    let paths = config.watch + (config.paths ? (pathSep + config.paths.join(pathSep)) : '');

                    if (windows) {
                        paths = paths.replace(/\.\//g, '');
                    }

                    let stream = gulp.src(files.entry)
                        .pipe(ignore.exclude('_*.scss'))
                        .pipe(ignore.exclude('**/_*.scss'))
                        .pipe(run('sassc -s -t compressed -I ' + paths, {verbosity: 1}))
                        .on('error', (err) => {stream.end()})
                        .pipe(rename((path) => { path.extname = ".css"; }))
                        .pipe(gulp.dest(files.output))
                        .on('finish', () => {setTimeout(resolve, 0);});
                }));
            }

            Promise.all(promises).then(() => callback ? callback() : {});
        }, !isNaN(config.timeout) ? config.timeout : 50);
    },
    watch: (config, callback) => {
        return watch(config.watch + '/**/*.scss', callback);
    }
};

/** @depcrecated */
module.exports.default = (config, optPostfix) => {
    var postfix = optPostfix ? ('-' + optPostfix) : '';

    gulp.task('dj-sassc-compile' + postfix, (callback) => {
        return module.exports.compile(config, callback);
    });

    gulp.task('dj-sassc-watch' + postfix, () => {
        return module.exports.watch(config, () => gulp.start('dj-sassc-compile' + postfix));
    });

    gulp.task('dj-sassc' + postfix, ['dj-sassc-watch' + postfix]);
};