var toReact = require('../');
var test = require('tap').test;

test('convertFile happy path', function(t) {
  t.plan(1);

  toReact.convertFile('test/files/svg-file.svg', function(err, res) {
    if (err) throw err;

    t.type(res, 'function');
  });
});

test('convertFile with non-existing file', function(t) {
  t.plan(1);

  toReact.convertDir('bogus/path/file.svg', function(err, res) {
    t.ok(err);
  });
});

test('convertFile with non-svg file', function(t) {
  t.plan(1);

  toReact.convertDir('test/files/a non svg file.png', function(err, res) {
    t.ok(err);
  });
});
