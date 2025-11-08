"use client";

import { useEffect, useState } from "react";
import { CMSLayout } from "@/components/cms/CMSLayout";
import { ContentProvider } from "@/lib/state/ContentContext";
import { ContentSchema } from "@/types/content";
import { Toaster } from "sonner";

export default function Home() {
  const [content, setContent] = useState<ContentSchema | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Try to load draft from localStorage first
        const draftContent = localStorage.getItem("cognicms-draft");
        if (draftContent) {
          setContent(JSON.parse(draftContent));
          setLoading(false);
          return;
        }

        // Otherwise load from content.json
        const response = await fetch("/sample/content.json");
        if (!response.ok) {
          throw new Error("Failed to load content");
        }
        const data = await response.json();
        setContent(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load content");
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent mb-4"></div>
          <p className="text-gray-600">Loading CMS...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || "Failed to load content"}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContentProvider initialContent={content}>
        <CMSLayout />
      </ContentProvider>
      <Toaster position="bottom-right" />
    </>
  );
}
