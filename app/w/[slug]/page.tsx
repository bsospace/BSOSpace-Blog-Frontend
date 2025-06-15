/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { useState, useEffect } from "react";
import { JSONContent } from "@tiptap/react";
import { useRouter } from 'next/navigation';
import { use } from "react";
import { useToast } from '@/hooks/use-toast';

// Components
import { SimpleEditor } from "@/app/components/tiptap-templates/simple/simple-editor";
import { PostStatusHeader } from "../components/post-status-header";
import { PublishModal } from "../components/publish-modal";
import NewUserModal from "@/app/components/NewUserModal";
import Loading from "@/app/components/Loading";

// Utils
import { axiosInstance } from "@/app/utils/api";
import { getnerateId } from "@/lib/utils";
import { generateHtmlFromContent } from "@/app/components/tiptap-templates/simple/generate-html";
import { Post, PostStatus } from '../../interfaces/index';
import { PreviewEditor } from "@/app/components/tiptap-templates/simple/view-editor";
import { useWebSocket } from "@/app/contexts/use-web-socket";


type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type PublishStatus = 'idle' | 'publishing' | 'published' | 'error';

interface Metadata {
    title: string;
    description: string;
    tags: string[];
    category: string;
    thumbnail: string;
    featured: boolean;
    publishDate: string;
    author: string;
    slug: string;
}

