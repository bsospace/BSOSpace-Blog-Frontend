'use client';
import TiptapEditor from "@/app/components/TiptapEditor"
import { SimpleEditor } from "../components/tiptap-templates/simple/simple-editor"

export default function Page() {
    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 z-50">
            <SimpleEditor />
        </div>
    )
}
