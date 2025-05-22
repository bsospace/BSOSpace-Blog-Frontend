import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"

// --- Hooks ---
import { useMenuNavigation } from "@/app/hooks/use-menu-navigation"
import { useTiptapEditor } from "@/app/hooks/use-tiptap-editor"

// --- Icons ---
import { BanIcon } from "@/app/components/tiptap-icons/ban-icon"
import { HighlighterIcon } from "@/app/components/tiptap-icons/highlighter-icon"

// --- Lib ---
import { isMarkInSchema } from "@/app/lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "@/app/components/tiptap-ui-primitive/button"
import { Button } from "@/app/components/tiptap-ui-primitive/button"
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/app/components/tiptap-ui-primitive/popover"
import { Separator } from "@/app/components/tiptap-ui-primitive/separator"

// --- Tiptap UI ---
import {
  HighlightButton,
  canToggleHighlight,
} from "@/app/components/tiptap-ui/highlight-button"


export interface HighlightColor {
  label: string
  value: string
  border?: string
}

export interface HighlightContentProps {
  editor?: Editor | null
  colors?: HighlightColor[]
  onClose?: () => void
}

export interface HighlightPopoverProps extends Omit<ButtonProps, "type"> {
  /** The TipTap editor instance. */
  editor?: Editor | null
  /** The highlight colors to display in the popover. */
  colors?: HighlightColor[]
  /** Whether to hide the highlight popover when unavailable. */
  hideWhenUnavailable?: boolean
}

export const DEFAULT_HIGHLIGHT_COLORS: HighlightColor[] = [
  {
    label: "Green",
    value: "var(--tt-highlight-green)",
    border: "var(--tt-highlight-green-contrast)",
  },
  {
    label: "Blue",
    value: "var(--tt-highlight-blue)",
    border: "var(--tt-highlight-blue-contrast)",
  },
  {
    label: "Red",
    value: "var(--tt-highlight-red)",
    border: "var(--tt-highlight-red-contrast)",
  },
  {
    label: "Purple",
    value: "var(--tt-highlight-purple)",
    border: "var(--tt-highlight-purple-contrast)",
  },
  {
    label: "Yellow",
    value: "var(--tt-highlight-yellow)",
    border: "var(--tt-highlight-yellow-contrast)",
  },
]

export const HighlighterButton = React.forwardRef<
  HTMLButtonElement,
  ButtonProps
>(({ className, children, ...props }, ref) => (
  <Button
    type="button"
    className={className}
    data-style="ghost"
    data-appearance="default"
    role="button"
    tabIndex={-1}
    aria-label="Highlight text"
    tooltip="Highlight"
    ref={ref}
    {...props}
  >
    {children || <HighlighterIcon className="tiptap-button-icon" />}
  </Button>
))

HighlighterButton.displayName = "HighlighterButton"

export function HighlightContent({
  editor: providedEditor,
  colors = DEFAULT_HIGHLIGHT_COLORS,
  onClose,
}: HighlightContentProps) {
  const editor = useTiptapEditor(providedEditor)
  const containerRef = React.useRef<HTMLDivElement>(null)

  const removeHighlight = React.useCallback(() => {
    if (!editor) return
    editor.chain().focus().unsetMark("highlight").run()
    onClose?.()
  }, [editor, onClose])

  const menuItems = React.useMemo(
    () => [...colors, { label: "Remove highlight", value: "none" }],
    [colors]
  )

  const { selectedIndex } = useMenuNavigation({
    containerRef,
    items: menuItems,
    orientation: "both",
    onSelect: (item) => {
      if (item.value === "none") {
        removeHighlight()
      }
      onClose?.()
    },
    onClose,
    autoSelectFirstItem: false,
  })

  return (
    <div ref={containerRef} className="tiptap-highlight-content" tabIndex={0}>
      <div className="tiptap-button-group" data-orientation="horizontal">
        {colors.map((color, index) => (
          <HighlightButton
            key={color.value}
            editor={editor}
            color={color.value}
            aria-label={`${color.label} highlight color`}
            tabIndex={index === selectedIndex ? 0 : -1}
            data-highlighted={selectedIndex === index}
            onClick={onClose}
          />
        ))}
      </div>

      <Separator />

      <div className="tiptap-button-group">
        <Button
          onClick={removeHighlight}
          aria-label="Remove highlight"
          tabIndex={selectedIndex === colors.length ? 0 : -1}
          type="button"
          role="menuitem"
          data-style="ghost"
          data-highlighted={selectedIndex === colors.length}
        >
          <BanIcon className="tiptap-button-icon" />
        </Button>
      </div>
    </div>
  )
}

export function HighlightPopover({
  editor: providedEditor,
  colors = DEFAULT_HIGHLIGHT_COLORS,
  hideWhenUnavailable = false,
  ...props
}: HighlightPopoverProps) {
  const editor = useTiptapEditor(providedEditor)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isDisabled, setIsDisabled] = React.useState(false)

  const markAvailable = isMarkInSchema("highlight", editor)

  React.useEffect(() => {
    if (!editor) return

    const updateIsDisabled = () => {
      let isDisabled = false

      if (!markAvailable || !editor) {
        isDisabled = true
      }

      const isInCompatibleContext =
        editor.isActive("code") ||
        editor.isActive("codeBlock") ||
        editor.isActive("imageUpload")

      if (isInCompatibleContext) {
        isDisabled = true
      }

      setIsDisabled(isDisabled)
    }

    editor.on("selectionUpdate", updateIsDisabled)
    editor.on("update", updateIsDisabled)

    return () => {
      editor.off("selectionUpdate", updateIsDisabled)
      editor.off("update", updateIsDisabled)
    }
  }, [editor, markAvailable])

  const isActive = editor?.isActive("highlight") ?? false

  const shouldShow = React.useMemo(() => {
    if (!hideWhenUnavailable || !editor) return true

    return !(
      isNodeSelection(editor.state.selection) || !canToggleHighlight(editor)
    )
  }, [hideWhenUnavailable, editor])

  if (!shouldShow || !editor || !editor.isEditable) {
    return null
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <HighlighterButton
          disabled={isDisabled}
          data-active-state={isActive ? "on" : "off"}
          data-disabled={isDisabled}
          aria-pressed={isActive}
          {...props}
        />
      </PopoverTrigger>

      <PopoverContent aria-label="Highlight colors">
        <HighlightContent
          editor={editor}
          colors={colors}
          onClose={() => setIsOpen(false)}
        />
      </PopoverContent>
    </Popover>
  )
}

export default HighlightPopover
