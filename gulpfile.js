
const gulp = require('gulp');
const pug = require('gulp-pug');
const stylus = require('gulp-stylus');
const shorthand = require('gulp-shorthand');
const svgSprite = require('gulp-svg-sprites');
const svgmin = require('gulp-svgmin');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');
const browserSync = require('browser-sync').create();
const concat = require('gulp-concat');
const postcss = require('gulp-postcss');
const clean = require('gulp-clean');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const pxtorem = require('postcss-pxtorem');
const imagemin = require('gulp-imagemin');
const focus = require('postcss-focus');
const postcssPresetEnv = require('postcss-preset-env');
const imageminMozjpeg = require('imagemin-mozjpeg');
const htmlmin = require('gulp-htmlmin');
const csscomb = require('gulp-csscomb');
const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');
const webpack = require('webpack-stream');
const gulpif = require('gulp-if');
const gulpSelectors = require('gulp-selectors');
const template = require('gulp-template');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;




const processors = [
autoprefixer(),
postcssPresetEnv(),
focus(),
pxtorem(),
];

const cssmin = [
cssnano({
discardComments: {removeAll: true}
})
];

let isProd = true;



let webpackConfig = {

	output: {
		filename: 'app.min.js'
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/,
				loader: 'babel-loader',
				exclude: '/node_modules/'
			}
		]
	},
	plugins: [
		// new BundleAnalyzerPlugin()
	],
	 resolve: {
	    extensions: ['.js', '.jsx', '.json'],
	 },

	mode: isProd ?  'production' : 'development'


}


gulp.task('webpack', function() {
  return gulp.src('frontend/js/app.js')
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest('template/assets'))
    .pipe(gulp.dest('static'))
});

// Clean
gulp.task('clean', function () {
return gulp.src('template', {read: false})
.pipe(gulp.src('frontend/pug/controls/init/*', {read: false}))
.pipe(clean());
});

// manifest
gulp.task('manifest', function () {
return gulp.src('manifest.json')
.pipe(gulp.dest('template/assets/'))
});

// check go
gulp.task('go', () =>
    gulp.src('frontend/pug/controls/controls.pug')
        .pipe(template({name: false}))
        .pipe(gulp.dest('frontend/pug/controls/init/'))
);


// Pug
gulp.task('pug', function() {
	return gulp.src('frontend/pug/*.pug')
	.pipe(pug({
		pretty:false
	}))
	.pipe(gulpif(!isProd, htmlmin({
		collapseWhitespace: true,
		removeComments: true
	})))
	.pipe(gulp.dest('template'))
	.pipe(gulp.dest('static'))
});


// gulp selectors
gulp.task('selec', function() {

	return gulp.src(['static/style.min.css', 'static/*.html', 'static/app.min.js'])
    .pipe(gulpSelectors.run({
    'css': ['css',],
    'html': ['html'],
     'js-strings': ['js']
  }, 
  {
  	classes: ['load', 'active']
  }
  ))
    .pipe(gulpSelectors.info())
    .pipe(gulp.dest('template'))

});


gulp.task('selecMove', function() {
	return gulp.src('template/style.min.css')
    .pipe(gulp.dest('template/assets'))

    .pipe(gulp.src('template/app.min.js'))
    .pipe(gulp.dest('template/assets'))
});

gulp.task('selecMoveClean', function() {
	return gulp.src('template/style.min.css', {read: false})
	.pipe(gulp.src('template/app.min.js', {read: false}))
    .pipe(clean());
});



// Stylus and css min
gulp.task('stylus', function(){
	return gulp.src('frontend/stylus/*.styl','frontend/stylus/*/*.styl','frontend/components/*/*.styl')
	// .pipe(sourcemaps.init())
	.pipe(stylus())
	.pipe(shorthand())
	.pipe(gulp.src('frontend/assets/css/*.css'))
	.pipe(concat('style.css'))
	.pipe(csscomb())
	.pipe(postcss(processors))
	// .pipe(sourcemaps.write('.'))

	.pipe(gulpif(isProd,postcss(cssmin)))
	.pipe(gulpif(isProd,rename({
		suffix: ".min"
	})))
	.pipe(gulp.dest('template/assets'))
	.pipe(gulp.dest('static'))
	.pipe(browserSync.stream());
});




// Svg sprites
gulp.task('svg:build', function () {
return gulp.src('frontend/assets/svg/*.svg')
.pipe(cheerio({
run: function ($) {
$('[fill]').removeAttr('fill');
$('[style]').removeAttr('style');
// $('[height]').removeAttr('height');
// $('[width]').removeAttr('width');
},
parserOptions: { xmlMode: true }
}))



.pipe(svgmin({
js2svg: {
pretty: true
}
}))
.pipe(replace('&gt;', '>'))
.pipe(svgSprite({
mode: "symbols",
preview: false,
selector: "icon-%f",
svg: {
symbols: 'sprite.svg'
}
}
))
.pipe(gulp.dest('template/assets'))
});



// Fonts
gulp.task('fonts:build', function(){
return gulp.src('frontend/assets/fonts/AvenirNextCyr/*')
.pipe(gulp.dest('template/assets'))

});



// Image min
// npm config set unsafe-perm=true
gulp.task('images:build', function(){
return gulp.src('frontend/assets/images/**')
.pipe(imagemin({
interlaced: true,
progressive: true,
optimizationLevel: 5,
verbose: true
}))
.pipe(imagemin([imageminMozjpeg({
quality: 85
})]))
.pipe(gulp.dest('template/assets'))

});

gulp.task('watch', function(){
gulp.watch(['frontend/components/*/*.styl','frontend/stylus/*.styl','frontend/stylus/*/*.styl','frontend/stylus/**/*.styl','frontend/stylus/***/*.styl'],gulp.series('stylus','selec','selecMove','selecMoveClean'))
gulp.watch(['frontend/pug/*.pug','frontend/pug/**/*.pug'],gulp.series('pug','selec','selecMove','selecMoveClean'))
gulp.watch(['frontend/js/*.js','frontend/js/inc/*.js'],gulp.series('webpack','selec','selecMove','selecMoveClean'))
gulp.watch(['frontend/components/*.js','frontend/components/*.jsx','frontend/components/*/*.jsx'],gulp.series('webpack'))
});

gulp.task('browser-sync', function() {
browserSync.init({
server: {
baseDir: "./template"
}
});
browserSync.watch('template',browserSync.reload)
});


// ПЕРВИЧНАЯ СБОРКА
gulp.task('build:dev',gulp.series(
gulp.parallel('webpack', 'fonts:build','images:build','svg:build')));

// ЛОКАЛЬНАЯ СБОРКА
gulp.task('dev', gulp.series('clean', 'go',
gulp.parallel('build:dev', 'pug','stylus', 'manifest'),'selec','selecMove', 'selecMoveClean',
gulp.parallel('watch','browser-sync')


));
