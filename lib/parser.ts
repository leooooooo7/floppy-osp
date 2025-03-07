import { parse } from '@typescript-eslint/typescript-estree';
import fs from 'fs';
import { walk } from 'estree-walker';
import { attribute } from '../public/types';


// TODO: add checks for client-side rendering and incremental static regeneration
// TODO: currently only works with pages directory. add app directory
export function getRenderMethod(tree: object) {
  let renderMethod = '';
  walk(tree, {
    enter: function (node) {
      if (node.type === 'ExportNamedDeclaration') {
        if (node.declaration.type === 'FunctionDeclaration') {
          if (node.declaration.id.name === 'getStaticProps') {
            // console.log('ExportNamedDeclaration node:', node)
            // console.log('render method: SSG')
            renderMethod = 'SSG';
            this.skip();
          }
          else if (node.declaration.id.name === 'getServerSideProps') {
            // console.log('ExportNamedDeclaration node:', node)
            // console.log('render method: SSR')
            renderMethod = 'SSR';
            this.skip();
          }
          // else console.log("doesn't pass if check")
        }  
      }
    }
  })
  console.log('exiting logAst');

  // assign default method of SSG
  if (renderMethod === '') {
    // console.log('assign default SSG')
    renderMethod = 'SSG';
  }

  return renderMethod;
}


// check if importing SWR react hook library for fetch calls
// TODO possibly refactor to grab all imports first as array/object and then check imports for swr, to allow checking for other types of imports later
export function checkImportSwr(tree: object):boolean {
  let result = false;

  walk(tree, {
    enter: function(node) {
      if (node.type === 'ImportDeclaration' && node.source.value === 'swr') {
        // if (node.specifiers.local.type === 'Identifier' && node.specifiers.local.name === 'useSwr') {
        //   console.log('getFetchData swr node.specifiers: ', node.specifiers)
        //   this.skip();
        console.log('checkImportSwr node:', node)
        result = true;
        this.skip();
        // }
      }
    }
  })

  console.log('checkImportSwr result:', result)
  return result;
}


// if using SWR react hook library, parse for fetch function
export function getSwrFetchData(tree: object) {
  let fetchURL = '';
  walk(tree, {
    enter: function(node) {
      if (node.type === 'CallExpression') {
        if (node.callee.type == 'Identifier' && node.callee.name === 'fetch') {
          console.log('getSwrFetch node: ', node);
          // if (node.callee.arguments[0] === 'Identifier') {
            // fetch is being wrapped in a fetcher function
        }
        // using SWR react hook library for fetch calls
        else if (node.callee.type === 'Identifier' && node.callee.name === 'useSwr') {
          console.log('getFetchData swr node:', node);
          console.log('node.arguments[0].value', node.arguments[0].value);
          fetchURL = node.arguments[0].value;
          console.log('fetchURL:', fetchURL);
        }
      }
    }
  })
  return fetchURL;
}


// main fetchData function which checks for fetch method use based on swr library use or not
export function getFetchData(tree: object) {
  let fetchURL = '';
  // let usesSwr:boolean = false;
  
  const usesSwr: boolean = checkImportSwr(tree);

  // if true, then using swr hooks library for fetching
  if (usesSwr === true) {
    fetchURL = getSwrFetchData(tree);

  // else normal fetch
  } else {
    walk(tree, {
      enter: function(node) {
        if (node.type === 'CallExpression') {
  
          // uses fetch()
          if (node.callee.type === 'Identifier' && node.callee.name === 'fetch') {
            console.log('getFetchData node.callee: ', node.callee)
            // invokes simple fetch() call with a literal argument
            if (node.arguments[0].type === 'Literal') {
              console.log('getFetchData callExpression: ', node)
              console.log('getFetchData node.arguments[0].value', node.arguments[0].value)
              fetchURL = node.arguments[0].value;
              console.log('fetchURL:', fetchURL);
            }
          } 
        }
      }
    })
  }

  console.log('exiting getFetchData');
  return fetchURL;
}


export function getRawTree(sourcePath: string) {
  // console.log('sourcePath: ', sourcePath)
  const source = fs.readFileSync(sourcePath, "utf8");
  // console.log('source: ', source)
  
  const ast = parse(source, {
    jsx: true,
  });

  // console.log('ast: ', ast)
  // console.log('ast.body[1]: ', ast.body[1])
  return ast;
}

// main parser function that creates AST and returns node properties such as renderMethods
export default function runParser(sourcePath: string) {
  const attributeObj: attribute = {
    id: '',
    path: sourcePath,
    dataRenderMethod: '',
    fetchURL: '',
    props: ''
  };
  const rawTree = getRawTree(sourcePath);

  const renderMethod = getRenderMethod(rawTree);
  console.log('dataRnderMethod', renderMethod);
  attributeObj['dataRenderMethod'] = renderMethod;

  console.log('getFetchData for:', sourcePath);
  const fetchData = getFetchData(rawTree);
  console.log('fetchData: ', fetchData);
  attributeObj['fetchURL'] = fetchData;

  return attributeObj;
}
