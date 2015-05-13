var includeSvg = require('../');
var test = require('tap').test;

test('includeSvg streaming', function(t) {
  var buffer = '';
  function write(chunk, _, cb) { buffer += chunk; cb(); }

  t.plan(4);

  includeSvg('test/files', function(err, svgComponents) {
    var filenNames = Object.keys(svgComponents);
    if (err) throw err;

    Object.keys(svgComponents).forEach(function (k) {
      console.log(svgComponents[k].toString());
    });

    t.equal(filenNames.length, 3);
    t.ok(filenNames.indexOf('svg-file') !== -1);
    t.ok(filenNames.indexOf('some other') !== -1);
    t.ok(filenNames.indexOf('nested/svg-file') !== -1);
    t.end();
  });
});
