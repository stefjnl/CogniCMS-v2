"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/ThemeToggle"

export default function TestComponentsPage() {
  const [inputValue, setInputValue] = React.useState("")
  const [textareaValue, setTextareaValue] = React.useState("")
  const [isLoading, setIsLoading] = React.useState(false)
  const [buttonState, setButtonState] = React.useState<"default" | "success" | "error">("default")

  const handleLoadingClick = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setButtonState("success")
      setTimeout(() => setButtonState("default"), 2000)
    }, 2000)
  }

  const handleErrorClick = () => {
    setButtonState("error")
    setTimeout(() => setButtonState("default"), 3000)
  }

  return (
    <div className="min-h-screen bg-[color:var(--color-bg-secondary)] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[color:var(--color-text-primary)]">
              UI Components Test Page
            </h1>
            <p className="text-[color:var(--color-text-muted)] mt-2">
              Testing enhanced UI primitives with Google AI Studio-inspired styling
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Buttons Section */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Button Components</CardTitle>
            <CardDescription>
              Testing all button variants, states, and glassmorphism effects
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
            </div>

            {/* Semantic Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Semantic Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="success">Success</Button>
                <Button variant="warning">Warning</Button>
                <Button variant="info">Info</Button>
              </div>
            </div>

            {/* Glassmorphism Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Glassmorphism Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="glass">Glass</Button>
                <Button variant="glass-primary">Glass Primary</Button>
              </div>
            </div>

            {/* Subtle Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Subtle Variants</h3>
              <div className="flex flex-wrap gap-3">
                <Button variant="subtle">Subtle</Button>
                <Button variant="subtle-primary">Subtle Primary</Button>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
                <Button size="xl">Extra Large</Button>
                <Button size="icon">🚀</Button>
                <Button size="icon-sm">🔥</Button>
                <Button size="icon-lg">⭐</Button>
              </div>
            </div>

            {/* States */}
            <div>
              <h3 className="text-lg font-semibold mb-4">States</h3>
              <div className="flex flex-wrap gap-3">
                <Button loading={isLoading} onClick={handleLoadingClick}>
                  {isLoading ? "Loading..." : "Click to Load"}
                </Button>
                <Button state={buttonState} onClick={handleErrorClick}>
                  {buttonState === "error" ? "Error State" : "Trigger Error"}
                </Button>
                <Button disabled>Disabled</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Input Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Input Components</CardTitle>
            <CardDescription>
              Testing input variants, floating labels, and validation states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="basic-input">Basic Input</Label>
                <Input
                  id="basic-input"
                  placeholder="Enter text..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="disabled-input" variant="muted">
                  Disabled Input
                </Label>
                <Input
                  id="disabled-input"
                  placeholder="Disabled input"
                  disabled
                />
              </div>
            </div>

            {/* Validation States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="success-input" variant="success">
                  Success Input
                </Label>
                <Input
                  id="success-input"
                  variant="success"
                  success="This field is valid"
                  defaultValue="Valid input"
                />
              </div>
              <div>
                <Label htmlFor="error-input" variant="error">
                  Error Input
                </Label>
                <Input
                  id="error-input"
                  variant="error"
                  error="This field has an error"
                  defaultValue="Invalid input"
                />
              </div>
            </div>

            {/* With Icons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="search-input">Search Input</Label>
                <Input
                  id="search-input"
                  placeholder="Search..."
                  startIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <div>
                <Label htmlFor="email-input">Email Input</Label>
                <Input
                  id="email-input"
                  type="email"
                  placeholder="email@example.com"
                  endIcon={
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </div>

            {/* Glassmorphism */}
            <div>
              <Label htmlFor="glass-input">Glassmorphism Input</Label>
              <Input
                id="glass-input"
                variant="glass"
                placeholder="Glassmorphism input..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Textarea Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Textarea Components</CardTitle>
            <CardDescription>
              Testing textarea variants, resize options, and character counting
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Textarea */}
            <div>
              <Label htmlFor="basic-textarea">Basic Textarea</Label>
              <Textarea
                id="basic-textarea"
                placeholder="Enter your message..."
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={4}
              />
            </div>

            {/* With Character Count */}
            <div>
              <Label htmlFor="char-count-textarea">With Character Count</Label>
              <Textarea
                id="char-count-textarea"
                placeholder="Limited to 100 characters..."
                maxLength={100}
                showCharacterCount
                value={textareaValue}
                onChange={(e) => setTextareaValue(e.target.value)}
                rows={3}
              />
            </div>

            {/* Validation States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="success-textarea" variant="success">
                  Success Textarea
                </Label>
                <Textarea
                  id="success-textarea"
                  variant="success"
                  success="This field is valid"
                  defaultValue="Valid textarea content"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="error-textarea" variant="error">
                  Error Textarea
                </Label>
                <Textarea
                  id="error-textarea"
                  variant="error"
                  error="This field has an error"
                  defaultValue="Invalid textarea content"
                  rows={3}
                />
              </div>
            </div>

            {/* Resize Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="no-resize">No Resize</Label>
                <Textarea
                  id="no-resize"
                  resize="none"
                  placeholder="This textarea cannot be resized"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="horizontal-resize">Horizontal Resize</Label>
                <Textarea
                  id="horizontal-resize"
                  resize="horizontal"
                  placeholder="This textarea can be resized horizontally"
                  rows={3}
                />
              </div>
            </div>

            {/* Glassmorphism */}
            <div>
              <Label htmlFor="glass-textarea">Glassmorphism Textarea</Label>
              <Textarea
                id="glass-textarea"
                variant="glass"
                placeholder="Glassmorphism textarea..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>

        {/* Badge Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Badge Components</CardTitle>
            <CardDescription>
              Testing badge variants and sizes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="destructive">Destructive</Badge>
              </div>
            </div>

            {/* Semantic Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Semantic Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            {/* Glassmorphism Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Glassmorphism Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="glass">Glass</Badge>
                <Badge variant="glass-primary">Glass Primary</Badge>
              </div>
            </div>

            {/* Subtle Variants */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Subtle Variants</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="subtle">Subtle</Badge>
                <Badge variant="subtle-primary">Subtle Primary</Badge>
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Sizes</h3>
              <div className="flex flex-wrap items-center gap-2">
                <Badge size="sm">Small</Badge>
                <Badge size="default">Default</Badge>
                <Badge size="lg">Large</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Separator Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Separator Components</CardTitle>
            <CardDescription>
              Testing separator variants and orientations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Horizontal Separators */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Horizontal Separators</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-[color:var(--color-text-muted)]">Default</p>
                  <Separator />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--color-text-muted)]">Subtle</p>
                  <Separator variant="subtle" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--color-text-muted)]">Strong</p>
                  <Separator variant="strong" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--color-text-muted)]">Primary</p>
                  <Separator variant="primary" />
                </div>
                <div>
                  <p className="text-sm text-[color:var(--color-text-muted)]">Glass</p>
                  <Separator variant="glass" />
                </div>
              </div>
            </div>

            {/* Vertical Separators */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Vertical Separators</h3>
              <div className="flex items-center gap-4">
                <span>Item 1</span>
                <Separator orientation="vertical" className="h-8" />
                <span>Item 2</span>
                <Separator orientation="vertical" variant="subtle" className="h-8" />
                <span>Item 3</span>
                <Separator orientation="vertical" variant="glass" className="h-8" />
                <span>Item 4</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Card Components</CardTitle>
            <CardDescription>
              Testing card variants and interactive states
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Default Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Default Card</CardTitle>
                  <CardDescription>
                    This is a default card with standard styling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Card content goes here. This is the default variant.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm">Action</Button>
                </CardFooter>
              </Card>

              {/* Elevated Card */}
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Elevated Card</CardTitle>
                  <CardDescription>
                    This card has elevated styling with hover effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Hover over this card to see the elevation effect.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="outline">Action</Button>
                </CardFooter>
              </Card>

              {/* Glass Card */}
              <Card variant="glass">
                <CardHeader>
                  <CardTitle>Glass Card</CardTitle>
                  <CardDescription>
                    This card uses glassmorphism effects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    This card has a glass-like appearance with backdrop blur.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="glass">Action</Button>
                </CardFooter>
              </Card>

              {/* Interactive Card */}
              <Card variant="interactive" className="cursor-pointer">
                <CardHeader>
                  <CardTitle>Interactive Card</CardTitle>
                  <CardDescription>
                    This card is clickable and interactive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    Click or hover over this card to see interactive effects.
                  </p>
                </CardContent>
                <CardFooter>
                  <Badge variant="primary">Clickable</Badge>
                </CardFooter>
              </Card>

              {/* Outline Card */}
              <Card variant="outline">
                <CardHeader>
                  <CardTitle>Outline Card</CardTitle>
                  <CardDescription>
                    This card has an outline style
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    This card uses outline styling with minimal background.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="ghost">Action</Button>
                </CardFooter>
              </Card>

              {/* Glass Elevated Card */}
              <Card variant="glass-elevated">
                <CardHeader>
                  <CardTitle>Glass Elevated</CardTitle>
                  <CardDescription>
                    Premium glassmorphism with elevation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[color:var(--color-text-muted)]">
                    This card combines glassmorphism with elevated shadows.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button size="sm" variant="glass-primary">Action</Button>
                </CardFooter>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Responsive Design Test */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Responsive Design Test</CardTitle>
            <CardDescription>
              Testing responsive behavior across different screen sizes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 border border-[color:var(--color-border-default)] rounded-lg">
                <h4 className="font-semibold mb-2">Mobile First</h4>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  This layout adapts from mobile to desktop
                </p>
              </div>
              <div className="p-4 border border-[color:var(--color-border-default)] rounded-lg">
                <h4 className="font-semibold mb-2">Tablet</h4>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  Two columns on tablet screens
                </p>
              </div>
              <div className="p-4 border border-[color:var(--color-border-default)] rounded-lg">
                <h4 className="font-semibold mb-2">Desktop</h4>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  Four columns on desktop screens
                </p>
              </div>
              <div className="p-4 border border-[color:var(--color-border-default)] rounded-lg">
                <h4 className="font-semibold mb-2">Responsive</h4>
                <p className="text-sm text-[color:var(--color-text-muted)]">
                  All components are fully responsive
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}