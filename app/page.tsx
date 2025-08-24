"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import MonacoEditor from "../components/MonacoEditor";
import { HeroSection } from "@/components/blocks/hero-section-9";

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
    <div className="min-h-screen bg-black text-white">
      <HeroSection>
        <MonacoEditor
          embedded
          onCodeSubmit={handleCodeSubmit}
          initialCode={htmlCode}
        />
      </HeroSection>
    </div>
  );
}
