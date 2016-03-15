// Generated on 2015-07-31 using generator-jhipster 2.18.0
/* jshint camelcase: false */
'use strict';

var gulp = require('gulp'),
    gutil = require('gulp-util'),
    prefix = require('gulp-autoprefixer'),
    minifyCss = require('gulp-minify-css'),
    //usemin = require('gulp-usemin'),
    useref = require('gulp-useref'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    uglify = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    rename = require('gulp-rename'),
    imagemin = require('gulp-imagemin'),
    ngAnnotate = require('gulp-ng-annotate'),
    ngConstant = require('gulp-ng-constant-fork'),
    jshint = require('gulp-jshint'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    proxy = require('proxy-middleware'),
    es = require('event-stream'),
    flatten = require('gulp-flatten'),
    del = require('del'),
    url = require('url'),
    gzip = require('gulp-gzip'),
    wiredep = require('wiredep').stream,
    fs = require('fs'),
    sass = require('gulp-sass'),
    runSequence = require('run-sequence'),
    browserSync = require('browser-sync'),
    env = require('gulp-env'),
    mocha = require('gulp-mocha-co');



var yeoman = {
    app: 'client/',
    dist: 'dist/',
    test: 'test/',
    tmp: '.tmp/',
    port: 3000,
    apiPort: 3000,
    liveReloadPort: 35729
};

var endsWith = function(str, suffix) {
    return str.indexOf('/', str.length - suffix.length) !== -1;
};


gulp.task('clean', function(cb) {
    del([yeoman.dist]);
    cb();
});

gulp.task('clean:tmp', function(cb) {
    del([yeoman.tmp]);
    cb();
});




gulp.task('config:dev', function() {



    var configSrc = 'config/config.dev.json';
    return gulp.src(configSrc)
        .pipe(ngConstant({
            name: 'koan.components',
            deps: false
        }))
        // Writes config.js to dist/ folder 
        .pipe(rename("config.js"))
        .pipe(gulp.dest('client/scripts/components'));
});


gulp.task('config:prd', function() {



    var configSrc = 'config/config.prd.json';
    return gulp.src(configSrc)
        .pipe(ngConstant({
            name: 'koan.components',
            deps: false
        }))
        // Writes config.js to dist/ folder 
        .pipe(rename("config.js"))
        .pipe(gulp.dest('client/scripts/components'));
});



gulp.task('copy', function() {
    return es.merge( // copy i18n folders only if translation is enabled
        gulp.src(yeoman.app + 'i18n/**')
        .pipe(gulp.dest(yeoman.dist + 'i18n'))
        .pipe(gzip())
        .pipe(gulp.dest(yeoman.dist + 'i18n')),

        gulp.src(yeoman.app + 'assets/**/*.{woff,svg,ttf,eot,woff2}')
        .pipe(flatten())
        .pipe(gulp.dest(yeoman.dist + 'assets/fonts'))
        .pipe(gzip())
        .pipe(gulp.dest(yeoman.dist + 'assets/fonts'))
    );

});


gulp.task('scss', function() {
    return gulp.src(yeoman.app + 'scss/vendor.scss')
        .pipe(sass({
            includePaths: [yeoman.app + 'bower_components/bootstrap-sass/assets/stylesheets',
                yeoman.app,
                yeoman.app + 'bower_components/font-awesome/scss',
            ],
        }))
        .pipe(gulp.dest(yeoman.app + 'assets/css'));
});

gulp.task('fonts', function() {
    return gulp.src([yeoman.app + 'bower_components/bootstrap-sass/assets/fonts/**/*',
            yeoman.app + 'bower_components/font-awesome/fonts/**/*'
        ])
        .pipe(flatten())
        .pipe(gulp.dest(yeoman.app + 'assets/fonts'));
});

gulp.task('copy:i18n', function() {

    return gulp.src([yeoman.app + 'bower_components//angular-i18n/angular-locale_*.js'])
        .pipe(uglify())
        //.pipe(flatten())
        .pipe(gulp.dest(yeoman.app + 'i18n/angular'));


});

gulp.task('images', function() {
    return gulp.src(yeoman.app + 'assets/images/**').
    pipe(imagemin({
        optimizationLevel: 5
    })).
    pipe(gulp.dest(yeoman.dist + 'assets/images')).
    pipe(gzip()).
    pipe(gulp.dest(yeoman.dist + 'assets/images')).
    pipe(browserSync.reload({
        stream: true
    }));
});


gulp.task('serve', function() {
    runSequence('wiredep:test', 'wiredep:app', 'ngconstant:dev', function() {
        var baseUri = 'http://localhost:' + yeoman.apiPort;
        // Routes to proxy to the backend. Routes ending with a / will setup
        // a redirect so that if accessed without a trailing slash, will
        // redirect. This is required for some endpoints for proxy-middleware
        // to correctly handle them.
        var proxyRoutes = [
            '/api',
            '/health',
            '/configprops',
            '/v2/api-docs',
            '/swagger-ui.html',
            '/configuration/security',
            '/configuration/ui',
            '/swagger-resources',
            '/webjars',
            '/metrics',
            '/websocket/tracker',
            '/dump'
        ];

        var requireTrailingSlash = proxyRoutes.filter(function(r) {
            return endsWith(r, '/');
        }).map(function(r) {
            // Strip trailing slash so we can use the route to match requests
            // with non trailing slash
            return r.substr(0, r.length - 1);
        });

        var proxies = [
            // Ensure trailing slash in routes that require it
            function(req, res, next) {
                requireTrailingSlash.forEach(function(route) {
                    if (url.parse(req.url).path === route) {
                        res.statusCode = 301;
                        res.setHeader('Location', route + '/');
                        res.end();
                    }
                });

                next();
            }
        ].concat(
            // Build a list of proxies for routes: [route1_proxy, route2_proxy, ...]
            proxyRoutes.map(function(r) {
                var options = url.parse(baseUri + r);
                options.route = r;
                return proxy(options);
            }));

        browserSync({
            open: false,
            port: yeoman.port,
            server: {
                baseDir: yeoman.app,
                middleware: proxies
            }
        });

        gulp.run('watch');
    });
});

gulp.task('watch', function() {
    gulp.watch('bower.json', ['wiredep:test', 'wiredep:app']);
    gulp.watch(['gulpfile.js', 'pom.xml'], ['ngconstant:dev']);
    gulp.watch(yeoman.app + 'assets/styles/**/*.css', ['styles']);
    gulp.watch(yeoman.app + 'assets/images/**', ['images']);
    gulp.watch([yeoman.app + '*.html', yeoman.app + 'scripts/**', yeoman.app + 'i18n/**']).on('change', browserSync.reload);
});

gulp.task('wiredep', ['wiredep:test', 'wiredep:app']);

gulp.task('wiredep:app', function() {
    var s = gulp.src('src/main/webapp/index.html')
        .pipe(wiredep({
            exclude: [/angular-i18n/]
        }))
        .pipe(gulp.dest('src/main/webapp'));

    return s;
});

gulp.task('wiredep:test', function() {
    return gulp.src('src/test/javascript/karma.conf.js')
        .pipe(wiredep({
            exclude: [/angular-i18n/, /angular-scenario/],
            ignorePath: /\.\.\/\.\.\//, // remove ../../ from paths of injected javascripts
            devDependencies: true,
            fileTypes: {
                js: {
                    block: /(([\s\t]*)\/\/\s*bower:*(\S*))(\n|\r|.)*?(\/\/\s*endbower)/gi,
                    detect: {
                        js: /'(.*\.js)'/gi
                    },
                    replace: {
                        js: '\'{{filePath}}\','
                    }
                }
            }
        }))
        .pipe(gulp.dest('src/test/javascript'));
});

//gulp.task('build', function() {
//  runSequence('clean', 'copy', 'wiredep:app', 'ngconstant:prod', 'usemin');
//});




gulp.task('useref', [], function() {
    var assets = useref.assets();
    var jsFilter = filter('**/*.js', {
        restore: true
    });
    var cssFilter = filter('**/*.css', {
        restore: true
    });
    var htmlFilter = filter('**/*.html', {
        restore: true
    });
    return runSequence('copy', 'scss', function() {
        return gulp.src([yeoman.app + '**/*.html', '!' + yeoman.app + 'bower_components/**/*.html']).
        pipe(assets)


        .pipe(jsFilter)
            .pipe(ngAnnotate())
            .pipe(uglify())
            .pipe(jsFilter.restore)
            .pipe(cssFilter)
            .pipe(prefix.apply())
            .pipe(minifyCss())
            .pipe(cssFilter.restore)
            .pipe(rev())
            .pipe(assets.restore())
            .pipe(useref())
            .pipe(revReplace())
            .pipe(htmlFilter)
            .pipe(htmlmin({
                collapseWhitespace: true //压缩HTML
            }))
            .pipe(htmlFilter.restore)

        .pipe(gulp.dest(yeoman.dist))
            .pipe(gzip({
                append: true

            }))
            .pipe(gulp.dest(yeoman.dist));
    });
});


gulp.task('ngconstant:dev', function() {
    return ngConstant({
            dest: 'app.constants.js',
            name: 'jhipsterApp',
            deps: false,
            noFile: true,
            interpolate: /\{%=(.+?)%\}/g,
            wrap: '/* jshint quotmark: false */\n"use strict";\n// DO NOT EDIT THIS FILE, EDIT THE GULP TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE\n{%= __ngModule %}',
            constants: {
                ENV: 'dev',
                VERSION: yeoman.config
            }
        })
        .pipe(gulp.dest(yeoman.app + 'scripts/app/'));
});

gulp.task('ngconstant:prod', function() {
    return ngConstant({
            dest: 'app.constants.js',
            name: 'jhipsterApp',
            deps: false,
            noFile: true,
            interpolate: /\{%=(.+?)%\}/g,
            wrap: '/* jshint quotmark: false */\n"use strict";\n// DO NOT EDIT THIS FILE, EDIT THE GULP TASK NGCONSTANT SETTINGS INSTEAD WHICH GENERATES THIS FILE\n{%= __ngModule %}',
            constants: {
                ENV: 'prod',
                VERSION: yeoman.config
            }
        })
        .pipe(gulp.dest(yeoman.tmp + 'scripts/app/'));
});

gulp.task('jshint', function() {
    return gulp.src(['gulpfile.js', yeoman.app + 'scripts/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('server', ['serve'], function() {
    gutil.log('The `server` task has been deprecated. Use `gulp serve` to start a server');
});


gulp.task('test', function() {

    env({
        vars: {

            NODE_ENV: 'test'
        }

    });

    gulp.src('test/server/controller/**/*.js')
        .pipe(mocha({
            reporter: 'dot',
            require: ['should', 'co-mocha']
        }));

});


gulp.task('default', ['scss'], function(cb) {

    runSequence('fonts', 'copy:i18n', cb);

});

gulp.task('build', function(cb) {

    runSequence('clean', 'config:prd', 'images', 'useref', cb);

});
