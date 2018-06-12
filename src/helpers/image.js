const fs = require('fs');
const config = require('../../config');
const path = require('path');
const sizeOf = require('image-size');
const stringifyAttributes = require('stringify-attributes');
const globParent = require('glob-parent');
const sharp = require('sharp');

const sourcePath = globParent(config.images.source);
const buildPath = config.images.build;
const relativePath = path.relative(config.paths.build, config.images.build);

const processImage = (input, output, width) => {
  sharp(input).resize(width).toFile(output);
}

const generateImgTag = (url, attributes) => {
  return `<img data-src="${url}"${stringifyAttributes(attributes)} />`;
}

const generateSrcSetTag = (filename, srcMap, ext) => {
  return srcMap.map(candidate => {
    return `${relativePath}/${filename}@${candidate.width}${ext} ${candidate.density}`;
  }).join(', ');
}

const generateMediaTag = (filename, screenMap, ext, webp = false) => {
  return screenMap.map((candidate, index) => {
    let output;

    if(index === 0 && screenMap.length === 1) {
      output = `<source media="(min-width: ${next}px)"`;
    } else if(index < screenMap.length - 1){
      let next = screenMap[index+1].screen - 1;
      if(candidate.screen == 0) {
        output = `<source media="(max-width: ${next}px)"`;
      } else {
        output = `<source media="(min-width: ${candidate.screen}px) and (max-width: ${next}px)"`;
      }
    } else {
      output = `<source media="(min-width: ${candidate.screen}px)"`;
    }

    if(webp) {
      output += ' type="image/webp"';
    }
    output += ` data-srcset="${relativePath}/${filename}@${candidate.width*2}${ext} 2x, ${relativePath}/${filename}@${candidate.width}${ext} 1x" />`;
    return output;
  }).join('');
}

const generatePicture = (url, src, srcset, webp, placeholder, attributes) => {
  const source = path.join(sourcePath, url);
  const {ext, dir, filename, base} = path.parse(url);

  if(srcset) {
    srcset = srcset.split(',');
  } else {
    srcset = [];
  }

  let srcMap = [];
  let screenMap = [];

  srcset.forEach(function(candidate) {
    candidate = candidate.trim();

    if(/^\d+$/.test(candidate)) {
      srcMap.push({
        width: parseInt(candidate, 10),
        density: `${candidate}w`
      });
    } else if(/^\d+\s+[a-z]+$/.test(candidate)) {
      const found = candidate.match(/^(\d+)\s+([a-z]+)$/);
      let screen = found[2];
      let density = found[2];

      if(config.breakpoints.hasOwnProperty(screen)){
        screenMap.push({
          width: parseInt(found[1], 10),
          screen: config.breakpoints[screen]
        });
      }
    } else if(/^\d+\s+\d+$/.test(candidate)) {
      const found = candidate.match(/^(\d+)\s+(\d+)$/);

      srcMap.push({
        width: parseInt(found[1], 10),
        density: `${found[2]}w`
      });
    } else if(/^\d+\s+\d+w$/.test(candidate)) {
      const found = candidate.match(/^(\d+)\s+(\d+w)$/);

      srcMap.push({
        width: parseInt(found[1], 10),
        density: found[2]
      });
    }
  });

  srcMap.sort(function(a, b) {
    return a.width - b.width;
  });
  screenMap.sort(function(a, b) {
    return a.screen - b.screen;
  });

  if(!src) {
    if(screenMap.length > 0) {
      src = screenMap[0].width;
    } else if(srcMap.length > 0) {
      src = srcMap[0].width;
    } else {
      src = null;
    }
  }

  let output = '';

  if(fs.existsSync(source)) {
    if(placeholder === 'true' || placeholder === true) {
      output = `<div class="image"`;
      const dimensions = sizeOf(source);
      const padding = 100*(dimensions.height/dimensions.width);

      output += ` style="padding-bottom: ${padding.toFixed(3)}%">`;
    }
    output += '<picture>';

    if(webp === 'true' || webp === true) {
      output += generateMediaTag(filename, screenMap, '.webp', true);
      
      output += `<source type="image/webp"`;

      if(srcMap.length > 0) {
        output += ` data-srcset="${generateSrcSetTag(filename, srcMap, '.webp')}" />`;
      } else if(src !== null) {
        output += ` data-srcset="${relativePath}/${filename}@${src}.webp" />`;
      } else {
        output += ` data-srcset="${relativePath}/${filename}.webp" />`;
      }
    }

    output += generateMediaTag(filename, screenMap, ext);

    if(srcMap.length > 0) {
      output += `<source data-srcset="${generateSrcSetTag(filename, srcMap, ext)}" />`;
    }

    if(src) {
      output += generateImgTag(`${relativePath}/${filename}@${src}${ext}`, attributes); 
    } else {
      output += generateImgTag(url, attributes);
    }

    output += '</picture>';

    if(placeholder === 'true' || placeholder === true) {
      output += '</div>';
    }
  } else {
    output = generateImgTag(url, attributes);
  }

  return output;
}

module.exports.register = function (Handlebars) {
  Handlebars.registerHelper("image", function(url, options) {
    const {webp = true, src = null, srcset = null, placeholder = true, ...attributes} = options.hash || {};

    const output = generatePicture(url, src, srcset, webp, placeholder, attributes);
    return new Handlebars.SafeString(output);
  });
};