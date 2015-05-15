var readdir = require('recursive-readdir');
var SVG = require('svgo');
var path = require('path');
var fs = require('fs');
var svg = new SVG();
var toReact = require('./src/svg-to-react');


exports.convert = function(svgstring) {
  return toReact(svgstring);
};

exports.convertFile = function(filePath, callback) {
  fs.readFile(filePath, function(err, content) {
    if (err) callback(err);
    svg.optimize(content.toString(), function(res) {
      callback(null, toReact(res.data));
    });
  });
};

exports.convertDir = function(dirPath, callback) {
  var done = false;
  var processing = 0;
  var components = {};

  function bail(err) {
    done = true;
    callback(err);
  }

  function converFile(filePath) {
    if (done || path.extname(filePath) !== '.svg') return;
    processing++;

    fs.readFile(filePath, function(err, content) {
      if (err) return bail(err);
      svg.optimize(content.toString(), function(res) {
        var key = path.relative(dirPath, filePath).replace(/\.svg$/, '');

        components[key] = toReact(res.data);
        processing--;

        if (processing === 0) {
          callback(null, components);
        }
      });
    });
  }

  // the ignore pattern seems buggy
  readdir(dirPath, function(err, filePaths) {
    if (err) return bail(err);
    filePaths.map(converFile);
  });
};
