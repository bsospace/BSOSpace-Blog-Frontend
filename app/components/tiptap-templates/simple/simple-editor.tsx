import * as React from "react"
import { EditorContent, EditorContext, JSONContent, useEditor } from "@tiptap/react"

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

// import content from "@/app/components/tiptap-templates/simple/data/content.json"
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

interface SimpleEditorProps {
  onContentChange: (content: JSONContent) => void;
}

// Enhanced SimpleEditor with Publish Modal
export function SimpleEditor(
  { onContentChange }: SimpleEditorProps
) {
  const isMobile = useMobile()
  const windowSize = useWindowSize()
  const [mobileView, setMobileView] = React.useState<MobileViewType>("main")
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [showPublishModal, setShowPublishModal] = React.useState(false)
  const toolbarRef = React.useRef<HTMLDivElement>(null)

  // Enhanced editor configuration with better error handling
  const editor = useEditor({
    onUpdate: ({ editor }) => {
      const json = editor.getJSON();
      onContentChange?.(json);
    },
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
          depth: 500,
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
    content: "",
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
  ], [])

  // Handle mobile view changes with animation
  const handleMobileViewChange = React.useCallback((view: MobileViewType) => {
    setMobileView(view)
  }, [])

  // Error dismissal
  const dismissError = React.useCallback(() => {
    setError(null)
  }, [])


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

      <div className="w-full min-h-[50vh] max-w-screen-xl focus:outline-none bg-white dark:bg-gray-900">
        {/* Enhanced Editor Content */}
        <EditorContent
          editor={editor}
          role="presentation"
          className="w-full border h-full min-h-[50vh]   rounded-b-md select-text transition-all duration-200 ease-out focus:outline-none focus:ring-2 dark:focus:outline-none bg-transparent dark:bg-transparent"
        />
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
    </EditorContext.Provider>
  )
}