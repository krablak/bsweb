const path = require('path')
const uglify = require('gulp-uglify')
const del = require('del')
const htmlmin = require('gulp-htmlmin')
const less = require('gulp-less')
const cssnano = require('cssnano')
const postcss = require('gulp-postcss')
const imagemin = require('gulp-imagemin')
const concatCss = require('gulp-concat-css')
const { series, parallel, src, dest } = require('gulp')

// Location variables
const paths = {
	src: {
		all: ['./src/**/**.*'],
		favicons: ['./src/favicon*'],
		headers: './src/_headers',
	},
	build: {
		all: ['./build/**/**.*', './build/**.*', './build/*'],
		dir: './build/',
	}
};

function clean() {
	return del(paths.build.all)
}

function prepareHtml(from, to) {
	return () => {
		return src(from)
			// .pipe(htmlmin({ collapseWhitespace: true, removeComments: true }))
			.pipe(dest(to))
	}
}

function prepareStyles(sources, buildDest, buildFileName) {
	return () => {
		return src(sources)
			.pipe(less())
			.pipe(postcss([cssnano()]))
			.pipe(concatCss(buildFileName ?? 'styles.css'))
			.pipe(dest(buildDest))
	}
}

function prepareJs(sources, buildDest) {
	return () => {
		return src(sources)
			.pipe(uglify())
			.pipe(dest(buildDest))
	}
}

function prepareImages(sources, buildDest) {
	return () => {
		return src(sources)
			.pipe(imagemin({ silent: false, verbose: true }))
			.pipe(dest(buildDest))
	}
}

function prepareFavicons() {
	return src(paths.src.favicons)
		.pipe(dest(paths.build.dir))
}

function copy(from, to) {
	return () => src(from).pipe(dest(to));
}

exports.build = series(
	clean,
	parallel(
		prepareHtml(['./src/**/**.html', '!./src/**/ignore-*.html'], './build/'),
		prepareFavicons,
		prepareStyles(
			'./src/less/main.less',
			'./build/css/',
			'all.css'
		),
		prepareJs('./src/js/**.js', './build/assets/js/'),
		prepareImages(
			['./src/img/**/**/*.jpg', './src/assets/images/**/**/*.png', './src/assets/images/**/**/*.svg', './src/assets/images/**/**/*.ico'],
			'./build/img/'
		),
		copy('./src/fonts/*.**', './build/fonts/')
	)
)
exports.default = exports.build
exports.clean = series(clean)
