import * as React from "react"
import { isNodeSelection, type Editor } from "@tiptap/react"
import type { Node } from "@tiptap/pm/model"

// --- Hooks ---
import { useTiptapEditor } from "@/app/hooks/use-tiptap-editor"

// --- Lib ---
import {
  findNodePosition,
  isEmptyNode,
  isMarkInSchema,
} from "@/app/lib/tiptap-utils"

// --- UI Primitives ---
import type { ButtonProps } from "@/app/components/tiptap-ui-primitive/button"
import { Button } from "@/app/components/tiptap-ui-primitive/button"


export const HIGHLIGHT_COLORS = [
  {
    label: "Default background",
    value: "var(--tt-bg-color)",
    border: "var(--tt-bg-color-contrast)",
  },
  {
    label: "Gray background",
    value: "var(--tt-highlight-gray)",
    border: "var(--tt-highlight-gray-contrast)",
  },
  {
    label: "Brown background",
    value: "var(--tt-highlight-brown)",
    border: "var(--tt-highlight-brown-contrast)",
  },
  {
    label: "Orange background",
    value: "var(--tt-highlight-orange)",
    border: "var(--tt-highlight-orange-contrast)",
  },
  {
    label: "Yellow background",
    value: "var(--tt-highlight-yellow)",
    border: "var(--tt-highlight-yellow-contrast)",
  },
  {
    label: "Green background",
    value: "var(--tt-highlight-green)",
    border: "var(--tt-highlight-green-contrast)",
  },
  {
    label: "Blue background",
    value: "var(--tt-highlight-blue)",
    border: "var(--tt-highlight-blue-contrast)",
  },
  {
    label: "Purple background",
    value: "var(--tt-highlight-purple)",
    border: "var(--tt-highlight-purple-contrast)",
  },
  {
    label: "Pink background",
    value: "var(--tt-highlight-pink)",
    border: "var(--tt-highlight-pink-contrast)",
  },
  {
    label: "Red background",
    value: "var(--tt-highlight-red)",
    border: "var(--tt-highlight-red-contrast)",
  },
]

export interface HighlightButtonProps extends Omit<ButtonProps, "type"> {
  /**
   * The TipTap editor instance.
   */
  editor?: Editor | null
  /**
   * The node to apply highlight to
   */
  node?: Node | null
  /**
   * The position of the node in the document
   */
  nodePos?: number | null
  /**
   * The color to apply when toggling the highlight.
   * If not provided, it will use the default color from the extension.
   */
  color: string
  /**
   * Optional text to display alongside the icon.
   */
  text?: string
  /**
   * Whether the button should hide when the mark is not available.
   * @default false
   */
  hideWhenUnavailable?: boolean
  /**
   * Called when the highlight is applied.
   */
  onApplied?: (color: string) => void
}

/**
 * Checks if highlight can be toggled in the current editor state
 */
export function canToggleHighlight(editor: Editor | null): boolean {
  if (!editor) return false
  try {
    return editor.can().setMark("highlight")
  } catch {
    return false
  }
}

/**
 * Checks if highlight is active in the current selection
 */
export function isHighlightActive(
  editor: Editor | null,
  color: string
): boolean {
  if (!editor) return false
  return editor.isActive("highlight", { color })
}

/**
 * Toggles highlight on the current selection or specified node
 */
export function toggleHighlight(
  editor: Editor | null,
  color: string,
  node?: Node | null,
  nodePos?: number | null
): void {
  if (!editor) return

  try {
    const chain = editor.chain().focus()

    if (isEmptyNode(node)) {
      chain.toggleMark("highlight", { color }).run()
    } else if (nodePos !== undefined && nodePos !== null && nodePos !== -1) {
      chain.setNodeSelection(nodePos).toggleMark("highlight", { color }).run()
    } else if (node) {
      const foundPos = findNodePosition({ editor, node })
      if (foundPos) {
        chain
          .setNodeSelection(foundPos.pos)
          .toggleMark("highlight", { color })
          .run()
      } else {
        chain.toggleMark("highlight", { color }).run()
      }
    } else {
      chain.toggleMark("highlight", { color }).run()
    }

    editor.chain().setMeta("hideDragHandle", true).run()
  } catch (error) {
    console.error("Failed to apply highlight:", error)
  }
}

