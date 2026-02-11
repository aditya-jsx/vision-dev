"use client"

import React, { useState, useEffect, useRef } from 'react';
import Editor, { BeforeMount, OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { FileItem } from "../../lib/types";
import Loader from "../../components/Loader";

// A simple helper function to determine the language for syntax highlighting
const getLanguageFromPath = (path: string): string => {
    const extension = path.split('.').pop()?.toLowerCase();
    switch (extension) {
        case 'js':
        case 'jsx':
            return 'javascript';
        case 'ts':
        case 'tsx':
            return 'typescript';
        case 'css':
            return 'css';
        case 'json':
            return 'json';
        case 'html':
            return 'html';
        case 'md':
            return 'markdown';
        default:
            return 'plaintext';
    }
};

export function CodeEditor({ 
  file, 
  onSave 
}: { 
  file: FileItem | null; 
  onSave: (path: string, content: string) => void;
}) {
    const [code, setCode] = useState(file?.content || '');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

    const handleEditorBeforeMount: BeforeMount = (monacoInstance) => {
      const compilerOptions = {
        jsx: monacoInstance.languages.typescript.JsxEmit.Preserve,
        esModuleInterop: true,
        allowNonTsExtensions: true,
        baseUrl: ".",
        paths: {
          "@/*": ["./*"]
        },
        strict: false, 
      };

      monacoInstance.languages.typescript.typescriptDefaults.setCompilerOptions(compilerOptions);
      monacoInstance.languages.typescript.javascriptDefaults.setCompilerOptions(compilerOptions);

      monacoInstance.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: true,
      });
      monacoInstance.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: true,
      });
    };

    const handleEditorDidMount: OnMount = (editor) => {
      editorRef.current = editor;
      setTimeout(() => {
        editorRef.current?.getAction('editor.action.formatDocument')?.run();
      }, 200);
    };

    useEffect(() => {
      if (file && file.content !== code) {
        const newContent = file.content || '';
        setCode(newContent);
        
        if (editorRef.current) {
          setTimeout(() => {
            editorRef.current?.getAction('editor.action.formatDocument')?.run();
          }, 100);
        }
      } else if (!file) {
        setCode('');
      }

    }, [file]);

    useEffect(() => {
      if (file && code !== file.content) {
        
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
          onSave(file.path, code);
        }, 1500);
      }
  
      return () => {
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      };
    }, [code, file, onSave]);

    if (!file) {
        return (
            <div className="h-full flex items-center justify-center text-zinc-400">
                Select a file to view its contents
            </div>
        );
    }

    const language = getLanguageFromPath(file.path);
    const isModified = file.content !== code;

    return (
        <div className="h-full w-full relative">
          {/* saved or modified indicator */}
          {isModified && (
            <div className="absolute top-2 right-4 z-10 bg-yellow-600/90 text-white text-xs px-2 py-1 rounded shadow-lg">
              Saving Changes...
            </div>
          )}
          {!isModified && file.content !== null && (
             <div className="absolute top-2 right-4 z-10 bg-green-600/90 text-white text-xs px-2 py-1 rounded shadow-lg">
              Saved
            </div>
          )}
          
          <Editor
            height="100%"
            path={file.path} 
            language={language}
            theme="vs-dark"
            value={code}
            loading={<Loader />}
            onChange={(value) => setCode(value || '')}
            beforeMount={handleEditorBeforeMount}
            onMount={handleEditorDidMount}
            options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                contextmenu: false,
                formatOnPaste: true,
                formatOnType: true,
            }}
          />
        </div>
    );
}