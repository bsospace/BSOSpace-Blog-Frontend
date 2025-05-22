/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import TiptapEditor from "@/app/components/TiptapEditor"
import { SimpleEditor } from "@/app/components/tiptap-templates/simple/simple-editor";
// import content from '@/app/components/tiptap-templates/simple/data/content.json';
import { useState } from "react";
import { JSONContent } from "@tiptap/react";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getnerateId } from "@/lib/utils";
export default function Page() {

    const [contentState, setContentState] = useState<JSONContent>();
    const navigate = useRouter();

    useEffect(() => {
        console.log('contentState', contentState);
    }, [contentState]);

    return (
        <div className="flex flex-col items-center justify-center w-full h-full p-4 z-50">
            <SimpleEditor
                onContentChange={setContentState}
            />
        </div>
    )
}