/**
 * Determines if the highlight button should be disabled
 */
export function isHighlightButtonDisabled(
  editor: Editor | null,
  userDisabled: boolean = false
): boolean {
  if (!editor || userDisabled) return true

  const isIncompatibleContext =
    editor.isActive("code") ||
    editor.isActive("codeBlock") ||
    editor.isActive("imageUpload")

  return isIncompatibleContext || !canToggleHighlight(editor)
}

/**
 * Determines if the highlight button should be shown
 */
export function shouldShowHighlightButton(
  editor: Editor | null,
  hideWhenUnavailable: boolean,
  highlightInSchema: boolean
): boolean {
  if (!highlightInSchema || !editor) return false

  if (hideWhenUnavailable) {
    if (
      isNodeSelection(editor.state.selection) ||
      !canToggleHighlight(editor)
    ) {
      return false
    }
  }

  return true
}

/**
 * Custom hook to manage highlight button state
 */
export function useHighlightState(
  editor: Editor | null,
  color: string,
  disabled: boolean = false,
  hideWhenUnavailable: boolean = false
) {
  const highlightInSchema = isMarkInSchema("highlight", editor)
  const isDisabled = isHighlightButtonDisabled(editor, disabled)
  const isActive = isHighlightActive(editor, color)

  const shouldShow = React.useMemo(
    () =>
      shouldShowHighlightButton(editor, hideWhenUnavailable, highlightInSchema),
    [editor, hideWhenUnavailable, highlightInSchema]
  )

  return {
    highlightInSchema,
    isDisabled,
    isActive,
    shouldShow,
  }
}

/**
 * HighlightButton component for TipTap editor
 */
export const HighlightButton = React.forwardRef<
  HTMLButtonElement,
  HighlightButtonProps
>(
  (
    {
      editor: providedEditor,
      node,
      nodePos,
      color,
      text,
      hideWhenUnavailable = false,
      className = "",
      disabled,
      onClick,
      onApplied,
      children,
      style,
      ...buttonProps
    },
    ref
  ) => {
    const editor = useTiptapEditor(providedEditor)
    const { isDisabled, isActive, shouldShow } = useHighlightState(
      editor,
      color,
      disabled,
      hideWhenUnavailable
    )

    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(e)

        if (!e.defaultPrevented && !isDisabled && editor) {
          toggleHighlight(editor, color, node, nodePos)
          onApplied?.(color)
        }
      },
      [color, editor, isDisabled, node, nodePos, onClick, onApplied]
    )

    const buttonStyle = React.useMemo(
      () =>
        ({
          ...style,
          "--highlight-color": color,
        }) as React.CSSProperties,
      [color, style]
    )

    if (!shouldShow || !editor || !editor.isEditable) {
      return null
    }

    return (
      <Button
        type="button"
        className={className.trim()}
        disabled={isDisabled}
        data-style="ghost"
        data-active-state={isActive ? "on" : "off"}
        data-disabled={isDisabled}
        role="button"
        tabIndex={-1}
        aria-label={`${color} highlight color`}
        aria-pressed={isActive}
        onClick={handleClick}
        style={buttonStyle}
        {...buttonProps}
        ref={ref}
      >
        {children || (
          <>
            <span
              className="tiptap-button-highlight"
              style={{ "--highlight-color": color } as React.CSSProperties}
            />
            {text && <span className="tiptap-button-text">{text}</span>}
          </>
        )}
      </Button>
    )
  }
)

HighlightButton.displayName = "HighlightButton"

export default HighlightButton
