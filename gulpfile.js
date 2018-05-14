'use strict';
 
const gulp = require('gulp');
const sass = require('gulp-sass');
const debug=require('gulp-debug');
var gzip = require('gulp-gzip');


gulp.task('sass',   () =>
   gulp.src('./src/index.scss')
     .pipe(sass().on('error', sass.logError))          
     .pipe(gulp.dest('./assets/bundle'))
  
);
 
gulp.task('sass:watch', function () {
  gulp.watch('./src/styles/**/*', ['sass']);
});

gulp.task('gzip',   () =>
gulp.src(['./assets/bundle/*.js','./assets/bundle/*.css'])
  .pipe(gzip())          
  .pipe(gulp.dest('./assets/bundle'))
);