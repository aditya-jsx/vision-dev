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
      monacoInstance.editor.defineTheme('vision-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '52525b', fontStyle: 'italic' },
          { token: 'keyword', foreground: 'c4b5fd' },
          { token: 'string', foreground: '6ee7b7' },
          { token: 'number', foreground: 'fcd34d' },
          { token: 'type', foreground: '67e8f9' },
        ],
        colors: {
          'editor.background': '#0a0b11',
          'editor.lineHighlightBackground': '#ffffff08',
          'editorLineNumber.foreground': '#3f3f46',
          'editorLineNumber.activeForeground': '#a1a1aa',
          'editor.selectionBackground': '#6366f140',
          'editorCursor.foreground': '#67e8f9',
          'editorIndentGuide.background1': '#ffffff0a',
        },
      });

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
            <div className="h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                <div className="grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.03] font-mono text-indigo-300">{'</>'}</div>
                <p className="text-sm">Select a file to view its contents</p>
            </div>
        );
    }

    const language = getLanguageFromPath(file.path);
    const isModified = file.content !== code;

    return (
        <div className="h-full w-full relative flex flex-col">
          {/* saved or modified indicator */}
          <div className="flex h-9 items-center justify-between border-b border-white/[0.06] px-4">
            <span className="truncate font-mono text-xs text-zinc-400">{file.path}</span>
            <span className={`flex items-center gap-1.5 text-[11px] ${isModified ? 'text-amber-300' : 'text-emerald-400'}`}>
              <span className={`h-1.5 w-1.5 rounded-full bg-current ${isModified ? 'animate-pulse' : ''}`} />
              {isModified ? 'Saving...' : 'Saved'}
            </span>
          </div>
          
          <Editor
            height="calc(100% - 2.25rem)"
            path={file.path} 
            language={language}
            theme="vision-dark"
            value={code}
            loading={<Loader />}
            onChange={(value) => setCode(value || '')}
            beforeMount={handleEditorBeforeMount}
            onMount={handleEditorDidMount}
            options={{
                readOnly: false,
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                padding: { top: 12 },
                smoothScrolling: true,
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
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