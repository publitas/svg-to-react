# svg-to-react

Convert SVG into React components.


## Example

```javascript
var toReact = require('svg-to-react');
var renderComponent = toReact.convert('<svg xmlns="http://www.w3.org/2000/svg">'+
    '<circle stroke-width="2" stroke="#424242"></circle>'+
  '</svg>'
);

```

result:

```javascript
var renderComponent = function anonymous(params) {
  return React.createElement('svg', params,
    React.createElement('circle', {
      strokeWidth: '2',
      stroke: params.color
    })
  );
}
```

You can now call `renderComponent` with any SVG and/or React props. Additionally you can provide a `color` property that is used to set fill and stroke colors (if they are not `"none"`).


## methods

## var renderFunction = svgToReact.convert(svgString)

Takes the svgString, runs it through [SVGO](https://github.com/svg/svgo) and returns a function to render the SVG using a React component. The function accepts a `params` object that lets you customize the SVG as well as passing standard React handlers and props.

## svgToReact.convertFile(filePath, function(err, renderFunction) {})

Reads the SVG from `filePath` and returns the render function in a callback

## svgToReact.convertDir(dirPath, function(err, renderFunctions) {})

Recursively reads all SVGs in `dirPath` and returns an object containing all render functions for each SVG file. The object has the format:

```javascript
{
  "svgFile": function () {},
  "nested/svgFile": function() {}
}
```

Each key is a file path relative to `dirName`, minus the '.svg' extension.
