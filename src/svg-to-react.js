var babel = require('babel-core');
var replace = require('estraverse').replace;
var generate = require('escodegen').generate;

module.exports = function(svgString) {
  var trans = babel.transform(stripSvgArguments(svgString), {
    code: false,
    whitelist: ['react']
  });

  var ast = replace(trans.ast.program, {
    enter: function(node, parent) {
      if (isReactCreateElement(node)) this.inCreateElCall = true;

      // check if we are inside a react props object
      if (this.inCreateElCall && parent.type === 'ObjectExpression') {
        camelizeProps(node, parent, this);
        removeHardcodedDimensions(node, parent, this);
        parameterizeColors(node, parent, this);
      }
    },
    leave: function(node, parent) {
      if (isReactCreateElement(node)) this.inCreateElCall = false;
    }
  });

  ast.body.unshift(buildColorEvalAst());
  ast = makeLastStatementReturn(ast);

  return Function('params', generate(ast));
};

function stripSvgArguments(svgString) {
  var viewBox = (svgString.match(/viewBox=['"]([^'"]*)['"]/) || [])[1];
  var viewBoxStr = '';
  if (viewBox) viewBoxStr = 'viewBox="'+viewBox+'"';

  return svgString
    // remove and parameterize all svg attributes except viewbox
    .replace(/<svg([^>]*)*>/, '<svg {...params}'+viewBoxStr+'>');
}

function camelizeProps(node, parent) {
  if (node.type === 'Property' && node.key.type === 'Literal' ) {
    node.key = {
      'type': 'Identifier',
      'name': camelize(node.key.value)
    };
    return node;
  }
}

function removeHardcodedDimensions(node, parent, context) {
  if (isPropertyIdentifierWithNames(node, ['width', 'height'])) {
    context.remove();
  }
}

function parameterizeColors(node, parent, context) {
  var evalColor;

  if (isPropertyIdentifierWithNames(node, ['fill', 'stroke'])) {
    if (node.value.value !== 'none') {
      evalColor = 'evalColor("'+node.key.name+'", "'+node.value.value+'")';
      node.computed = false;
      node.value = getAst(evalColor).body[0].expression;
      return node;
    }
  }
}

function makeLastStatementReturn(ast) {
  var idx = ast.body.length-1;
  var lastStatement = ast.body[idx];

  if (lastStatement && lastStatement.type !== 'ReturnStatement') {
    ast.body[idx] = {
      'type': 'ReturnStatement',
      'argument': lastStatement
    };
  }

  return ast;
}

function camelize(string) {
  return string.replace(/-(.)/g, function(_, letter) {
    return letter.toUpperCase();
  });
}

function isPropertyIdentifier(node) {
  return node.type === 'Property' && node.key.type === 'Identifier';
}

function isPropertyIdentifierWithNames(node, names) {
  var itIs = false;
  if (!isPropertyIdentifier(node)) return false;

  for (var i=0; i < names.length; i++) {
    if (names[i] === node.key.name) {
      itIs = true;
      break;
    }
  }

  return itIs;
}

function isReactCreateElement(node) {
  return (
    node.type === 'CallExpression'
    && (node.callee.object && node.callee.object.name === 'React')
    && (node.callee.property && node.callee.property.name === 'createElement')
  );
}

function buildColorEvalAst() {
  var makeColorEval = function() {
    if (typeof params.color === 'function') {
      return params.color;
    } else {
      return function() { return params.color; };
    }
  };

  return getAst('var evalColor = ('+makeColorEval+'());').body[0];
}

function getAst(code) {
  var trans = babel.transform(code, {
    whitelist: [],
    code: false
  });

  return trans.ast.program;
}
