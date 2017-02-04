"use strict";

var gulp = require('gulp'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
     del = require('del'),
     autoprefixer = require('gulp-autoprefixer'),
     browserSync = require('browser-sync').create(),
     htmlreplace = require('gulp-html-replace'),
     cssmin = require('gulp-cssmin');

gulp.task("concatScripts", function() {
    return gulp.src([
        'app/lib/js/jquery-2.2.1.min.js',
        'app/lib/js/tether.min.js',
        'app/lib/js/bootstrap.min.js',
        'app/lib/js/functions.js'
        ])
    .pipe(maps.init())
    .pipe(concat('main.js'))
    .pipe(maps.write('./'))
    .pipe(gulp.dest('app/lib/js'))
    .pipe(browserSync.stream());
});

gulp.task("minifyScripts", ["concatScripts"], function() {
  return gulp.src("app/lib/js/main.js")
    .pipe(uglify())
    .pipe(rename('main.min.js'))
    .pipe(gulp.dest('dist/lib/js'));
});

gulp.task('compileSass', function() {
  return gulp.src("app/lib/css/main.scss")
      .pipe(maps.init())
      .pipe(sass().on('error', sass.logError))
      .pipe(autoprefixer())
      .pipe(maps.write('./'))
      .pipe(gulp.dest('app/lib/css'))
      .pipe(browserSync.stream());
});

gulp.task("minifyCss", ["compileSass"], function() {
  return gulp.src("app/lib/css/main.css")
    .pipe(cssmin())
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest('dist/lib/css'));
});

gulp.task('watchFiles', function() {
  gulp.watch('app/lib/css/**/*.scss', ['compileSass']);
  gulp.watch('app/lib/js/*.js', ['concatScripts']);
})

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('clean', function() {
  del(['dist/lib', 'dist/*.html', 'dist/*.txt', 'dist/*.xml', 'dist/.htaccess', 'app/lib/css/main.css*', 'app/lib/js/main*.js*']);
});

gulp.task('renameSources', function() {
  return gulp.src(['app/index.html', 'app/404.html', 'app/robots.txt', 'app/.htaccess', 'app/browserconfig.xml'])
    .pipe(htmlreplace({
        'js': 'lib/js/main.min.js',
        'css': 'lib/css/main.min.css'
    }))
    .pipe(gulp.dest('dist/'));
});

gulp.task("build", ['minifyScripts', 'minifyCss'], function() {
  return gulp.src(['index.html', '404.html', 'robots.txt', '.htaccess', 'browserconfig.xml',
                   "app/lib/img/**", "app/lib/fonts/**"], { base: './app'})
            .pipe(gulp.dest('dist'));
});

gulp.task('serve', ['watchFiles'], function(){
    browserSync.init({
        server: "./app"
    });

    gulp.watch("app/*.html").on('change', browserSync.reload);
});

gulp.task("default", ["clean", 'build'], function() {
  gulp.start('renameSources');
});
