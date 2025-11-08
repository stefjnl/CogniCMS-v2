"use client";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { ContentEditor } from "./ContentEditor";
import { PreviewPane } from "./PreviewPane";
import { ActionBar } from "./ActionBar";

export function CMSLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Action Bar */}
      <ActionBar />

      {/* Split Pane Layout */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">
          {/* Left Pane - Content Editor (40%) */}
          <Panel defaultSize={40} minSize={30} maxSize={60}>
            <ContentEditor />
          </Panel>

          {/* Resize Handle */}
          <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-blue-400 transition-colors" />

          {/* Right Pane - Preview (60%) */}
          <Panel defaultSize={60} minSize={40} maxSize={70}>
            <PreviewPane />
          </Panel>
        </PanelGroup>
      </div>
    </div>
  );
}
