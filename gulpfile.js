const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');
const rename = require('gulp-rename');
const babel = require('gulp-babel');
const gulpif = require('gulp-if');
const cleancss = require('gulp-clean-css');

gulp.task('serve', function() {
    browsersync.init({
        server: {
            baseDir: "./"
        }
    });
});

gulp.task('reload', function () {
    browsersync.reload()
});

gulp.task('build', ['build:docs', 'build:dist'])

gulp.task('build:docs', function() {
    return gulp.src('index.html')
        .pipe(useref())
        .pipe(gulpif('patternlock.js', babel({presets: ['env']})))
        .pipe(gulp.dest('docs'))
})

gulp.task('build:dist', function() {
    return gulp.src('patternlock.*')
        .pipe(gulpif('*.js', babel({presets: ['env']})))
        .pipe(gulp.dest('dist'))
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', cleancss()))
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('dist'))
})

gulp.task('watch', function () {
    gulp.watch(['./*.html', './*.css', './*.js'], ['reload']);
});

gulp.task('default', ['serve', 'watch']);