export default function EditPost({ params }: { params: Promise<{ slug: string }> }) {
    // State management
    const [post, setPost] = useState<Post | null>(null);
    const [contentState, setContentState] = useState<JSONContent>();
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [isLoadingOldContent, setIsLoadingOldContent] = useState(true);
    const [metadata, setMetadata] = useState<Metadata>({
        title: '',
        description: '',
        tags: [],
        category: '',
        thumbnail: '',
        featured: false,
        publishDate: new Date().toISOString().split('T')[0],
        author: '',
        slug: ''
    });

    const { slug } = use(params);
    const { toast } = useToast();

    // Status helpers
    const canAutoSave = () => {
        return post?.status === 'DRAFT' || post?.status === 'REJECTED';
    };

    const canManualEdit = () => {
        return post?.status !== 'PROCESSING';
    };

    const isPublished = () => {
        return post?.status === 'PUBLISHED';
    };

    // API calls
    const saveContent = async (isManualSave = false) => {
        if (!canManualEdit() && !isManualSave) return;

        try {
            setSaveStatus('saving');

            const response = await axiosInstance.post('/posts', {
                short_slug: slug,
                content: contentState,
                title: metadata.title,
            });

            if (response.status === 201) {
                setSaveStatus('saved');
                setLastSaved(new Date());

                console.log('Content saved successfully:', response.data);
                setMetadata(prev => ({
                    ...prev,
                    id: response.data.data.post_id,
                }));

                localStorage.setItem('pid', response.data.data.post_id);

                setTimeout(() => {
                    if (!isPublished()) {
                        setSaveStatus('idle');
                    }
                }, 2000);
            } else {
                throw new Error('Failed to save content');
            }

        } catch (error) {
            setSaveStatus('error');
            console.error('Error saving content:', error);
        }
    };

    const getPostByShortSlug = async (short_slug: string) => {
        try {
            setIsLoadingOldContent(true);
            const response = await axiosInstance.get(`/posts/${short_slug}`);

            if (response.status === 200) {
                const postData = response.data.data;
                setPost(postData);

                const parsedContent = JSON.parse(postData.content);
                setContentState(parsedContent);

                if (postData.title) {
                    setMetadata({
                        ...metadata,
                        title: postData.title,
                        description: postData.description || '',
                        tags: postData.tags || [],
                        category: postData.category || '',
                        thumbnail: postData.thumbnail || '',
                    });

                    localStorage.setItem('pid', postData.id);
                }
                setIsLoadingOldContent(false);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            setIsLoadingOldContent(false);
        }
    };

    const handlePublish = async () => {
        setPublishStatus('publishing');

        if (!contentState) return;
        const htmlContent = generateHtmlFromContent(contentState);

        try {
            // Send to AI for review - status becomes PROCESSING
            const response = await axiosInstance.put(`posts/publish/${slug}`, {
                slug: metadata.slug || generateSlug(metadata.title),
                title: metadata.title,
                thumbnail: metadata.thumbnail,
                description: metadata.description,
                html_content: htmlContent,
            });

            console.log('Publish response:', response);

            // Update post status to PROCESSING
            setPost((prev: Post | null) => prev ? { ...prev, status: 'PROCESSING' } : null);
            setPublishStatus('published');
            setShowPublishModal(false);

            toast({
                title: 'Sent for Review',
                description: 'Your content has been sent to AI for review and will be published once approved.',
            });

            setTimeout(() => {
                setPublishStatus('idle');
            }, 3000);
        } catch (error) {
            setPublishStatus('error');
            console.error('Publish failed:', error);
            toast({
                title: 'Publish Failed',
                description: 'There was an error sending your content for review. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleUnpublish = async () => {
        setPublishStatus('publishing');

        try {
            const response = await axiosInstance.put(`posts/unpublish/${slug}`);
            if (response.status !== 200) {
                throw new Error('Failed to unpublish content');
            }

            setPost((prev: Post | null) => prev ? { ...prev, status: 'DRAFT', published: false } : null);
            setPublishStatus('idle');

            toast({
                title: 'Unpublished Successfully',
                description: 'Your content has been unpublished and reverted to draft.',
            });

        } catch (error) {
            setPublishStatus('error');
            toast({
                title: 'Unpublish Failed',
                description: 'There was an error unpublishing your content. Please try again.',
                variant: 'destructive',
            });
        }
    };

    // Utility functions
    const generateSlug = (title: string) => {
        const thaiToEng: { [key: string]: string } = {
            'ก': 'k', 'ข': 'k', 'ค': 'k', 'ฆ': 'k',
            'ง': 'ng', 'จ': 'j', 'ฉ': 'ch', 'ช': 'ch', 'ฌ': 'ch',
            'ซ': 's', 'ศ': 's', 'ษ': 's', 'ส': 's',
            'ญ': 'y', 'ย': 'y', 'ฎ': 'd', 'ด': 'd',
            'ต': 't', 'ฏ': 't', 'ถ': 't', 'ท': 't', 'ธ': 't', 'ฐ': 't',
            'ณ': 'n', 'น': 'n', 'บ': 'b',
            'ป': 'p', 'พ': 'p', 'ผ': 'p', 'ภ': 'p',
            'ฝ': 'f', 'ฟ': 'f', 'ม': 'm', 'ร': 'r',
            'ล': 'l', 'ฬ': 'l', 'ว': 'w',
            'ห': 'h', 'ฮ': 'h', 'อ': 'a',
        };

        const lowerTitle = title.trim().toLowerCase();
        const mainSlug = lowerTitle
            .replace(/[^ก-๙a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();

        const engSlug = lowerTitle
            .replace(/[^\u0E00-\u0E7F]/g, '')
            .split('')
            .map(char => thaiToEng[char] || '')
            .join('')
            .replace(/[^a-z0-9]/g, '')
            .replace(/-+/g, '-');

        return engSlug + "-" + getnerateId() ? `${mainSlug}-${engSlug}-${getnerateId()}` : mainSlug + '-' + getnerateId();
    };

    // Effects
    useEffect(() => {
        // Auto-save only for DRAFT and REJECTED posts
        if (contentState && canAutoSave()) {
            const saveTimeout = setTimeout(() => {
                saveContent();
            }, 1000);

            return () => clearTimeout(saveTimeout);
        }
    }, [contentState, post?.status]);

    useEffect(() => {
        getPostByShortSlug(slug);
    }, [slug]);

    useEffect(() => {
        if (!contentState) return;

        // Auto-extract title from content
        const firstHeading = contentState.content?.find(
            (node) => node.type === 'heading' && node.attrs?.level === 1
        );

        let titleText = '';

        if (firstHeading?.content) {
            titleText = firstHeading.content
                .map((child: any) => child.text || '')
                .join('')
                .trim();
        }

        if (!titleText && contentState.content) {
            for (const node of contentState.content) {
                if (node.content) {
                    titleText = node.content
                        .map((child: any) => child.text)
                        .filter(Boolean)
                        .join('');
                    if (titleText) break;
                }
            }
        }

        if (titleText) {
            setMetadata((prev) => ({
                ...prev,
                title: titleText,
            }));
        }
    }, [contentState]);

    useWebSocket((message) => {
        if (message.event === "notification:ai:filter_post_content") {
            // fetch the updated post content
            getPostByShortSlug(slug);
        }
    });

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">
            <NewUserModal />

            {/* Status Header */}
            <PostStatusHeader
                post={post}
                saveStatus={saveStatus}
                publishStatus={publishStatus}
                lastSaved={lastSaved}
                onPublish={() => setShowPublishModal(true)}
                onUnpublish={handleUnpublish}
                onEditMetadata={() => setShowPublishModal(true)}
                onManualSave={() => saveContent(true)}
                canManualEdit={canManualEdit()}
            />

            {/* Editor */}
            {contentState || !isLoadingOldContent ? (
                canManualEdit() ? (
                    <>
                        <SimpleEditor
                            onContentChange={setContentState}
                            initialContent={contentState}
                        />
                    </>
                ) : (
                    <PreviewEditor
                        content={contentState || { type: 'doc', content: [] }}
                    />
                )
            ) : (
                <Loading
                    label="Editor loading..."
                    className="w-full h-[80vh] flex items-center justify-center"
                />
            )}

            {/* Publish Modal */}
            <PublishModal
                open={showPublishModal}
                onOpenChange={setShowPublishModal}
                metadata={metadata}
                onMetadataChange={setMetadata}
                onPublish={handlePublish}
                publishStatus={publishStatus}
                isPublished={isPublished()}
                generateSlug={generateSlug}
            />
        </div>
    );
}