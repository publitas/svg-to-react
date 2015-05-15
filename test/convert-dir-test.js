var toReact = require('../');
var test = require('tap').test;

test('convertDir happy path', function(t) {
  t.plan(4);

  toReact.convertDir('test/files', function(err, svgComponents) {
    var filenNames = Object.keys(svgComponents);
    if (err) throw err;

    t.equal(filenNames.length, 3);
    t.ok(filenNames.indexOf('svg-file') !== -1);
    t.ok(filenNames.indexOf('some other') !== -1);
    t.ok(filenNames.indexOf('nested/svg-file') !== -1);
    t.end();
  });
});

test('convertDir with non-existing dir', function(t) {
  t.plan(1);

  toReact.convertDir('bogus/path', function(err, svgComponents) {
    t.ok(err);
  });
});

