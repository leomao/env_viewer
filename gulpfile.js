const CONFIG = require('./config.js');
const path = require('path');
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const del = require('del');

function logError(err) {
  $.util.log($.util.colors.red('[Error]'), err.toString());
  this.emit('end');
}

gulp.task('client', () => {
  return gulp.src(CONFIG.client.src.all)
    .pipe(gulp.dest(CONFIG.client.dist.all))
});

let nodemon;
gulp.task('server:js', () => {
  return gulp.src(CONFIG.server.src.js)
    .pipe($.eslint())
    .pipe($.eslint.format())
    .pipe($.babel(CONFIG.server.babel))
    .on('error', logError)
    .pipe(gulp.dest(CONFIG.server.dist.js))
    .on('end', () => {
      if (nodemon)
        nodemon.emit('restart', 0.5);
    })
});

gulp.task('server', ['server:js'], (cb) => cb());

gulp.task('watch', ['client', 'server'], () => {
  gulp.watch(CONFIG.client.src.all, ['client']);
  gulp.watch(CONFIG.server.src.js, ['server:js']);
});

gulp.task('clean', () => {
  return del([CONFIG.dist]);
});

gulp.task('nodemon', (cb) => {
  let started = false;
  nodemon = $.nodemon({
    exec: 'cd ./dist && node',
    ext: 'js',
    script: 'server.js',
    watch: false,
  });
  return nodemon;
});

gulp.task('build', ['client', 'server'], (cb) => cb());

gulp.task('dev', ['build', 'watch', 'nodemon']);

gulp.task('default', ['build']);
