"use client";

import { useContent } from "@/lib/state/ContentContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "./RichTextEditor";
import {
  HeroContent,
  BannerContent,
  ContentSectionContent,
  TeamContent,
  EventsContent,
  FormContent,
  InfoContent,
  FAQContent,
  ContactContent,
  FooterContent,
} from "@/types/content";

export function EditorForm() {
  const { currentContent, activeSection, updateSection } = useContent();

  if (!currentContent || !activeSection) return null;

  const section = currentContent.sections.find((s) => s.id === activeSection);
  if (!section) return null;

  const handleChange = (field: string, value: any) => {
    updateSection(activeSection, { [field]: value } as any);
  };

  const handleNestedChange = (field: string, index: number, subfield: string, value: any) => {
    const currentArray = (section.content as any)[field] || [];
    const updatedArray = [...currentArray];
    updatedArray[index] = {
      ...updatedArray[index],
      [subfield]: value,
    };
    updateSection(activeSection, { [field]: updatedArray } as any);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-2xl font-semibold text-gray-800">{section.label}</h2>
        <p className="text-sm text-gray-500 mt-1">
          Section Type: <span className="font-mono bg-gray-100 px-2 py-0.5 rounded">{section.type}</span>
        </p>
      </div>

      {/* Dynamic form fields based on section type */}
      {section.type === "hero" && <HeroEditor content={section.content as HeroContent} onChange={handleChange} />}
      {section.type === "banner" && <BannerEditor content={section.content as BannerContent} onChange={handleChange} />}
      {section.type === "content" && <ContentEditor content={section.content as ContentSectionContent} onChange={handleChange} />}
      {section.type === "team" && <TeamEditor content={section.content as TeamContent} onChange={handleChange} onNestedChange={handleNestedChange} />}
      {section.type === "events" && <EventsEditor content={section.content as EventsContent} onChange={handleChange} onNestedChange={handleNestedChange} />}
      {section.type === "form" && <FormEditor content={section.content as FormContent} onChange={handleChange} />}
      {section.type === "info" && <InfoEditor content={section.content as InfoContent} onChange={handleChange} onNestedChange={handleNestedChange} />}
      {section.type === "faq" && <FAQEditor content={section.content as FAQContent} onChange={handleChange} onNestedChange={handleNestedChange} />}
      {section.type === "contact" && <ContactEditor content={section.content as ContactContent} onChange={handleChange} />}
      {section.type === "footer" && <FooterEditor content={section.content as FooterContent} onChange={handleChange} />}
    </div>
  );
}

