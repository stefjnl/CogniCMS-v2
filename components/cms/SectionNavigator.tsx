"use client";

import { useContent } from "@/lib/state/ContentContext";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sectionIcons: Record<string, string> = {
  hero: "🎯",
  "next-event": "📅",
  intro: "📝",
  facilitators: "👥",
  bijeenkomsten: "🗓️",
  newsletter: "📬",
  praktisch: "📍",
  faq: "❓",
  contact: "📧",
  footer: "🔻",
};

export function SectionNavigator() {
  const { currentContent, activeSection, setActiveSection } = useContent();

  if (!currentContent) return null;

  return (
    <div className="p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
        Content Sections
      </h2>

      <Accordion type="single" collapsible value={activeSection || undefined}>
        {currentContent.sections.map((section) => {
          const isActive = section.id === activeSection;
          const icon = sectionIcons[section.id] || "📄";

          return (
            <AccordionItem key={section.id} value={section.id} className="border-b">
              <AccordionTrigger
                onClick={() => setActiveSection(section.id)}
                className={`
                  py-3 px-2 hover:bg-gray-50 transition-colors rounded
                  ${isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700"}
                `}
              >
                <div className="flex items-center gap-3 w-full">
                  <span className="text-xl">{icon}</span>
                  <span className="flex-1 text-left text-sm">{section.label}</span>
                  {isActive && (
                    <span className="w-2 h-2 bg-blue-600 rounded-full" />
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-2 py-2 text-xs text-gray-500">
                Type: {section.type} • ID: {section.id}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
