"use client";
import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { Post } from "@prisma/client";

// โหลด ReactQuill แบบ dynamic เพื่อใช้งานบน client-side เท่านั้น
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Custom Undo และ Redo button icon component สำหรับ Quill editor
const CustomUndo = () => (
    <svg viewBox="0 0 18 18">
        <polygon className="ql-fill ql-stroke" points="6 10 4 12 2 10 6 10" />
        <path className="ql-stroke" d="M8.09,13.91A4.6,4.6,0,0,0,9,14,5,5,0,1,0,4,9" />
    </svg>
);

const CustomRedo = () => (
    <svg viewBox="0 0 18 18">
        <polygon className="ql-fill ql-stroke" points="12 10 14 12 16 10 12 10" />
        <path className="ql-stroke" d="M9.91,13.91A4.6,4.6,0,0,1,9,14a5,5,0,1,1,5-5" />
    </svg>
);

// Undo และ Redo functions สำหรับ Custom Toolbar
function undoChange(this: { quill: any }) {
    this.quill.history.undo();
}

function redoChange(this: { quill: any }) {
    this.quill.history.redo();
}

// Toolbar component สำหรับ Quill editor
const EditToolBar: React.FC = () => (
    <div id="toolbar" className="sticky top-12 z-10 bg-white">
        <div className="pt-5">
            <span className="ql-formats">
                <select className="ql-font" defaultValue="arial">
                    <option value="arial">Arial</option>
                    <option value="comic-sans">Comic Sans</option>
                    <option value="courier-new">Courier New</option>
                    <option value="georgia">Georgia</option>
                    <option value="helvetica">Helvetica</option>
                    <option value="lucida">Lucida</option>
                </select>
                <select className="ql-size" defaultValue="medium">
                    <option value="extra-small">Size 1</option>
                    <option value="small">Size 2</option>
                    <option value="medium">Size 3</option>
                    <option value="large">Size 4</option>
                </select>
                <select className="ql-header" defaultValue="3">
                    <option value="1">Heading</option>
                    <option value="2">Subheading</option>
                    <option value="3">Normal</option>
                </select>
            </span>
            <span className="ql-formats">
                <button className="ql-bold" />
                <button className="ql-italic" />
                <button className="ql-underline" />
                <button className="ql-strike" />
            </span>
            <span className="ql-formats">
                <button className="ql-list" value="ordered" />
                <button className="ql-list" value="bullet" />
                <button className="ql-indent" value="-1" />
                <button className="ql-indent" value="+1" />
            </span>
            <span className="ql-formats">
                <button className="ql-script" value="super" />
                <button className="ql-script" value="sub" />
                <button className="ql-blockquote" />
                <button className="ql-direction" />
            </span>
            <span className="ql-formats">
                <select className="ql-align" />
                <select className="ql-color" />
                <select className="ql-background" />
            </span>
            <span className="ql-formats">
                <button className="ql-link" />
                <button className="ql-image" />
                <button className="ql-video" />
            </span>
            <span className="ql-formats">
                <button className="ql-formula" />
                <button className="ql-code-block" />
                <button className="ql-clean" />
            </span>
            <span className="ql-formats">
                <button className="ql-undo">
                    <CustomUndo />
                </button>
                <button className="ql-redo">
                    <CustomRedo />
                </button>
            </span>
        </div>
    </div>
);

// Main Editor component
interface EditorProps {
    onSubmit: (content: string) => void;
    value: Post | null;
}

const Editor: React.FC<EditorProps> = ({ onSubmit, value }) => {
    useEffect(() => {
        if (typeof window !== "undefined") {
            const Quill = require("react-quill").Quill;

            // ตั้งค่า size whitelist
            const Size = Quill.import("formats/size");
            Size.whitelist = ["extra-small", "small", "medium", "large"];
            Quill.register(Size, true);

            // ตั้งค่า font whitelist
            const Font = Quill.import("formats/font");
            Font.whitelist = [
                "arial",
                "comic-sans",
                "courier-new",
                "georgia",
                "helvetica",
                "lucida",
            ];
            Quill.register(Font, true);

            // กำหนดค่า highlight.js สำหรับไฮไลต์โค้ด
            window.hljs = hljs;
        }
    }, []);

    const modules = {
        toolbar: {
            container: "#toolbar",
            handlers: {
                undo: undoChange,
                redo: redoChange,
            },
        },
        history: {
            delay: 500,
            maxStack: 100,
            userOnly: true,
        },
    };

    const formats = [
        "header",
        "font",
        "size",
        "bold",
        "italic",
        "underline",
        "align",
        "strike",
        "script",
        "blockquote",
        "background",
        "list",
        "bullet",
        "indent",
        "link",
        "image",
        "color",
        "code-block",
        "video",
    ];

    return (
        <div>
            <EditToolBar />
            <ReactQuill
                theme="snow"
                defaultValue={value?.content}
                onChange={onSubmit}
                modules={modules}
                formats={formats}
                placeholder="Start writing..."
            />
        </div>
    );
};

export default Editor;
