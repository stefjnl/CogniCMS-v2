"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  ContentSchema,
  AppState,
  AppActions,
  SectionContent,
} from "@/types/content";
import { toast } from "sonner";

// Create context
const ContentContext = createContext<(AppState & AppActions) | null>(null);

// Extended state interface to include HTML and SHA
interface ExtendedAppState extends AppState {
  originalHtml?: string;
  currentHtml?: string;
  sha?: {
    html: string;
    content: string;
  };
}

// Provider component
export function ContentProvider({
  children,
  initialContent,
  initialHtml,
  initialSha,
}: {
  children: React.ReactNode;
  initialContent: ContentSchema;
  initialHtml?: string;
  initialSha?: { html: string; content: string };
}) {
  const [state, setState] = useState<ExtendedAppState>({
    originalContent: initialContent,
    currentContent: initialContent,
    originalHtml: initialHtml,
    currentHtml: initialHtml,
    sha: initialSha,
    hasUnsavedChanges: false,
    activeSection: null,
    previewDevice: "desktop",
    showEditableRegions: true,
    isSaving: false,
    lastSaved: null,
    errors: [],
    history: [initialContent],
    historyIndex: 0,
  });

  // Load content
  const loadContent = useCallback((content: ContentSchema) => {
    setState((prev) => ({
      ...prev,
      originalContent: content,
      currentContent: content,
      history: [content],
      historyIndex: 0,
      hasUnsavedChanges: false,
    }));
  }, []);

  // Update content
  const updateContent = useCallback((content: ContentSchema) => {
    setState((prev) => {
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(content);

      return {
        ...prev,
        currentContent: content,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        hasUnsavedChanges: true,
      };
    });
  }, []);

  // Update specific section
  const updateSection = useCallback(
    (sectionId: string, newContent: Partial<SectionContent>) => {
      setState((prev) => {
        if (!prev.currentContent) return prev;

        const updatedSections = prev.currentContent.sections.map((section) => {
          if (section.id === sectionId) {
            return {
              ...section,
              content: { ...section.content, ...newContent },
            };
          }
          return section;
        });

        const updatedContentSchema: ContentSchema = {
          ...prev.currentContent,
          sections: updatedSections,
        };

        // Add to history
        const newHistory = prev.history.slice(0, prev.historyIndex + 1);
        newHistory.push(updatedContentSchema);

        return {
          ...prev,
          currentContent: updatedContentSchema,
          history: newHistory,
          historyIndex: newHistory.length - 1,
          hasUnsavedChanges: true,
        };
      });
    },
    []
  );

  // Set active section
  const setActiveSection = useCallback((sectionId: string | null) => {
    setState((prev) => ({ ...prev, activeSection: sectionId }));
  }, []);

  // Set preview device
  const setPreviewDevice = useCallback(
    (device: "mobile" | "tablet" | "desktop") => {
      setState((prev) => ({ ...prev, previewDevice: device }));
    },
    []
  );

  // Toggle editable regions
  const toggleEditableRegions = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showEditableRegions: !prev.showEditableRegions,
    }));
  }, []);

  // Save to GitHub
  const saveDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      if (state.currentContent) {
        // Always save to localStorage first for quick recovery
        localStorage.setItem(
          "cognicms-draft",
          JSON.stringify(state.currentContent)
        );
        if (state.originalHtml) {
          localStorage.setItem("cognicms-draft-html", state.originalHtml);
        }
        if (state.sha) {
          localStorage.setItem("cognicms-draft-sha", JSON.stringify(state.sha));
        }
        localStorage.setItem(
          "cognicms-draft-timestamp",
          new Date().toISOString()
        );

        // Check if we have GitHub integration (SHA means we loaded from GitHub)
        if (!state.sha || !state.originalHtml) {
          // No GitHub integration - just save to localStorage
          setState((prev) => ({
            ...prev,
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
            originalContent: state.currentContent!,
          }));
          toast.info("Draft saved locally (GitHub not configured)");
          console.log("No GitHub SHA - saving to localStorage only");
          return;
        }

        // Save to GitHub
        console.log("Saving to GitHub with SHA:", state.sha);
        const response = await fetch("/api/content/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: state.currentContent,
            html: state.originalHtml,
            htmlSha: state.sha.html,
            contentSha: state.sha.content,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to save to GitHub");
        }

        console.log("GitHub save successful, reloading content...");

        // Reload content to get new SHAs
        const loadResponse = await fetch("/api/content/load");
        if (loadResponse.ok) {
          const newData = await loadResponse.json();
          setState((prev) => ({
            ...prev,
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
            originalContent: state.currentContent!,
            originalHtml: newData.html,
            sha: newData.sha,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            isSaving: false,
            lastSaved: new Date(),
            hasUnsavedChanges: false,
            originalContent: state.currentContent!,
          }));
        }

        toast.success("Changes published to GitHub!");
        console.log("Content published to GitHub successfully");
      }
    } catch (error) {
      console.error("Error saving:", error);
      setState((prev) => ({
        ...prev,
        isSaving: false,
        errors: [
          ...prev.errors,
          error instanceof Error ? error.message : "Failed to save",
        ],
      }));
      toast.error(
        error instanceof Error ? error.message : "Failed to save changes"
      );
    }
  }, [state.currentContent, state.originalHtml, state.sha]);

  // Revert changes
  const revertChanges = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentContent: prev.originalContent,
      history: prev.originalContent ? [prev.originalContent] : [],
      historyIndex: 0,
      hasUnsavedChanges: false,
    }));
    toast.info("Changes reverted");
  }, []);

  // Undo
  const undo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex > 0) {
        const newIndex = prev.historyIndex - 1;
        return {
          ...prev,
          currentContent: prev.history[newIndex],
          historyIndex: newIndex,
          hasUnsavedChanges: newIndex !== 0,
        };
      }
      return prev;
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setState((prev) => {
      if (prev.historyIndex < prev.history.length - 1) {
        const newIndex = prev.historyIndex + 1;
        return {
          ...prev,
          currentContent: prev.history[newIndex],
          historyIndex: newIndex,
          hasUnsavedChanges: true,
        };
      }
      return prev;
    });
  }, []);

  // Add error
  const addError = useCallback((error: string) => {
    setState((prev) => ({
      ...prev,
      errors: [...prev.errors, error],
    }));
  }, []);

  // Clear errors
  const clearErrors = useCallback(() => {
    setState((prev) => ({ ...prev, errors: [] }));
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!state.hasUnsavedChanges) return;

    const autoSaveTimer = setTimeout(() => {
      saveDraft();
    }, 30000);

    return () => clearTimeout(autoSaveTimer);
  }, [state.hasUnsavedChanges, state.currentContent, saveDraft]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e: KeyboardEvent) => {
      // Cmd/Ctrl + Z for undo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Cmd/Ctrl + Shift + Z for redo
      if ((e.metaKey || e.ctrlKey) && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
      }
      // Cmd/Ctrl + S for save
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveDraft();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [undo, redo, saveDraft]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (state.hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [state.hasUnsavedChanges]);

  const value = {
    ...state,
    loadContent,
    updateContent,
    updateSection,
    setActiveSection,
    setPreviewDevice,
    toggleEditableRegions,
    saveDraft,
    revertChanges,
    undo,
    redo,
    addError,
    clearErrors,
  };

  return (
    <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
  );
}

// Hook to use content context
export function useContent() {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error("useContent must be used within ContentProvider");
  }
  return context;
}
