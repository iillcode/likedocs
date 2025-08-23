"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PreviewSection from "../../../components/PreviewSection";

function generateId() {
  // Prefer crypto.randomUUID when available
  try {
    if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  // Fallback
  return "proj_" + Math.random().toString(36).slice(2, 10);
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = (params?.id as string) || "";

  const [projectId, setProjectId] = useState<string>(rawId);
  const storageKey = useMemo(() => (projectId ? `likedocs:project:${projectId}` : ""), [projectId]);
  const [htmlCode, setHtmlCode] = useState<string>("");

  // If id is missing or 'new', generate one and redirect client-side
  useEffect(() => {
    if (!rawId || rawId === "new") {
      const id = generateId();
      setProjectId(id);
      // Delay push to ensure client navigation
      setTimeout(() => router.replace(`/project/${id}`), 0);
    } else {
      setProjectId(rawId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawId]);

  // Load code from localStorage on mount or when projectId is set
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved != null) setHtmlCode(saved);
      else setHtmlCode("");
    } catch {
      setHtmlCode("");
    }
  }, [storageKey]);

  const handleBackToEditor = () => {
    router.push("/");
  };

  const handleCodeUpdate = (newCode: string) => {
    setHtmlCode(newCode);
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, newCode);
    } catch {}
  };

  // While redirecting from 'new', avoid rendering content briefly
  if (!projectId || rawId === "new") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <PreviewSection
        htmlCode={htmlCode}
        onBackToEditor={handleBackToEditor}
        onCodeUpdate={handleCodeUpdate}
      />
    </div>
  );
}
