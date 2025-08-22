"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";

interface MonacoEditorProps {
  onCodeSubmit: (code: string) => void;
  initialCode?: string;
}

const MonacoEditor: React.FC<MonacoEditorProps> = ({
  onCodeSubmit,
  initialCode = "",
}) => {
  const [code, setCode] = useState(initialCode);
  const [error, setError] = useState<string>("");

  const defaultHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Portfolio</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }
        h1 {
            font-size: 3em;
            margin-bottom: 0.5em;
        }
        p {
            font-size: 1.2em;
            line-height: 1.6;
        }
        .skills {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin: 30px 0;
        }
        .skill {
            background: rgba(255,255,255,0.2);
            padding: 10px 20px;
            border-radius: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>John Doe</h1>
        <p>Full Stack Developer & Designer</p>
        <p>I create amazing web experiences that combine beautiful design with powerful functionality.</p>
        
        <div class="skills">
            <div class="skill">React</div>
            <div class="skill">Node.js</div>
            <div class="skill">TypeScript</div>
            <div class="skill">Design</div>
        </div>
        
        <p>Let's build something incredible together!</p>
    </div>
</body>
</html>`;

  const handleEditorChange = (value: string | undefined) => {
    setCode(value || "");
    setError("");
  };

  const handleSubmit = () => {
    if (!code.trim()) {
      setError("Please enter some HTML code.");
      return;
    }

    // Basic HTML validation
    if (!code.includes("<") || !code.includes(">")) {
      setError("Please enter valid HTML code.");
      return;
    }

    onCodeSubmit(code);
  };

  const handleUseTemplate = () => {
    setCode(defaultHTML);
    setError("");
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6 sm:p-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 mb-3">
            LikeDocs Portfolio Builder
          </h1>
          <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
            Paste any HTML (with CSS/JS) and preview it in full screen
          </p>

          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={handleUseTemplate}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-md"
            >
              Use Sample Template
            </button>
            <button
              onClick={handleSubmit}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
            >
              Preview Portfolio
            </button>
          </div>
        </div>

        {/* Monaco Editor */}
        <div className="rounded-xl border border-black/5 dark:border-white/10 overflow-hidden shadow-xl bg-white/80 dark:bg-gray-900/70 backdrop-blur">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/70 border-b border-black/5 dark:border-white/10">
            <h3 className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-200">
              HTML Editor
            </h3>
          </div>

          <div className="h-[70vh]">
            <Editor
              height="100%"
              defaultLanguage="html"
              value={code}
              onChange={handleEditorChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                wordWrap: "on",
                automaticLayout: true,
                scrollBeyondLastLine: false,
                tabSize: 2,
              }}
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Tips */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3 text-sm text-gray-600 dark:text-gray-400">
          <div className="rounded-lg border border-black/5 dark:border-white/10 p-3">
            • Supports full HTML documents with inline CSS and JS
          </div>
          <div className="rounded-lg border border-black/5 dark:border-white/10 p-3">
            • Preview runs in a sandboxed iframe for safety
          </div>
          <div className="rounded-lg border border-black/5 dark:border-white/10 p-3">
            • You can edit text directly in the preview
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonacoEditor;
