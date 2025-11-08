// TypeScript interfaces for CMS content

export interface ContentMetadata {
  title: string;
  description: string;
  keywords?: string;
  lastModified: string;
}

export interface Link {
  text: string;
  url: string;
}

export interface FacilitatorMember {
  name: string;
  role: string;
  bio: string;
  photo: string;
  photoAlt: string;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  dateRaw: string | null;
  availability: string;
  reserveLink: string | null;
  featured: boolean;
}

export interface InfoItem {
  icon: string;
  label: string;
  value: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Button {
  text: string;
  link: string;
}

// Content types for different section types
export interface HeroContent {
  heading: string;
  subheading: string;
  ctaText: string;
  ctaUrl: string;
  urgencyText: string;
  logoAlt: string;
}

export interface BannerContent {
  heading: string;
  subtitle: string;
}

export interface ContentSectionContent {
  heading: string;
  paragraphs: string[];
}

export interface TeamContent {
  heading: string;
  members: FacilitatorMember[];
}

export interface EventsContent {
  heading: string;
  events: Event[];
}

export interface FormContent {
  heading: string;
  description: string;
  buttonText: string;
  privacyNote: string;
}

export interface InfoContent {
  heading: string;
  infoItems: InfoItem[];
  locationHeading: string;
  mapEmbedUrl: string;
  directionsLabel: string;
  directionsText: string;
}

export interface FAQContent {
  heading: string;
  items: FAQItem[];
}

export interface ContactContent {
  heading: string;
  description: string;
  email: string;
  buttons: Button[];
}

export interface FooterContent {
  text: string;
  email: string;
}

// Union type for all possible content types
export type SectionContent =
  | HeroContent
  | BannerContent
  | ContentSectionContent
  | TeamContent
  | EventsContent
  | FormContent
  | InfoContent
  | FAQContent
  | ContactContent
  | FooterContent;

export interface Section {
  id: string;
  label: string;
  type: "hero" | "banner" | "content" | "team" | "events" | "form" | "info" | "faq" | "contact" | "footer";
  selector: string;
  content: SectionContent;
}

export interface Assets {
  images: string[];
  links: Link[];
}

export interface ContentSchema {
  metadata: ContentMetadata;
  sections: Section[];
  assets: Assets;
}

// Selector mapping types
export interface SelectorMapping {
  path: string; // JSON path like "metadata.title" or "sections[0].content.heading"
  selector: string; // CSS selector
  attribute?: string; // For attributes like 'href', 'src', 'alt'
  type?: "text" | "html" | "attribute";
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  path: string;
  selector: string;
  message: string;
}

export interface ValidationWarning {
  path: string;
  selector: string;
  message: string;
}

// State management types
export interface AppState {
  // Content
  originalContent: ContentSchema | null;
  currentContent: ContentSchema | null;
  hasUnsavedChanges: boolean;

  // UI
  activeSection: string | null;
  previewDevice: "mobile" | "tablet" | "desktop";
  showEditableRegions: boolean;

  // Sync
  isSaving: boolean;
  lastSaved: Date | null;
  errors: string[];

  // History for undo/redo
  history: ContentSchema[];
  historyIndex: number;
}

export interface AppActions {
  loadContent: (content: ContentSchema) => void;
  updateContent: (content: ContentSchema) => void;
  updateSection: (sectionId: string, content: Partial<SectionContent>) => void;
  setActiveSection: (sectionId: string | null) => void;
  setPreviewDevice: (device: "mobile" | "tablet" | "desktop") => void;
  toggleEditableRegions: () => void;
  saveDraft: () => Promise<void>;
  revertChanges: () => void;
  undo: () => void;
  redo: () => void;
  addError: (error: string) => void;
  clearErrors: () => void;
}

// Undo/redo history entry
export interface HistoryEntry {
  content: ContentSchema;
  timestamp: Date;
  description: string;
}
