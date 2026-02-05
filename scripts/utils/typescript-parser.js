#!/usr/bin/env node
import fs from 'node:fs';
import { parse } from '@typescript-eslint/typescript-estree';

/**
 * Parse TypeScript/TSX file and extract exports
 * @param {string} filePath - Path to the file
 * @returns {Object} - Extracted information
 */
export function parseFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ast = parse(content, {
      loc: true,
      comment: true,
      jsx: filePath.endsWith('.tsx'),
    });

    const result = {
      path: filePath,
      description: extractFileDescription(content),
      exports: {
        functions: [],
        components: [],
        types: [],
        constants: [],
      },
    };

    // Extract exports
    ast.body.forEach((node) => {
      if (node.type === 'ExportNamedDeclaration') {
        handleNamedExport(node, result.exports, content);
      } else if (node.type === 'ExportDefaultDeclaration') {
        handleDefaultExport(node, result.exports, content, ast);
      }
    });

    return result;
  } catch (error) {
    console.warn(`⚠️  Failed to parse ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Extract file description from top comments
 */
function extractFileDescription(content) {
  const lines = content.split('\n');
  const descriptions = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('/**')) continue;
    if (trimmed.startsWith('*') && !trimmed.startsWith('*/')) {
      const text = trimmed.replace(/^\*\s?/, '').trim();
      if (text && !text.startsWith('@')) {
        descriptions.push(text);
      }
    }
    if (trimmed.startsWith('*/')) break;
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('*')) break;
  }

  return descriptions.join(' ').trim() || null;
}

/**
 * Extract JSDoc comment before node
 */
function extractJSDoc(node, content) {
  if (!node.loc) return null;

  const lines = content.split('\n');
  const startLine = node.loc.start.line - 1;

  // Look backwards for JSDoc
  let description = [];
  for (let i = startLine - 1; i >= 0; i--) {
    const line = lines[i].trim();
    if (line.startsWith('*/')) continue;
    if (line.startsWith('/**')) break;
    if (line.startsWith('*')) {
      const text = line.replace(/^\*\s?/, '').trim();
      if (text && !text.startsWith('@')) {
        description.unshift(text);
      }
    }
    if (!line.startsWith('*') && !line.startsWith('//')) break;
  }

  return description.join(' ').trim() || null;
}

/**
 * Handle named exports
 */
function handleNamedExport(node, exports, content) {
  if (node.declaration) {
    const decl = node.declaration;

    if (decl.type === 'FunctionDeclaration') {
      exports.functions.push(extractFunction(decl, content));
    } else if (decl.type === 'VariableDeclaration') {
      decl.declarations.forEach((declarator) => {
        if (isReactComponent(declarator)) {
          exports.components.push(extractComponent(declarator, content));
        } else if (isConstant(declarator)) {
          exports.constants.push(extractConstant(declarator, content));
        }
      });
    } else if (
      decl.type === 'TSTypeAliasDeclaration' ||
      decl.type === 'TSInterfaceDeclaration'
    ) {
      exports.types.push(extractType(decl, content));
    }
  }
}

/**
 * Handle default exports
 */
function handleDefaultExport(node, exports, content, ast) {
  const decl = node.declaration;

  if (decl.type === 'FunctionDeclaration' || decl.type === 'ArrowFunctionExpression') {
    const func = extractFunction(decl, content);
    func.isDefault = true;
    
    // Check if it's a React component (returns JSX)
    if (isReactComponentFunction(decl)) {
      exports.components.push({
        name: func.name,
        description: func.description,
        isDefault: true,
        props: null,
      });
    } else {
      exports.functions.push(func);
    }
  } else if (decl.type === 'Identifier') {
    // Default export of existing declaration - find the original
    const originalDecl = findDeclaration(ast, decl.name);
    if (originalDecl) {
      const description = extractJSDoc(originalDecl, content);
      
      // Check if it's a component
      if (isReactComponentFunction(originalDecl)) {
        exports.components.push({
          name: decl.name,
          isDefault: true,
          description,
          props: null,
        });
      } else {
        exports.functions.push({
          name: decl.name,
          isDefault: true,
          description,
          params: [],
          returns: 'unknown',
          isAsync: false,
        });
      }
    } else {
      // Fallback
      exports.components.push({
        name: decl.name,
        isDefault: true,
        description: null,
      });
    }
  }
}

/**
 * Find a declaration by name in the AST
 */
function findDeclaration(ast, name) {
  for (const node of ast.body) {
    if (node.type === 'FunctionDeclaration' && node.id?.name === name) {
      return node;
    }
    if (node.type === 'VariableDeclaration') {
      for (const declarator of node.declarations) {
        if (declarator.id?.name === name) {
          return declarator;
        }
      }
    }
  }
  return null;
}

/**
 * Check if a function declaration is a React component
 */
function isReactComponentFunction(node) {
  // Check return type annotation for JSX.Element or React.JSX.Element
  if (node.returnType?.typeAnnotation) {
    const returnType = node.returnType.typeAnnotation;
    
    // Check for JSX.Element or React.JSX.Element
    if (returnType.type === 'TSTypeReference') {
      const typeName = returnType.typeName;
      
      // Handle React.JSX.Element (TSQualifiedName → TSQualifiedName → Identifier)
      if (typeName.type === 'TSQualifiedName') {
        // Could be React.JSX or JSX.Element
        if (typeName.left.type === 'TSQualifiedName') {
          // React.JSX.Element
          return (
            typeName.left.left?.name === 'React' &&
            typeName.left.right?.name === 'JSX' &&
            typeName.right?.name === 'Element'
          );
        }
        
        // JSX.Element
        return typeName.left.name === 'JSX' && typeName.right.name === 'Element';
      }
      
      // Handle just JSX
      if (typeName.name === 'JSX') {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Extract function information
 */
function extractFunction(node, content) {
  const name = node.id?.name || 'anonymous';
  const params = node.params.map((param) => extractParam(param));
  const returnType = extractReturnType(node);
  const isAsync = node.async || false;
  const description = extractJSDoc(node, content);

  return {
    name,
    description,
    params,
    returns: returnType,
    isAsync,
  };
}

/**
 * Extract component information
 */
function extractComponent(declarator, content) {
  const name = declarator.id.name;
  const description = extractJSDoc(declarator, content);

  // Try to extract props type
  let propsType = null;
  if (declarator.init?.params?.[0]?.typeAnnotation) {
    propsType = extractTypeAnnotation(declarator.init.params[0].typeAnnotation);
  }

  return {
    name,
    description,
    props: propsType,
  };
}

/**
 * Extract type information
 */
function extractType(node, content) {
  const name = node.id.name;
  const description = extractJSDoc(node, content);

  return {
    name,
    description,
    kind: node.type === 'TSInterfaceDeclaration' ? 'interface' : 'type',
  };
}

/**
 * Extract constant information
 */
function extractConstant(declarator, content) {
  const name = declarator.id.name;
  const description = extractJSDoc(declarator, content);

  return {
    name,
    description,
  };
}

/**
 * Check if variable is a React component
 */
function isReactComponent(declarator) {
  if (!declarator.init) return false;
  if (declarator.init.type === 'ArrowFunctionExpression') {
    // Check if returns JSX
    const returnType = declarator.init.returnType;
    if (returnType?.typeAnnotation?.typeName?.name === 'JSX') return true;
  }
  return false;
}

/**
 * Check if variable is a constant
 */
function isConstant(declarator) {
  return declarator.id.name === declarator.id.name.toUpperCase();
}

/**
 * Extract parameter information
 */
function extractParam(param) {
  if (param.type === 'Identifier') {
    const type = extractTypeAnnotation(param.typeAnnotation);
    return `${param.name}: ${type || 'any'}`;
  }
  return 'param';
}

/**
 * Extract return type
 */
function extractReturnType(node) {
  if (node.returnType) {
    return extractTypeAnnotation(node.returnType);
  }
  return 'void';
}

/**
 * Extract type annotation as string
 */
function extractTypeAnnotation(typeAnnotation) {
  if (!typeAnnotation) return 'any';

  const annotation = typeAnnotation.typeAnnotation || typeAnnotation;

  if (annotation.type === 'TSStringKeyword') return 'string';
  if (annotation.type === 'TSNumberKeyword') return 'number';
  if (annotation.type === 'TSBooleanKeyword') return 'boolean';
  if (annotation.type === 'TSVoidKeyword') return 'void';
  if (annotation.type === 'TSTypeReference') {
    return annotation.typeName?.name || 'unknown';
  }
  if (annotation.type === 'TSArrayType') {
    return `${extractTypeAnnotation(annotation.elementType)}[]`;
  }

  return 'unknown';
}
