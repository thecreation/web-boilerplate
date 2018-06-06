const path = require('path');
const argv = require('yargs-parser')(process.argv.slice(2));
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const production = argv.production || argv.prod || false;
const year = new Date().getFullYear();

module.exports = {
  banner: `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright ${year} ${pkg.author}
  * Licensed under ${pkg.license}
  */`,

  styles: {
    source: 'src/styles/**/*.scss',
    build: 'dist/assets/css'
  },

  scripts: {
    source: 'src/scripts/*.js',
    build: 'dist/assets/js'
  },

  markdowns: {
    source: '*.md'
  },

  favicons: {
    path: "assets/favicons/",
    source: 'src/favicons/favicon.png',
    build: 'dist/assets/favicons',
    html: 'src/partials/favicons.hbs',
    root: "dist"
  },

  images: {
    source: 'src/images/**/*.{jpg,png,gif,webp}',
    build: 'dist/assets/images'
  },

  svgs: {
    source: 'src/svgs/**/*.svg',
    build: 'dist/assets/svgs'
  },

  assets: {
    source: 'src/assets',
    build: 'dist/assets'
  },

  html: {
    pages: 'src/pages/**/*.hbs',
    data: "src/data/**/*.{js,json}",
    helpers: "src/helpers/*.js",
    layouts: "src/layouts/**/*.hbs",
    partials: "src/partials/**/*.hbs",
    build: 'dist',
    metadata: {
      production,
      pkg
    }
  }
};
