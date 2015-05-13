var rd = require('read-dir-files');
var SVG = require('svgo');
var path = require('path');
var fs = require('fs');
var svg = new SVG();
var babel = require('babel-core');

module.exports = function(dirPath, callback) {
  var done = false;
  var processing = 0;
  var components = {};

  rd.list(dirPath)
    .on('error', function(err) { callback(err); })
    .on('end', function() { done = true; })
    .on('file', function(filePath) {
      if (path.extname(filePath) !== '.svg') return;
      processing++;

      optimize(filePath, function(svgString) {
        var key = path.relative(dirPath, filePath).replace(/\.svg$/, '');
        var trans = babel.transform(svgString, {
          whitelist: ['react']
        });

        components[key] = Function('params', trans.code.replace('React.createElement(', 'return React.createElement('));
        processing--;

        if (processing === 0 && done) {
          callback(null, components);
        }
      });
    });
};

function optimize(filePath, callback) {
  fs.readFile(filePath, function(err, content) {
    if (err) throw err;
    svg.optimize(content.toString(), function(res) {
      callback(parameterize(res.data));
    });
  });
}

function parameterize(svgString) {
  var viewBox = (svgString.match(/viewBox=['"]([^'"]*)['"]/) || [])[1];
  var colorReplacer = replaceColor('{params.color}');

  return svgString
    // remove and parameterize all svg attributes expect viewbox
    .replace(/<svg ([^>]*)>/, '<svg {...params} viewBox="'+viewBox+'">')
    // parameterize colors
    .replace(/(stroke)="([^"]+)"/gi, colorReplacer)
    .replace(/(fill)="([^"]+)"/gi, colorReplacer)
    // remove hardcoded dimensions
    .replace(/ width="\d+(\.\d+)?(px)?"/gi, '')
    .replace(/ height="\d+(\.\d+)?(px)?"/gi, '');
}

function replaceColor(color) {
  return function(_, type, prevColor) {
    return (prevColor === 'none')
      ? type+'="none"'
      : type+'='+color;
  };
}
