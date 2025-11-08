"use client";

import { useContent } from "@/lib/state/ContentContext";
import { SectionNavigator } from "./SectionNavigator";
import { EditorForm } from "./EditorForm";

export function ContentEditor() {
  const { activeSection } = useContent();

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Section Navigator */}
      <div className="flex-shrink-0 border-b">
        <SectionNavigator />
      </div>

      {/* Editor Form */}
      <div className="flex-1 overflow-y-auto">
        {activeSection ? (
          <EditorForm />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg font-medium">No section selected</p>
              <p className="text-sm mt-2">Select a section from the list above to start editing</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
