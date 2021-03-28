const gulp = require('gulp')
const sass = require('gulp-sass')
const pumbler = require('gulp-plumber')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const sourcemaps = require('gulp-sourcemaps')
const babel = require('gulp-babel')
const concat = require('gulp-concat')
const browserSync = require('browser-sync').create()
const gulpif = require('gulp-if')
const imagemin = require('gulp-imagemin')
const minimist = require('minimist')
const clean = require('gulp-clean')

const cleanTask = () => {
    return gulp
        .src(['./dist/**/*'], { read: false, allowEmpty: true })
        .pipe(clean())
}

const htmlTask = () => {
    return gulp
        .src('./src/**/*.html')
        .pipe(pumbler())
        .pipe(gulp.dest('./dist/'))
        .pipe(browserSync.stream())
}

const cssTask = () => {
    return gulp
        .src('./src/scss/**/*.scss')
        .pipe(pumbler())
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss([autoprefixer()]))
        .pipe(gulp.dest('./dist/css'))
        .pipe(browserSync.stream())
}

const jsTask = () => {
    return gulp
        .src('./src/js/**/*.js')
        .pipe(pumbler())
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(
            babel({
                presets: ['@babel/env'],
            })
        )
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./dist/js'))
        .pipe(browserSync.stream())
}

const envOptions = {
    string: 'env',
    default: { env: 'development' },
}

const options = minimist(process.argv.slice(2), envOptions)

const imageMinTask = () => {
    return gulp
        .src('./src/images/*')
        .pipe(gulpif(options.env === 'production', imagemin()))
        .pipe(gulp.dest('./dist/images'))
}

const watchTask = () => {
    gulp.watch(['./src/**/*.html'], gulp.series(htmlTask))
    gulp.watch(['./src/scss/**/*.scss'], gulp.series(cssTask))
    gulp.watch(['./src/js/**/*.js'], gulp.series(jsTask))
}

const browserSyncTask = () => {
    browserSync.init({
        server: {
            baseDir: './dist',
        },
        // reloadDebounce: 2000,
    })
}

gulp.task(
    'default',
    gulp.series(
        cleanTask,
        gulp.parallel(
            htmlTask,
            cssTask,
            jsTask,
            imageMinTask,
            watchTask,
            browserSyncTask
        )
    )
)

gulp.task(
    'build',
    gulp.series(
        cleanTask,
        gulp.parallel(htmlTask, cssTask, jsTask),
        imageMinTask
    )
)
