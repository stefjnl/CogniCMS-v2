"use client";

import { Button } from "@/components/ui/button";
import { useContent } from "@/lib/state/ContentContext";
import { Save, RotateCcw, Upload, Clock, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function ActionBar() {
  const {
    hasUnsavedChanges,
    isSaving,
    lastSaved,
    saveDraft,
    revertChanges,
    historyIndex,
    history,
  } = useContent();

  const router = useRouter();
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleLogout = () => {
    localStorage.removeItem("cms-auth");
    router.push("/login");
  };

  return (
    <div className="border-b bg-white px-6 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-800">CogniCMS</h1>

        {/* Change indicator */}
        {hasUnsavedChanges && (
          <span className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-orange-600 rounded-full animate-pulse" />
            Unsaved changes
          </span>
        )}

        {/* Last saved indicator */}
        {lastSaved && !hasUnsavedChanges && (
          <span className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <Clock className="w-4 h-4" />
            Saved {formatTimeSince(lastSaved)}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Undo/Redo indicators */}
        <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-md">
          <kbd className="px-1.5 py-0.5 bg-white border rounded text-xs">
            ⌘Z
          </kbd>
          <span>Undo</span>
          <span className={canUndo ? "text-green-600" : "text-gray-400"}>
            {canUndo ? "✓" : "—"}
          </span>
        </div>

        {/* Action Buttons */}
        <Button
          variant="outline"
          size="sm"
          onClick={revertChanges}
          disabled={!hasUnsavedChanges}
          className="gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Revert
        </Button>

        <Button
          variant="default"
          size="sm"
          onClick={saveDraft}
          disabled={isSaving || !hasUnsavedChanges}
          className="gap-2 bg-[#c89b5f] hover:bg-[#b88b4f]"
        >
          <Upload className="w-4 h-4" />
          {isSaving ? "Publishing..." : "Publish to GitHub"}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="gap-2"
          title="Logout"
          aria-label="Logout"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function formatTimeSince(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
