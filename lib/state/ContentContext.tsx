"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ContentSchema, AppState, AppActions, SectionContent } from "@/types/content";
import { toast } from "sonner";

// Create context
const ContentContext = createContext<(AppState & AppActions) | null>(null);

// Provider component
export function ContentProvider({
  children,
  initialContent,
}: {
  children: React.ReactNode;
  initialContent: ContentSchema;
}) {
  const [state, setState] = useState<AppState>({
    originalContent: initialContent,
    currentContent: initialContent,
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

  // Save draft to localStorage
  const saveDraft = useCallback(async () => {
    setState((prev) => ({ ...prev, isSaving: true }));

    try {
      if (state.currentContent) {
        localStorage.setItem(
          "cognicms-draft",
          JSON.stringify(state.currentContent)
        );
        localStorage.setItem(
          "cognicms-draft-timestamp",
          new Date().toISOString()
        );

        setState((prev) => ({
          ...prev,
          isSaving: false,
          lastSaved: new Date(),
          hasUnsavedChanges: false,
        }));

        toast.success("Draft saved successfully!");
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        errors: [...prev.errors, "Failed to save draft"],
      }));
      toast.error("Failed to save draft");
    }
  }, [state.currentContent]);

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