// Individual editor components for each type
function HeroEditor({ content, onChange }: { content: HeroContent; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="subheading">Subheading</Label>
        <Input
          id="subheading"
          value={content.subheading}
          onChange={(e) => onChange("subheading", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="ctaText">CTA Button Text</Label>
        <Input
          id="ctaText"
          value={content.ctaText}
          onChange={(e) => onChange("ctaText", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="urgencyText">Urgency Text</Label>
        <Input
          id="urgencyText"
          value={content.urgencyText}
          onChange={(e) => onChange("urgencyText", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function BannerEditor({ content, onChange }: { content: BannerContent; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={content.subtitle}
          onChange={(e) => onChange("subtitle", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function ContentEditor({ content, onChange }: { content: ContentSectionContent; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      {content.paragraphs && content.paragraphs.map((para, index) => (
        <div key={index}>
          <Label htmlFor={`paragraph-${index}`}>Paragraph {index + 1}</Label>
          <Textarea
            id={`paragraph-${index}`}
            value={para}
            onChange={(e) => {
              const updated = [...content.paragraphs];
              updated[index] = e.target.value;
              onChange("paragraphs", updated);
            }}
            className="mt-1 min-h-[100px]"
          />
        </div>
      ))}
    </div>
  );
}

function TeamEditor({
  content,
  onChange,
  onNestedChange,
}: {
  content: TeamContent;
  onChange: (field: string, value: any) => void;
  onNestedChange: (field: string, index: number, subfield: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      {content.members && content.members.map((member, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="font-semibold text-sm text-gray-700">Team Member {index + 1}</h4>
          <div>
            <Label htmlFor={`member-${index}-name`}>Name</Label>
            <Input
              id={`member-${index}-name`}
              value={member.name}
              onChange={(e) => onNestedChange("members", index, "name", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`member-${index}-role`}>Role</Label>
            <Input
              id={`member-${index}-role`}
              value={member.role}
              onChange={(e) => onNestedChange("members", index, "role", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`member-${index}-bio`}>Bio</Label>
            <Textarea
              id={`member-${index}-bio`}
              value={member.bio}
              onChange={(e) => onNestedChange("members", index, "bio", e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EventsEditor({
  content,
  onChange,
  onNestedChange,
}: {
  content: EventsContent;
  onChange: (field: string, value: any) => void;
  onNestedChange: (field: string, index: number, subfield: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      {content.events && content.events.map((event, index) => (
        <div key={event.id} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="font-semibold text-sm text-gray-700">Event {index + 1}</h4>
          <div>
            <Label htmlFor={`event-${index}-title`}>Title</Label>
            <Input
              id={`event-${index}-title`}
              value={event.title}
              onChange={(e) => onNestedChange("events", index, "title", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`event-${index}-date`}>Date</Label>
            <Input
              id={`event-${index}-date`}
              value={event.date}
              onChange={(e) => onNestedChange("events", index, "date", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`event-${index}-availability`}>Availability Status</Label>
            <Input
              id={`event-${index}-availability`}
              value={event.availability}
              onChange={(e) => onNestedChange("events", index, "availability", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FormEditor({ content, onChange }: { content: FormContent; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={content.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="privacyNote">Privacy Note</Label>
        <Input
          id="privacyNote"
          value={content.privacyNote}
          onChange={(e) => onChange("privacyNote", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function InfoEditor({
  content,
  onChange,
  onNestedChange,
}: {
  content: InfoContent;
  onChange: (field: string, value: any) => void;
  onNestedChange: (field: string, index: number, subfield: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      {content.infoItems && content.infoItems.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="font-semibold text-sm text-gray-700">Info Item {index + 1}</h4>
          <div>
            <Label htmlFor={`info-${index}-label`}>Label</Label>
            <Input
              id={`info-${index}-label`}
              value={item.label}
              onChange={(e) => onNestedChange("infoItems", index, "label", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`info-${index}-value`}>Value</Label>
            <Textarea
              id={`info-${index}-value`}
              value={item.value}
              onChange={(e) => onNestedChange("infoItems", index, "value", e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function FAQEditor({
  content,
  onChange,
  onNestedChange,
}: {
  content: FAQContent;
  onChange: (field: string, value: any) => void;
  onNestedChange: (field: string, index: number, subfield: string, value: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      {content.items && content.items.map((item, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
          <h4 className="font-semibold text-sm text-gray-700">FAQ {index + 1}</h4>
          <div>
            <Label htmlFor={`faq-${index}-question`}>Question</Label>
            <Input
              id={`faq-${index}-question`}
              value={item.question}
              onChange={(e) => onNestedChange("items", index, "question", e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor={`faq-${index}-answer`}>Answer</Label>
            <Textarea
              id={`faq-${index}-answer`}
              value={item.answer}
              onChange={(e) => onNestedChange("items", index, "answer", e.target.value)}
              className="mt-1 min-h-[80px]"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactEditor({ content, onChange }: { content: ContactContent; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="heading">Heading</Label>
        <Input
          id="heading"
          value={content.heading}
          onChange={(e) => onChange("heading", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={content.description}
          onChange={(e) => onChange("description", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={content.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}

function FooterEditor({ content, onChange }: { content: FooterContent; onChange: (field: string, value: any) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="text">Footer Text</Label>
        <Input
          id="text"
          value={content.text}
          onChange={(e) => onChange("text", e.target.value)}
          className="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          value={content.email}
          onChange={(e) => onChange("email", e.target.value)}
          className="mt-1"
        />
      </div>
    </div>
  );
}
