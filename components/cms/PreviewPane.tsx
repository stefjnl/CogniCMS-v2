"use client";

import { useContent } from "@/lib/state/ContentContext";
import { useEffect, useState, useRef } from "react";
import { injectContentIntoHTML } from "@/lib/content/injector";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Monitor, Tablet, Smartphone, RefreshCw, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PreviewPane() {
  const {
    currentContent,
    previewDevice,
    setPreviewDevice,
    showEditableRegions,
    toggleEditableRegions,
  } = useContent();

  const [htmlContent, setHtmlContent] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Load and inject content into HTML
  useEffect(() => {
    const loadHTML = async () => {
      try {
        // Fetch the HTML template
        const response = await fetch("/sample/index.html");
        const template = await response.text();

        // Inject current content
        if (currentContent) {
          const injected = injectContentIntoHTML(template, currentContent);
          setHtmlContent(injected);
        }
      } catch (error) {
        console.error("Failed to load HTML:", error);
      }
    };

    loadHTML();
  }, [currentContent]);

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
              if (value) setPreviewDevice(value as "mobile" | "tablet" | "desktop");
            }}
            className="bg-gray-100 p-1 rounded-md"
          >
            <ToggleGroupItem value="mobile" aria-label="Mobile view" className="px-3">
              <Smartphone className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="tablet" aria-label="Tablet view" className="px-3">
              <Tablet className="w-4 h-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="desktop" aria-label="Desktop view" className="px-3">
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
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Preview Frame */}
      <div className="flex-1 overflow-auto p-6">
        <div className={`mx-auto bg-white shadow-lg ${deviceDimensions[previewDevice]}`}>
          {htmlContent ? (
            <iframe
              ref={iframeRef}
              srcDoc={htmlContent}
              title="Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
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
