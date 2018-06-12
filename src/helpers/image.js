const fs = require('fs');
const config = require('../../config');
const path = require('path');
const sizeOf = require('image-size');
const stringifyAttributes = require('stringify-attributes');
const globParent = require('glob-parent');
const sharp = require('sharp');
const imagemin = require('imagemin');
const mozJpegPlugin = require('imagemin-mozjpeg');
const gifLossyPlugin = require('imagemin-giflossy');
const pngquantPlugin = require('imagemin-pngquant');
const svgoPlugin = require('imagemin-svgo');
const webpPlugin = require('imagemin-webp');

const sourcePath = globParent(config.images.source);
const buildPath = config.images.build;
const relativePath = path.relative(config.paths.build, config.images.build);

const generatePicture = (url, src, srcset, webp, placeholder, attributes) => {
  const source = path.join(sourcePath, url);
  const {ext, dir, name, base} = path.parse(url);

  const processImage = (image) => {
    let match = /\S+@(\d+)\.\w+/.exec(image);

    if(match) {
      width = parseInt(match[1]);
      image = match[0];
    }

    const dist = path.join(config.paths.build, image);

    if(!fs.existsSync(dist)) {
      let processor = sharp(source);
      if(width) {
        processor.resize(width);
      }

      processor.toBuffer().then(data => {
        imagemin.buffer(data, config.images.build, {
          plugins: [
            mozJpegPlugin({ progressive: true }),
            pngquantPlugin(),
            gifLossyPlugin(),
            webpPlugin(),
            svgoPlugin({
              plugins: [
                {
                  removeViewBox: true
                }
              ]
            })
          ]
        }).then(data => {
          fs.writeFileSync(dist, data);
        });
      });
    }
  }

  const generateImgTag = (src, attributes) => {
    processImage(src);
    return `<img data-src="${src}"${stringifyAttributes(attributes)} />`;
  }

  const generateSrcSet = (name, srcMap, ext) => {
    return srcMap.map(candidate => {
      return `${relativePath}/${name}@${candidate.width}${ext} ${candidate.density}`;
    }).join(', ');
  }

  const generateSourceTag = (srcset, type, media) => {
    let images = srcset.split(',');
    images.forEach((image) => {
      processImage(image);
    });

    let output = '<source ';

    if(media) {
      output += `media="${media}" `;
    }

    if(type) {
      output += `type="${type}" `;
    }

    return output + `data-srcset="${srcset}" />`;
  }

  const generateScreenSourceTags = (name, screenMap, ext, webp = false) => {
    return screenMap.map((candidate, index) => {
      let output, media, type;

      if(index === 0 && screenMap.length === 1) {

        media = `(min-width: ${next}px)`;
      } else if(index < screenMap.length - 1){
        let next = screenMap[index+1].screen - 1;
        if(candidate.screen == 0) {
          media = `(max-width: ${next}px)`;
        } else {
          media = `(min-width: ${candidate.screen}px) and (max-width: ${next}px)`;
        }
      } else {
        media = `(min-width: ${candidate.screen}px)`;
      }

      if(webp) {
        type = "image/webp";
      }

      return generateSourceTag(`${relativePath}/${name}@${candidate.width*2}${ext} 2x, ${relativePath}/${name}@${candidate.width}${ext} 1x`, type, media);
    }).join('');
  }

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
      output += generateScreenSourceTags(name, screenMap, '.webp', true);

      if(srcMap.length > 0) {
        output += generateSourceTag(generateSrcSet(name, srcMap, '.webp'), 'image/webp');
      }

      if(src !== null) {
        output += generateSourceTag(`${relativePath}/${name}@${src}.webp`, 'image/webp');
      } else {
        output += generateSourceTag(`${relativePath}/${name}.webp`, 'image/webp');
      }
    }

    output += generateScreenSourceTags(name, screenMap, ext);

    if(srcMap.length > 0) {
      output += generateSourceTag(generateSrcSet(name, srcMap, ext));
    }

    if(src) {
      output += generateImgTag(`${relativePath}/${name}@${src}${ext}`, attributes);
    } else {
      output += generateImgTag(`${relativePath}/${url}`, attributes);
    }

    output += '</picture>';

    if(placeholder === 'true' || placeholder === true) {
      output += '</div>';
    }
  } else {
    output = generateImgTag(`${relativePath}/${url}`, attributes);
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
