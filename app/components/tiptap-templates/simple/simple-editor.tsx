import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem } from "@tiptap/extension-task-item"
import { TaskList } from "@tiptap/extension-task-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"
import { Underline } from "@tiptap/extension-underline"

// --- Custom Extensions ---
import { Link } from "@/app/components/tiptap-extension/link-extension"
import { Selection } from "@/app/components/tiptap-extension/selection-extension"
import { TrailingNode } from "@/app/components/tiptap-extension/trailing-node-extension"

// --- UI Primitives ---
import { Button } from "@/app/components/tiptap-ui-primitive/button"
import { Spacer } from "@/app/components/tiptap-ui-primitive/spacer"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/app/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/app/components/tiptap-node/image-upload-node/image-upload-node-extension"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/app/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/app/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/app/components/tiptap-ui/list-dropdown-menu"
import { NodeButton } from "@/app/components/tiptap-ui/node-button"
import {
  HighlightPopover,
  HighlightContent,
  HighlighterButton,
} from "@/app/components/tiptap-ui/highlight-popover"
import {
  LinkPopover,
  LinkContent,
  LinkButton,
} from "@/app/components/tiptap-ui/link-popover"
import { MarkButton } from "@/app/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/app/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/app/components/tiptap-ui/undo-redo-button"

// --- Icons ---
import { ArrowLeftIcon } from "@/app/components/tiptap-icons/arrow-left-icon"
import { HighlighterIcon } from "@/app/components/tiptap-icons/highlighter-icon"
import { LinkIcon } from "@/app/components/tiptap-icons/link-icon"

// --- Hooks ---
import { useMobile } from "@/app/hooks/use-mobile"
import { useWindowSize } from "@/app/hooks/use-window-size"
import { useCursorVisibility } from "@/app/hooks/use-cursor-visibility"

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from "@/app/lib/tiptap-utils"

import content from "@/app/components/tiptap-templates/simple/data/content.json"
import { Input } from "@/components/ui/input"


// Types
type MobileViewType = "main" | "highlighter" | "link"

interface PostMetadata {
  title: string
  description: string
  tags: string[]
  category: string
  publishDate: Date
  author: string
  slug: string
}

interface MainToolbarContentProps {
  onHighlighterClick: () => void
  onLinkClick: () => void
  onPublishClick: () => void
  isMobile: boolean
}

interface MobileToolbarContentProps {
  type: "highlighter" | "link"
  onBack: () => void
}

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (metadata: PostMetadata) => void
  initialData?: Partial<PostMetadata>
}

