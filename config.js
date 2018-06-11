const path = require('path');
const argv = require('yargs-parser')(process.argv.slice(2));
const pkg = require(path.resolve(process.cwd(), 'package.json'));
const production = argv.production || argv.prod || false;
const year = new Date().getFullYear();

module.exports = {
  production: production,

  banner: `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright ${year} ${pkg.author}
  * Licensed under ${pkg.license}
  */`,

  paths: {
    source: 'src',
    build: 'dist'
  },

  breakpoints: {
    xs: 0,
    sm: 576,
    md: 768,
    lg: 992,
    xl: 1280
  },

  assets: {
    source: 'src/assets',
    build: 'dist/assets'
  },

  styles: {
    source: 'src/styles/**/*.scss',
    build: 'dist/assets/css'
  },

  scripts: {
    source: 'src/scripts/*.js',
    build: 'dist/assets/js'
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
  },

  markdowns: {
    source: '*.md'
  },

  favicon: {
    path: "assets/favicon/",
    source: 'src/favicon/favicon.png',
    build: 'dist/assets/favicon',
    html: 'src/partials/favicon.hbs',
  },

  images: {
    source: 'src/images/**/*.{jpg,png,gif,webp}',
    build: 'dist/assets/img'
  },

  svgs: {
    source: 'src/svgs/**/*.svg',
    build: 'dist/assets/svg'
  }
};
