// import Editor from "@monaco-editor/react"

// export default function CodeEditor() {
//   return (
//     <div className="text-white rounded-2xl">

//         <Editor
//           height="90vh"
//           defaultLanguage="typescript"
//           defaultValue="// Your code will appear here"
//           theme="vs-dark"
//           className=""
//           />

//     </div>  
//   )
// }

















import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
  language?: string;
}

export default function CodeEditor({ value, onChange, language = "typescript" }: CodeEditorProps) {
  return (
    <div className="h-full">
        <Editor
          height="100%"
          language={language}
          value={value}
          onChange={onChange}
          theme="vs-dark"
          className=" bg-transparent rounded-2xl z-1"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
          }}
          />
    </div>
  )
}