// Publish Modal Component
const PublishModal = React.memo<PublishModalProps>(({
  isOpen,
  onClose,
  onPublish,
  initialData = {}
}) => {
  const [metadata, setMetadata] = React.useState<PostMetadata>({
    title: initialData.title || '',
    description: initialData.description || '',
    tags: initialData.tags || [],
    category: initialData.category || '',
    publishDate: initialData.publishDate || new Date(),
    author: initialData.author || '',
    slug: initialData.slug || '',
  })

  const [tagInput, setTagInput] = React.useState('')
  const [isPublishing, setIsPublishing] = React.useState(false)

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!metadata.tags.includes(tagInput.trim())) {
        setMetadata(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }))
      }
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPublishing(true)

    try {
      await onPublish(metadata)
      onClose()
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const generateSlug = () => {
    const slug = metadata.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    setMetadata(prev => ({ ...prev, slug }))
  }


  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Publish Post
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Add metadata for your post before publishing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <Input />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              required
              rows={3}
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Brief description of your post"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              URL Slug *
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                required
                value={metadata.slug}
                onChange={(e) => setMetadata(prev => ({ ...prev, slug: e.target.value }))}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="post-url-slug"
              />
              <Button
                type="button"
                onClick={generateSlug}
                data-style="outline"
                className="px-3 py-2"
              >
                Generate
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              URL: /posts/{metadata.slug || 'your-slug'}
            </p>
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Author *
            </label>
            <input
              type="text"
              required
              value={metadata.author}
              onChange={(e) => setMetadata(prev => ({ ...prev, author: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Author name"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category
            </label>
            <select
              value={metadata.category}
              onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select a category</option>
              <option value="technology">Technology</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="business">Business</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Type a tag and press Enter"
            />
            {metadata.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-sm rounded-md"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Publish Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Publish Date
            </label>
            <input
              type="datetime-local"
              value={metadata.publishDate.toISOString().slice(0, 16)}
              onChange={(e) => setMetadata(prev => ({ ...prev, publishDate: new Date(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={onClose}
              data-style="ghost"
              disabled={isPublishing}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-style="default"
              disabled={isPublishing}
              className="min-w-24"
            >
              {isPublishing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                'Publish'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
})

PublishModal.displayName = "PublishModal"

// Enhanced MainToolbarContent with Publish button
const MainToolbarContent = React.memo<MainToolbarContentProps>(({
  onHighlighterClick,
  onLinkClick,
  onPublishClick,
  isMobile,
}) => {
  return (
    <>
      {/* History Controls */}
      <ToolbarGroup aria-label="History controls">
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Content Structure */}
      <ToolbarGroup aria-label="Content structure">
        <HeadingDropdownMenu levels={[1, 2, 3, 4]} />
        <ListDropdownMenu types={["bulletList", "orderedList", "taskList"]} />
        <NodeButton type="codeBlock" />
        <NodeButton type="blockquote" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Text Formatting */}
      <ToolbarGroup aria-label="Text formatting">
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <HighlightPopover />
        ) : (
          <HighlighterButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Advanced Typography */}
      {/* <ToolbarGroup aria-label="Advanced typography">
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup> */}

      <ToolbarSeparator />

      {/* Text Alignment */}
      <ToolbarGroup aria-label="Text alignment">
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      {/* Media */}
      <ToolbarGroup aria-label="Media">
        <ImageUploadButton text="Add Image" />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}

      {/* Publish Button */}
      <ToolbarGroup aria-label="Publish">
        <Button
          onClick={onPublishClick}
          data-style="default"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
          Publish
        </Button>
      </ToolbarGroup>
    </>
  )
})

MainToolbarContent.displayName = "MainToolbarContent"

// Enhanced MobileToolbarContent with better navigation
const MobileToolbarContent = React.memo<MobileToolbarContentProps>(({
  type,
  onBack,
}) => (
  <>
    <ToolbarGroup>
      <Button
        data-style="ghost"
        onClick={onBack}
        aria-label={`Go back from ${type} menu`}
      >
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === "highlighter" ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === "highlighter" ? <HighlightContent /> : <LinkContent />}
  </>
))

MobileToolbarContent.displayName = "MobileToolbarContent"

// Enhanced SimpleEditor with Publish Modal
export function SimpleEditor() {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<MobileViewType>("main")
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showPublishModal, setShowPublishModal] = React.useState(false)
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  // Enhanced editor configuration with better error handling
  const editor = useEditor({
    immediatelyRender: true,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Rich text editor. Use keyboard shortcuts or toolbar buttons to format text.",
        role: "textbox",
        "aria-multiline": "true",
        "aria-describedby": "editor-help",
      },
      handleKeyDown: (view, event) => {
        // Enhanced keyboard shortcuts
        if (event.ctrlKey || event.metaKey) {
          switch (event.key) {
            case 'z':
              if (event.shiftKey) {
                editor?.chain().focus().redo().run()
                return true
              }
              editor?.chain().focus().undo().run()
              return true
            case 's':
              event.preventDefault()
              // Add auto-save functionality here
              return true
            case 'p':
              if (event.shiftKey) {
                event.preventDefault()
                setShowPublishModal(true)
                return true
              }
              break
          }
        }
        return false
      },
    },
    extensions: [
      StarterKit.configure({
        history: {
          depth: 50, // Increased undo/redo depth
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
      Underline,
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        nested: true,
        HTMLAttributes: {
          class: 'task-item',
        },
      }),
      Highlight.configure({
        multicolor: true,
        HTMLAttributes: {
          class: 'highlight',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'editor-image',
          loading: 'lazy',
        },
      }),
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 5, // Increased limit
        upload: async (file: File) => {
          try {
            setError(null)
            const result = await handleImageUpload(file)
            return result
          } catch (uploadError) {
            const errorMessage = uploadError instanceof Error ?
              uploadError.message :
              'Failed to upload image'
            setError(errorMessage)
            throw uploadError
          }
        },
        onError: (error) => {
          console.error("Upload failed:", error)
          setError(error instanceof Error ? error.message : 'Upload failed')
        },
      }),
      TrailingNode,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'editor-link',
          rel: 'noopener noreferrer',
        },
      }),
    ],
    content: content,
    onCreate: () => {
      setIsLoading(false)
    },
  })

  const bodyRect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  })

  // Auto-reset mobile view when switching to desktop
  React.useEffect(() => {
    if (!isMobile && mobileView !== "main") {
      setMobileView("main")
    }
  }, [isMobile, mobileView])

  // Keyboard shortcuts info
  const keyboardShortcuts = React.useMemo(() => [
    { key: 'Ctrl+B', action: 'Bold' },
    { key: 'Ctrl+I', action: 'Italic' },
    { key: 'Ctrl+U', action: 'Underline' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Shift+Z', action: 'Redo' },
    { key: 'Ctrl+K', action: 'Add Link' },
    { key: 'Ctrl+Shift+P', action: 'Publish' },
  ], [])

  // Handle mobile view changes with animation
  const handleMobileViewChange = React.useCallback((view: MobileViewType) => {
    setMobileView(view)
  }, [])

  // Error dismissal
  const dismissError = React.useCallback(() => {
    setError(null)
  }, [])

  // Handle publish
  const handlePublish = React.useCallback(async (metadata: PostMetadata) => {
    if (!editor) return

    const content = editor.getHTML()
    const postData = {
      ...metadata,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    console.log('Publishing post:', postData)

    // Here you would typically send the data to your API
    // Example: await publishPost(postData)

    // Show success message
    setError(null)
    // You might want to redirect or show a success message here
  }, [editor])

  const handleShowContent = () => {
    if (editor) {
      const html = editor.getHTML()
      const json = editor.getJSON()
      console.log("HTML:", html)
      console.log("JSON:", json)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    )
  }

  return (
    <EditorContext.Provider value={{ editor }}>
      {/* Enhanced Toolbar */}
      <Toolbar
        ref={toolbarRef}
        className="transition-all duration-300 max-w-screen-xl w-full ease-out sticky top-16 z-10 bg-white dark:bg-gray-900  dark:border-gray-700 shadow-sm"
        style={
          isMobile
            ? {
              bottom: `calc(100% - ${windowSize.height - bodyRect.y}px)`,
              transform: mobileView !== "main" ? "translateY(-2px)" : "translateY(0)",
            }
            : {}
        }
      >
        {mobileView === "main" ? (
          <MainToolbarContent
            onHighlighterClick={() => handleMobileViewChange("highlighter")}
            onLinkClick={() => handleMobileViewChange("link")}
            onPublishClick={() => setShowPublishModal(true)}
            isMobile={isMobile}
          />
        ) : (
          <MobileToolbarContent
            type={mobileView === "highlighter" ? "highlighter" : "link"}
            onBack={() => handleMobileViewChange("main")}
          />
        )}
      </Toolbar>

      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {/* Error Banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-400 p-4 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              </div>
              <button
                onClick={dismissError}
                className="text-red-400 hover:text-red-600 transition-colors"
                aria-label="Dismiss error"
              >
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Hidden accessibility helper */}
        <div id="editor-help" className="sr-only">
          <p>Rich text editor with formatting options. Use the toolbar buttons or keyboard shortcuts:</p>
          <ul>
            {keyboardShortcuts.map(({ key, action }) => (
              <li key={key}>{key}: {action}</li>
            ))}
          </ul>
        </div>
        {/* Enhanced Editor Content */}
        <div className="transition-all duration-300 ease-out bg-transparent dark:bg-transparent">
          <EditorContent
            editor={editor}
            role="presentation"
            className="simple-editor-content border-none rounded-b-md select-text transition-all duration-200 ease-out focus:outline-none focus:ring-2 dark:focus:outline-none bg-transparent dark:bg-transparent"
          />
        </div>
      </div>
      <div>
        <Button
          onClick={handleShowContent}
          data-style="default"
          className="mt-4"
        >
          Show Content
        </Button>
      </div>

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handlePublish}
      />
    </EditorContext.Provider>
  )
}