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
    build: 'dist/css'
  },

  scripts: {
    source: 'src/scripts/*.js',
    build: 'dist/js'
  },

  markdowns: {
    source: '*.md'
  },

  images: {
    source: 'src/images/**/*.{jpg,png,gif,webp}',
    build: 'dist/images'
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