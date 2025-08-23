"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MonacoEditor from "../components/MonacoEditor";

function generateId() {
  try {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  return "proj_" + Math.random().toString(36).slice(2, 10);
}

export default function Home() {
  const [htmlCode, setHtmlCode] = useState<string>("");
  const router = useRouter();

  const handleCodeSubmit = (code: string) => {
    const id = generateId();
    setHtmlCode(code);
    try {
      localStorage.setItem(`likedocs:project:${id}`, code);
    } catch {}
    router.push(`/project/${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <MonacoEditor onCodeSubmit={handleCodeSubmit} initialCode={htmlCode} />
    </div>
  );
}
