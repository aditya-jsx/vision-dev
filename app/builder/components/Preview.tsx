'use client';

import { useEffect, useState } from 'react';
import { FileTree } from '../../lib/types';
import * as Babel from '@babel/standalone';

interface PreviewProps {
  files: FileTree;
}

// Helper to get a file's content, returns empty string if not found
const getFileContent = (tree: FileTree, path: string): string => {
  const parts = path.split('/');
  let currentNode: any = tree;
  for (const part of parts) {
    if (typeof currentNode !== 'object' || !currentNode[part]) {
      return '';
    }
    currentNode = currentNode[part];
  }
  return typeof currentNode === 'string' ? currentNode : '';
};

export default function Preview({ files }: PreviewProps) {
  const [iframeContent, setIframeContent] = useState('');

  useEffect(() => {
    const htmlContent = getFileContent(files, 'index.html');
    const mainTsxContent = getFileContent(files, 'src/main.tsx');
    const appTsxContent = getFileContent(files, 'src/App.tsx');
    const headerTsxContent = getFileContent(files, 'src/components/Header.tsx');
    const footerTsxContent = getFileContent(files, 'src/components/Footer.tsx');
    const indexCssContent = getFileContent(files, 'src/index.css');

    if (!htmlContent || !mainTsxContent) {
      setIframeContent('<html><body>Required files (index.html, src/main.tsx) not found.</body></html>');
      return;
    }

    try {
      // Simple bundler logic: replace import paths with code content
      let bundledJs = mainTsxContent
        .replace(/from '.\/App.tsx'/, `from 'App.tsx'`)
        .replace(/from '.\/index.css'/, '');

      const fullAppCode = appTsxContent
        .replace(/from ".\/components\/Header"/, `from 'Header.tsx'`)
        .replace(/from ".\/components\/Footer"/, `from 'Footer.tsx'`);

      const finalJs = `
        const modules = {
          'App.tsx': \`${fullAppCode}\`,
          'Header.tsx': \`${headerTsxContent}\`,
          'Footer.tsx': \`${footerTsxContent}\`,
        };

        function require(path) {
          return modules[path];
        }

        ${bundledJs.replace(/import (\w+) from '(.+?)'/g, 'const $1 = require("$2")')}
      `;

      const transpiledCode = Babel.transform(finalJs, {
        presets: ['react', 'typescript'],
        filename: 'main.tsx' // Important for TSX transform
      }).code;

      const finalHtml = htmlContent
        .replace('<div id="root"></div>', '<div id="root"></div><style>' + indexCssContent + '</style>')
        .replace('<script type="module" src="/src/main.tsx"></script>', `<script type="module">${transpiledCode}</script>`);

      setIframeContent(finalHtml);
    } catch (error) {
      console.error("Transpilation Error:", error);
      setIframeContent(`<html><body><pre style="color: red;">${error}</pre></body></html>`);
    }

  }, [files]);

  return (
    <iframe
      srcDoc={iframeContent}
      title="Website Preview"
      className="w-full h-full bg-white"
      sandbox="allow-scripts"
    />
  );
}