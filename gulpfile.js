const gulp = require('gulp');
const browsersync = require('browser-sync').create();
const uglify = require('gulp-uglify');
const useref = require('gulp-useref');

const OUT = './www';

gulp.task('serve', function() {
    browsersync.init({
        server: {
            baseDir: "./docs"
        }
    });
});

gulp.task('reload', function () {
    browsersync.reload()
});

gulp.task('build', function() {
    return gulp.src('index.html')
        .pipe(useref())
        .pipe(gulp.dest('docs'))
        .pipe(browsersync.reload({stream: true}))
})

gulp.task('watch', function () {
    gulp.watch(['./*.html', './*.css', './*.js'], ['build']);
});

gulp.task('default', ['serve', 'watch']);