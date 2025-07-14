'use client'

import {
    useEditor,
    EditorContent,
    Editor,
} from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Highlight from '@tiptap/extension-highlight'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'

// import  lowlight  from 'lowlight'

import {
    Bold, Italic, Code, LinkIcon, List, ListTodo, Heading, Type,
    Underline as UnderlineIcon, Strikethrough, Quote, AlignCenter,
    AlignLeft, AlignRight, AlignJustify, Subscript as SubIcon,
    Superscript as SuperIcon, Minus, X, HighlighterIcon, Terminal
} from 'lucide-react'

export default function TiptapEditor() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: false,
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-blue-500 underline',
                },
            }),
            Highlight.configure({
                HTMLAttributes: {
                    class: 'bg-yellow-200 dark:bg-yellow-700 px-1 rounded',
                },
            }),
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Subscript,
            Superscript,
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Placeholder.configure({
                placeholder: 'Start writing something amazing...',
            }),
            // CodeBlockLowlight.configure({
            //     lowlight,
            //     HTMLAttributes: {
            //         class: 'rounded-md bg-gray-900 p-4 font-mono text-sm text-white overflow-auto',
            //     },
            // }),
        ],
        content: '<p>Hello World!</p>',
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none ',
            },
        },
    })

    const Toolbar = ({ editor }: { editor: Editor | null }) => {
        if (!editor) return null

        const btnClass = (active: boolean) =>
            `p-2 rounded text-sm flex items-center justify-center ${active
                ? 'bg-gray-100 dark:bg-gray-700 text-blue-600 dark:text-blue-400'
                : 'text-gray-700 dark:text-gray-300'
            } hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors`

        return (
            <div className="sticky top-16 z-10 bg-white dark:bg-[#1F1F1F] border-b border-gray-200 dark:border-gray-700 py-2 flex flex-wrap gap-1">

                <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700 dark:text-white">
                    <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
                        <Bold size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
                        <Italic size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
                        <UnderlineIcon size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleStrike().run()} className={btnClass(editor.isActive('strike'))} title="Strikethrough">
                        <Strikethrough size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive('highlight'))} title="Highlight">
                        <HighlighterIcon size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
                    {[1, 2, 3].map(level => (
                        <button
                            key={level}
                            onClick={() => editor.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 }).run()}
                            className={btnClass(editor.isActive('heading', { level: level as 1 | 2 | 3 }))}
                            title={`Heading ${level}`}
                        >
                            <span className="flex items-center">
                                <Heading size={18} />
                                <span className="ml-1">{level}</span>
                            </span>
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
                    <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Bullet List">
                        <List size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Ordered List">
                        <span className="flex items-center">
                            <List size={18} />
                            <span className="ml-1 text-xs">123</span>
                        </span>
                    </button>
                    <button onClick={() => editor.chain().focus().toggleTaskList().run()} className={btnClass(editor.isActive('taskList'))} title="Task List">
                        <ListTodo size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
                    <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Blockquote">
                        <Quote size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)} title="Horizontal Rule">
                        <Minus size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                        className={btnClass(editor.isActive('codeBlock'))}
                        title="Code Block"
                    >
                        <Terminal size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleCode().run()} className={btnClass(editor.isActive('code'))} title="Inline Code">
                        <Code size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
                    <button onClick={() => editor.chain().focus().toggleSubscript().run()} className={btnClass(editor.isActive('subscript'))} title="Subscript">
                        <SubIcon size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().toggleSuperscript().run()} className={btnClass(editor.isActive('superscript'))} title="Superscript">
                        <SuperIcon size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-2 border-r border-gray-200 dark:border-gray-700">
                    <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
                        <AlignLeft size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
                        <AlignCenter size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
                        <AlignRight size={18} />
                    </button>
                    <button onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={btnClass(editor.isActive({ textAlign: 'justify' }))} title="Justify">
                        <AlignJustify size={18} />
                    </button>
                </div>

                <div className="flex items-center gap-1 px-2">
                    <button
                        onClick={() => {
                            const url = prompt('Enter URL:')
                            if (url) editor.chain().focus().setLink({ href: url }).run()
                        }}
                        className={btnClass(editor.isActive('link'))}
                        title="Add Link"
                    >
                        <LinkIcon size={18} />
                    </button>
                    <button
                        onClick={() => editor.chain().focus().unsetLink().run()}
                        className={`${btnClass(false)} ${!editor.isActive('link') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        disabled={!editor.isActive('link')}
                        title="Remove Link"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className=" rounded-xl  dark:bg-zinc-900 dark:text-white bg-white">
            <Toolbar editor={editor} />
            <div>
                <EditorContent editor={editor} className="min-h-[250px] focus:outline-none w-full dark:dark:bg-[#1F1F1F] bg-white p-4" />
            </div>
            {/* <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                    Submit
                </button>
            </div> */}
        </div>
    )
}