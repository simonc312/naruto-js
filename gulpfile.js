var gulp = require("gulp");
var sourcemaps = require("gulp-sourcemaps");
var browserify = require("browserify");
var babelify = require("babelify");
var source = require("vinyl-source-stream");
var buffer = require('vinyl-buffer');
var uglify = require("gulp-uglify");
var livereload = require("gulp-livereload");

var path = {
  "watch" : "./src/js/*.js",
  "src" : "./src/js/gameScript.js",
  "build" : "build.js",
  "dist" : "./js"
};

gulp.task("build", function () {
  return browserify({entries: path.src, debug: true})
        .transform("babelify", { presets: ["es2015"] })
        .bundle()
        .pipe(source(path.build))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(gulp.dest(path.dist))
        .pipe(livereload());
});

gulp.task("watch", ["build"], function () {
  livereload.listen();
  gulp.watch(path.watch, ["build"]);
});

gulp.task("default", ["build", "watch"]);
