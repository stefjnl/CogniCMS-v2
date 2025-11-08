"use client";

import { useEffect, useState } from "react";
import { CMSLayout } from "@/components/cms/CMSLayout";
import { ContentProvider } from "@/lib/state/ContentContext";
import { ContentSchema } from "@/types/content";
import { Toaster } from "sonner";

interface LoadedData {
  content: ContentSchema;
  html: string;
  sha?: {
    html: string;
    content: string;
  };
}

export default function Home() {
  const [data, setData] = useState<LoadedData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        // Load from GitHub API only
        const apiResponse = await fetch("/api/content/load");

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json();
          throw new Error(
            errorData.error || "Failed to load content from GitHub"
          );
        }

        const loadedData = await apiResponse.json();
        setData(loadedData);
        setLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load content from GitHub"
        );
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

  if (error || !data) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600">{error || "Failed to load content"}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ContentProvider
        initialContent={data.content}
        initialHtml={data.html}
        initialSha={data.sha || undefined}
      >
        <CMSLayout />
      </ContentProvider>
      <Toaster position="bottom-right" />
    </>
  );
}
