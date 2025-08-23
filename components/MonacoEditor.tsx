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

  const defaultHTML = `<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Qoder - Agentic Coding Platform</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css"></link>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background-color: #121212;
            color: white;
            line-height: 1.6;
        }

        .navbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 40px;
            border-bottom: 1px solid #333;
        }

        .logo {
            display: flex;
            align-items: center;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
            background-color: #22c55e;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 10px;
        }

        .logo-text {
            font-size: 20px;
            font-weight: bold;
        }

        .nav-links {
            display: flex;
            gap: 30px;
        }

        .nav-link {
            color: #ccc;
            text-decoration: none;
            font-weight: 500;
        }

        .nav-actions {
            display: flex;
            gap: 12px;
        }

        .btn-signin {
            padding: 8px 16px;
            background-color: transparent;
            color: white;
            border: 1px solid #444;
            border-radius: 6px;
            cursor: pointer;
        }

        .btn-download {
            padding: 8px 16px;
            background-color: white;
            color: black;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 500;
        }

        .hero-section {
            text-align: center;
            padding: 60px 20px;
        }

        .access-badge {
            display: inline-flex;
            align-items: center;
            background-color: rgba(75, 75, 75, 0.7);
            padding: 6px 14px;
            border-radius: 20px;
            margin-bottom: 30px;
        }

        .access-badge i {
            margin-right: 8px;
            color: #ffd700;
        }

        .hero-title {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 16px;
        }

        .hero-subtitle {
            font-size: 24px;
            color: #ccc;
            margin-bottom: 40px;
        }

        .download-buttons {
            display: flex;
            justify-content: center;
            gap: 20px;
        }

        .btn-primary {
            padding: 12px 28px;
            background-color: #22c55e;
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 500;
            display: flex;
            align-items: center;
        }

        .btn-secondary {
            padding: 12px 28px;
            background-color: #333;
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            font-weight: 500;
        }

        .code-editor {
            max-width: 1200px;
            margin: 0 auto;
            margin-top: 80px;
            background-color: #1e1e1e;
            border-radius: 8px;
            overflow: hidden;
        }

        .editor-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 8px 12px;
            background-color: #252526;
            border-bottom: 1px solid #333;
        }

        .file-info {
            display: flex;
            align-items: center;
            font-size: 13px;
            color: #888;
        }

        .file-name {
            margin-left: 8px;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 13px;
            color: #888;
        }

        .editor-body {
            display: flex;
        }

        .sidebar-left {
            width: 40px;
            background-color: #252526;
            display: flex;
            flex-direction: column;
        }

        .sidebar-btn {
            padding: 8px 0;
            text-align: center;
            color: #888;
            cursor: pointer;
        }

        .sidebar-btn:hover {
            background-color: #333;
        }

        .code-area {
            flex: 1;
            padding: 16px;
            font-family: monospace;
            font-size: 14px;
            background-color: #1e1e1e;
            color: #d4d4d4;
            overflow-y: auto;
        }

        .sidebar-right {
            width: 128px;
            background-color: #252526;
            padding: 8px;
        }

        .ai-chat {
            font-size: 11px;
            color: #888;
        }

        @media (max-width: 768px) {
            .navbar {
                padding: 16px 20px;
            }

            .nav-links {
                display: none;
            }

            .hero-title {
                font-size: 36px;
            }

            .hero-subtitle {
                font-size: 20px;
            }

            .download-buttons {
                flex-direction: column;
                align-items: center;
            }

            .btn-primary, .btn-secondary {
                width: 200px;
            }
        }
    </style>
</head>
<body>
    <!-- Navigation Bar -->
    <nav class="navbar">
        <div class="logo">
            <div class="logo-icon">
                <i class="fas fa-code text-white"></i>
            </div>
            <span class="logo-text">Qoder</span>
        </div>
        
        <div class="nav-links">
            <a href="#" class="nav-link">Pricing</a>
            <a href="#" class="nav-link">Blog</a>
            <a href="#" class="nav-link">Docs</a>
            <a href="#" class="nav-link">Forum</a>
        </div>
        
        <div class="nav-actions">
            <button class="btn-signin">Sign in</button>
            <button class="btn-download">Download</button>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="hero-section">
        <div class="access-badge">
            <i class="fas fa-star"></i>
            <span>Free Access During Preview</span>
        </div>
        
        <h1 class="hero-title">Agentic Coding Platform for Real Software</h1>
        <p class="hero-subtitle">Think Deeper. Build Better.</p>
        
        <div class="download-buttons">
            <button class="btn-primary">
                <i class="fab fa-windows mr-2"></i>
                Download
            </button>
            <button class="btn-secondary">All Downloads</button>
        </div>
    </section>

    <!-- Code Editor Section -->
    <div class="code-editor">
        <div class="editor-header">
            <div class="file-info">
                <i class="far fa-file-alt"></i>
                <span class="file-name">index.tsx</span>
                <i class="fas fa-times ml-2"></i>
            </div>
            
            <div class="header-actions">
                <span>nextjs-starter-medusa</span>
                <i class="fas fa-search"></i>
                <i class="fas fa-ellipsis-v"></i>
                <span>AI CHAT</span>
                <i class="fas fa-plus"></i>
                <i class="fas fa-expand"></i>
                <i class="fas fa-times"></i>
            </div>
        </div>
        
        <div class="editor-body">
            <div class="sidebar-left">
                <div class="sidebar-btn">
                    <i class="far fa-file-alt"></i>
                </div>
                <div class="sidebar-btn">
                    <i class="fas fa-search"></i>
                </div>
                <div class="sidebar-btn">
                    <i class="fas fa-code-branch"></i>
                </div>
                <div class="sidebar-btn">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="sidebar-btn">
                    <i class="fas fa-cog"></i>
                </div>
                <div class="sidebar-btn">
                    <i class="fas fa-share-alt"></i>
                </div>
            </div>
            
            <div class="code-area">
                <pre>
15  const AccountNav = ({
16    customer,
17  }) => {
18    customer: HttpTypes.StoreCustomer | null
19  }) => {
20    const route = usePathname()
21    const { countryCode } = useParams() as { countryCode: string }
22  
23    const handleLogout = async () => {
24      await signout(countryCode)
25    }
26  
27    return (
                </pre>
            </div>
            
            <div class="sidebar-right">
                <div class="ai-chat">AI CHAT</div>
            </div>
        </div>
    </div>

    <script>
        // Add any JavaScript functionality here if needed
    </script>
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
