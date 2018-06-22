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

  icons: {
    source: 'src/icons/svgs/**/*.svg',
    build: 'dist/assets/icons',
    fileName: 'icons',
    fontName: `${pkg.name}-icons`,
    // template: 'src/icons/_template.css',
    // templateDist: 'dist/icons/icons.css',
    // fontPath: './',
    template: 'src/icons/_template.scss',
    templateDist: 'src/styles/_icons.scss',
    fontPath: '../icons/',
  },

  favicon: {
    path: "assets/favicon/",
    source: 'src/favicon/favicon.png',
    build: 'dist/assets/favicon',
    html: 'src/partials/favicon.hbs',
  },

  vendor: {
    manifest: 'manifest.json',
    dest: 'dist/assets/vendor',
    flattenPackages: true,
    paths: {
      css: '${dest}/${package}/${file}',
      js: '${dest}/${package}/${file}',
      fonts: '${dest}/${package}/${file}'
    }
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
