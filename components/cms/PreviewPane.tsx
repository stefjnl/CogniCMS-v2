"use client";

import { useContent } from "@/lib/state/ContentContext";
import { useEffect, useState, useRef } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Monitor,
  Tablet,
  Smartphone,
  RefreshCw,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewPane() {
  const {
    currentContent,
    originalHtml,
    previewDevice,
    setPreviewDevice,
    showEditableRegions,
    toggleEditableRegions,
  } = useContent();

  const [htmlContent, setHtmlContent] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Generate preview HTML by calling the API (server-side injection)
  useEffect(() => {
    if (!originalHtml || !currentContent) return;

    setIsGenerating(true);

    // Debounce API calls
    const timer = setTimeout(async () => {
      try {
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html: originalHtml,
            content: currentContent,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setHtmlContent(data.html);
        } else {
          console.error("Failed to generate preview");
          setHtmlContent(originalHtml);
        }
      } catch (error) {
        console.error("Error generating preview:", error);
        setHtmlContent(originalHtml);
      } finally {
        setIsGenerating(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [originalHtml, currentContent]);

  // Refresh preview
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      if (iframeRef.current) {
        iframeRef.current.src = iframeRef.current.src;
      }
      setIsRefreshing(false);
    }, 300);
  };

  // Device dimensions
  const deviceDimensions = {
    mobile: "w-[375px] h-full",
    tablet: "w-[768px] h-full",
    desktop: "w-full h-full",
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Preview Controls Bar */}
      <div className="flex-shrink-0 bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-gray-700">Preview</h3>

          {/* Device Toggle */}
          <ToggleGroup
            type="single"
            value={previewDevice}
            onValueChange={(value) => {
              if (value)
                setPreviewDevice(value as "mobile" | "tablet" | "desktop");
            }}
            className="bg-gray-100 p-1 rounded-md"
          >
            <ToggleGroupItem
              value="mobile"
              aria-label="Mobile view"
              className="px-3"
            >
              <Smartphone className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="tablet"
              aria-label="Tablet view"
              className="px-3"
            >
              <Tablet className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem
              value="desktop"
              aria-label="Desktop view"
              className="px-3"
            >
              <Monitor className="w-4 h-4" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-2">
          {/* Highlight Toggle */}
          <Button
            variant={showEditableRegions ? "default" : "outline"}
            size="sm"
            onClick={toggleEditableRegions}
            className="gap-2"
          >
            {showEditableRegions ? (
              <>
                <Eye className="w-4 h-4" />
                Highlights On
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4" />
                Highlights Off
              </>
            )}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-6 bg-gray-100">
        <div
          className={`mx-auto bg-white shadow-lg transition-all ${deviceDimensions[previewDevice]}`}
          style={{ minHeight: "100vh" }}
        >
          {htmlContent ? (
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title="Preview"
              className="w-full h-full border-0 block"
              style={{ minHeight: "100vh", display: "block" }}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center text-gray-400"
              style={{ minHeight: "50vh" }}
            >
              <div className="text-center">
                <p className="text-lg font-medium">Loading preview...</p>
                <p className="text-sm mt-2">Please wait</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
