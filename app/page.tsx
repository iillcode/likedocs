"use client";

import { useState } from "react";
import MonacoEditor from "../components/MonacoEditor";
import PreviewSection from "../components/PreviewSection";

export default function Home() {
  const [htmlCode, setHtmlCode] = useState<string>("");
  const [currentView, setCurrentView] = useState<"editor" | "preview">(
    "editor"
  );

  const handleCodeSubmit = (code: string) => {
    setHtmlCode(code);
    setCurrentView("preview");
  };

  const handleBackToEditor = () => {
    setCurrentView("editor");
  };

  const handleCodeUpdate = (newCode: string) => {
    setHtmlCode(newCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {currentView === "editor" ? (
        <MonacoEditor onCodeSubmit={handleCodeSubmit} initialCode={htmlCode} />
      ) : (
        <PreviewSection
          htmlCode={htmlCode}
          onBackToEditor={handleBackToEditor}
          onCodeUpdate={handleCodeUpdate}
        />
      )}
    </div>
  );
}
