var gulp = require('gulp');
var eslint = require('gulp-eslint');
var excludeGitignore = require('gulp-exclude-gitignore');

var del = require('del');
var babel = require('gulp-babel');

var path = require('path');
var nsp = require('gulp-nsp');

var mocha = require('gulp-mocha');
var util = require('gulp-util');

var istanbul = require('gulp-istanbul');
var isparta = require('isparta');


// Initialize the babel transpiler so ES2015/ES6 files gets compiled on runtime
//Used only for development purpose
require('babel-register');

gulp.task('lint', function () {
  return gulp.src('**/*.js')
    //ESLint ignores files with "node_modules" and other path mentioned in .gitignore files.
    .pipe(excludeGitignore())
    // eslint() attaches the lint output to the "eslint" property
    // of the file object so it can be used by other modules.
    .pipe(eslint())
    // eslint.format() outputs the lint results to the console.
    // Alternatively use eslint.formatEach() (see Docs of gulp-eslint).
    .pipe(eslint.format())
    // To have the process exit with an error code (1) on
    // lint error, return the stream and pipe to failAfterError last.
    .pipe(eslint.failAfterError());
});


gulp.task('babel', ['clean'], function () {
  return gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('src'));
});

gulp.task('clean', function () {
  return del('src');
});

//gulp.task('test', function() {
//    return gulp.src(['test/**/*.js'])
//        .pipe(mocha({
//            compilers: {
//                js: babel
//            }
//        }));
//});


gulp.task('pre-test', function () {
  return gulp.src(['lib/**/*.js'])
    .pipe(excludeGitignore())
    // Covering files
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter
    }))
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], function () {
  return gulp.src(['test/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('nsp', function (cb) {
  nsp({package: path.resolve('package.json')}, cb);
});

// Watch Files For Changes
gulp.task('watch', function() {
    gulp.watch(['lib/**/*.js', 'test/**'], ['lint']);
});

gulp.task('prepublish', ['nsp', 'babel']);

gulp.task('default', ['lint', 'test'], function () {
    // This will only run if the lint task is successful...
});
