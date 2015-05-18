var toReact = require('../');
var test = require('tap').test;

// TODO: maybe also use ASTs in the specs.
test('convert returns a function that creates an SVG component', function(t) {
  var res = toReact.convert('<svg></svg>');

  t.type(res, 'function');

  test('it takes a params argument', function(st) {
    st.match(res.toString(), /function anonymous\(params\) {/);
    st.end();
  });

  test('it returns a React component', function(st) {
    st.match(res.toString(), /return React.createElement\('svg'/);
    st.end();
  });

  test('it passes params to the React component', function(st) {
    st.match(res.toString(), /return React.createElement\('svg', params\)/);
    st.end();
  });

  t.end();
});

test('convert strips all arguments from the svg element', function(t) {
  var res = toReact.convert('<svg foo="bar" xmlns="xmlgarbage" width="12"></svg>');

  t.match(res.toString(), /return React.createElement\('svg', params\)/);
  t.end();
});

test('convert keeps the viewBox intact', function(t) {
  var res = toReact.convert('<svg viewBox="0 0 16 16"></svg>');

  t.match(
    res.toString(),
    /return React.createElement\('svg', _extends\({}, params, { viewBox: '0 0 16 16' }\)\);/
  );
  t.end();
});

test('convert removes hard coded colors', function(t) {
  var res = toReact.convert('<svg><circle stroke="#979797"></circle></svg>');

  t.match(
    res.toString(),
    /React.createElement\('circle', { stroke: evalColor\('stroke', '#979797'\) }\)/
  );

  res = toReact.convert('<svg><circle fill="#fafafa"></circle></svg>');
  t.match(
    res.toString(),
    /React.createElement\('circle', { fill: evalColor\('fill', '#fafafa'\) }\)/
  );

  t.end();
});

test('convert removes hard coded dimensions', function(t) {
  var res = toReact.convert('<svg><circle width="2" height="3"></circle></svg>');
  t.match(
    res.toString(),
    /React.createElement\('circle', {}\)/
  );
  t.end();
});

test('convert camelizes attributes with dashes', function(t) {
  var res = toReact.convert('<svg>'+
    '<circle stroke-width="2" foo-bar="baz"></circle>'+
  '</svg>'
  );

  t.match(
    res.toString(),
    /React.createElement\('circle', {\s+strokeWidth: '2',\s+fooBar: 'baz'\s+}\)/
  );

  t.end();
});
