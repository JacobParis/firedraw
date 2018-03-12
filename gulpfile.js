{
    'use strict';
    const fs = require('fs');
    const gulp = require('gulp');
    const watch = require('gulp-watch');
    const gutil = require('gulp-util');
    const rename = require('gulp-rename');
    const merge = require('merge2');
    const concat = require('gulp-concat');
    const path = require('path');
    const jsx = require('nativejsx');
    const tap = require('gulp-tap');

    const webpack = require('webpack');
    const webpackConfig = require('./webpack.config.js');

    const componentsPath = './app/components';
    const scenesPath = './app/scenes';

    gulp.task('compileLayouts', () => {
        return gulp.src('./app/**/layout.scss')
            .pipe(concat('layouts.scss'))
            .pipe(gulp.dest('./staging'));
    });

    gulp.task('compileStyles', () => {
        return gulp.src('./app/**/styles.scss')
            .pipe(concat('styles.scss'))
            .pipe(gulp.dest('./staging'));
    });

    gulp.task('compileComponents', () => {
        const components = fs.readdirSync(componentsPath)
            .filter(function (file) {
                return fs.statSync(path.join(componentsPath, file)).isDirectory();
            });

        components.map(component => {
            console.log(path.join(componentsPath, component, '**/*.js'));
            return merge(
                gulp.src(path.join(componentsPath, component, '**/*.js')),
                gulp.src(path.join(componentsPath, component, '**/*.jsx'))
                .pipe(tap(file => {
                    file.contents = Buffer.from(jsx.parseSync(file.path, {
                        prototypes: 'inline',
                    }));
                })))
            .pipe(concat(component.toLowerCase() + ".js"))
            .pipe(gulp.dest('./staging/components'));
        });
    });

    gulp.task('compileScenes', () => {
        return gulp.src(path.join(scenesPath, '**/*.jsx'))
            .pipe(tap(file => {
                file.contents = Buffer.from(jsx.parseSync(file.path, {
                    prototypes: 'inline',
                }));
            }))
            .pipe(rename(filepath => {
                filepath.dirname = "scenes";
                filepath.extname = ".js";
            }))
            .pipe(gulp.dest('./staging'));
    });

    gulp.task('compileUtilities', () => {
        return gulp.src('./app/utilities/**/*.js')
            .pipe(rename(filepath => {
                filepath.dirname = "utilities";
            }))
            .pipe(gulp.dest('./staging'));
    });


    gulp.task('moveImages', () => {
        return gulp.src('./app/**/*.png')
            .pipe(rename(filepath => {
                filepath.dirname = "img";
            }))
            .pipe(gulp.dest('./staging'));
    });

    gulp.task('moveStatics', () => {
        return gulp.src('./app/**/_*.*')
            .pipe(rename(path => {
                path.basename = path.basename.replace("_", "");
            }))
            .pipe(gulp.dest('./staging'));
    });

    gulp.task('stage', ['compileLayouts', 'compileStyles', 'compileUtilities', 'compileScenes', 'compileComponents', 'moveImages', 'moveStatics'], () => {
        return true;
    });

    gulp.task('watch', () => {
        watch('./app/**/*', () => {
            gulp.start('pack');
        });
    });

    gulp.task('pack', ['stage'], () => {
        webpack(webpackConfig, function (err, stats) {
            if (err) throw new gutil.PluginError("webpack", err);

            gutil.log("[webpack]", stats.toString({
                // output options
                chunks: false,
                colors: true
            }));
        });

        return gulp.src('./app/**/_index.html')
            .pipe(rename(path => {
                path.basename = path.basename.replace("_", "");
            }))
            .pipe(gulp.dest('./dist'));
    });

}