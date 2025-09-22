import Editor from "@monaco-editor/react"

export default function CodeEditor() {
  return (
    <div className="text-white rounded-2xl">

        <Editor
          height="90vh"
          defaultLanguage="typescript"
          defaultValue="// Your code will appear here"
          theme="vs-dark"
          className=""
          />

    </div>  
  )
}