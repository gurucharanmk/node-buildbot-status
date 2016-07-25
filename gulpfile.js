const gulp = require('gulp');
const eslint = require('gulp-eslint');
const excludeGitignore = require('gulp-exclude-gitignore');

const del = require('del');
const babel = require('gulp-babel');

const path = require('path');
const nsp = require('gulp-nsp');

const mocha = require('gulp-mocha');
// const util = require('gulp-util');

const istanbul = require('gulp-istanbul');
const isparta = require('isparta');


// Initialize the babel transpiler so ES2015/ES6 files gets compiled on runtime
// Used only for development purpose
require('babel-register');

gulp.task('lint', () => {
  gulp.src('**/*.js')
    // ESLint ignores files with "node_modules" and other path mentioned in .gitignore files.
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


gulp.task('babel', ['clean'], () => {
  gulp.src('lib/**/*.js')
    .pipe(babel())
    .pipe(gulp.dest('src'));
});

gulp.task('clean', () => {
  del('src');
});

// gulp.task('test', function() {
//    return gulp.src(['test/**/*.js'])
//        .pipe(mocha({
//            compilers: {
//                js: babel
//            }
//        }));
// });


gulp.task('pre-test', () => {
  gulp.src(['lib/**/*.js'])
    .pipe(excludeGitignore())
    // Covering files
    .pipe(istanbul({
      includeUntested: true,
      instrumenter: isparta.Instrumenter,
    }))
    // Force `require` to return covered files
    .pipe(istanbul.hookRequire());
});

gulp.task('test', ['pre-test'], () => {
  gulp.src(['test/*.js'])
    .pipe(mocha())
    // Creating the reports after tests ran
    .pipe(istanbul.writeReports())
    // Enforce a coverage of at least 90%
    .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } }));
});

gulp.task('nsp', (cb) => {
  nsp({ package: path.resolve('package.json') }, cb);
});

// Watch Files For Changes
gulp.task('watch', () => {
  gulp.watch(['lib/**/*.js', 'test/**'], ['lint']);
  // gulp.watch('scss/*.scss', ['sass']);
});

gulp.task('prepublish', ['nsp', 'babel']);

gulp.task('default', ['lint', 'test'], () => {
    // This will only run if the lint task is successful...
});
