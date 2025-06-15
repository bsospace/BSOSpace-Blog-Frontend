/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import TiptapEditor from "@/app/components/TiptapEditor"
import { SimpleEditor } from "@/app/components/tiptap-templates/simple/simple-editor";
// import content from '@/app/components/tiptap-templates/simple/data/content.json';
import React, { useState } from "react";
import { JSONContent } from "@tiptap/react";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getnerateId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Loader2, Check, X, AlertCircle, Globe, Edit3, Tag, FolderOpen, ImageIcon, Upload } from "lucide-react";
import { axiosInstance } from "@/app/utils/api";
import { use } from "react";
import { useToast, toast } from '@/hooks/use-toast';
import { ToastAction } from "@radix-ui/react-toast";
import Loading from "@/app/components/Loading";
import NewUserModal from "@/app/components/NewUserModal";
import { generateHtmlFromContent } from "@/app/components/tiptap-templates/simple/generate-html";

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
    const [contentState, setContentState] = useState<JSONContent>();
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [isLoadingOldContent, setIsLoadingoOldContent] = useState(true);
    const [newTag, setNewTag] = useState('');
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

    const saveContent = async () => {
        try {
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
                    if (!isPublished) {
                        setSaveStatus('idle');
                    }
                }, 2000);
            } else {
                throw new Error('Failed to save content');
            }

        } catch (error) {
            console.error('Error saving content:', error);
        }
    }


    const getPostByShortSlug = async (short_slug: string) => {
        try {
            setIsLoadingoOldContent(true);
            const response = await axiosInstance.get(`/posts/${short_slug}`);
            if (response.status === 200) {
                const post = response.data.data;
                const parsedContent = JSON.parse(post.content);
                setContentState(parsedContent);
                if (post.title) {
                    setMetadata({
                        ...metadata,
                        title: post.title,
                        description: post.description || '',
                        tags: post.tags || [],
                        category: post.category || '',
                        thumbnail: post.thumbnail || '',
                    })

                    setIsPublished(post.published);
                    localStorage.setItem('pid', post.id);
                }
                setIsLoadingoOldContent(false);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            setIsLoadingoOldContent(false);
        }
    }


    // auto save
    useEffect(() => {
        if (contentState) {
            const saveTimeout = setTimeout(() => {
                if (isPublished) {
                    setSaveStatus('idle');
                    return;
                } // Don't auto-save if the post is published
                saveContent();
            }, 1000); // Simulate 1 second save delay

            return () => clearTimeout(saveTimeout);
        }
    }, [contentState]);

    useEffect(() => {
        getPostByShortSlug(slug);
    }, [slug]);

    useEffect(() => {
        if (!contentState) return;

        // Try to find the first h1 heading
        const firstHeading = contentState.content?.find(
            (node) => node.type === 'heading' && node.attrs?.level === 1
        );

        let titleText = '';

        if (firstHeading?.content) {
            const titleText = firstHeading.content
                .map((child: any) => child.text || '')
                .join('')
                .trim();
        }

        // If no h1 found or it's empty, fallback to any text node
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

    const handleManualPublish = async () => {
        if (saveStatus === 'saving') return;
        setSaveStatus('saving');


        try {
            // Simulate manual save operation
            const response = await axiosInstance.post(`/publish/${(await params).slug}`, {
                slug: metadata.slug || generateSlug(metadata.title),
                title: metadata.title,
                thumbnail: metadata.thumbnail,
                discription: metadata.description,
            });

            setSaveStatus('saved');
            setLastSaved(new Date());
            setIsPublished(true);

            setTimeout(() => {
                setSaveStatus('idle');
            }, 2000);
        } catch (error) {
            setSaveStatus('error');
            console.error('Manual save failed:', error);
        }
    };

    const handlePublish = async () => {
        setPublishStatus('publishing');

        if (!contentState) return;
        const htmlContent = generateHtmlFromContent(contentState)
        console.log('HTML Content:', htmlContent);

        try {
            // Simulate publish operation
            // Simulate manual save operation
            const response = await axiosInstance.put(`posts/publish/${(await params).slug}`, {
                slug: metadata.slug || generateSlug(metadata.title),
                title: metadata.title,
                thumbnail: metadata.thumbnail,
                description: metadata.description,
                html_content: htmlContent,
            });

            console.log('Publish response:', response);


            // Here you would send both content and metadata to your backend
            console.log('Publishing content:', contentState);
            console.log('Publishing metadata:', metadata);

            setPublishStatus('published');
            setIsPublished(true);
            setShowPublishModal(false);

            toast({
                title: 'Published Successfully',
                description: 'Your content has been published successfully.',
            });

            setTimeout(() => {
                setPublishStatus('idle');
            }, 3000);
        } catch (error) {
            setPublishStatus('error');
            console.error('Publish failed:', error);
            toast({
                title: 'Publish Failed',
                description: 'There was an error publishing your content. Please try again.',
                variant: 'destructive',
                action: <ToastAction onClick={() => handlePublish()} altText="Try again">Try again</ToastAction>,
            });
        }
    };

    const handleUnpublish = async () => {
        setPublishStatus('publishing');

        try {

            const response = await axiosInstance.put(`posts/unpublish/${(await params).slug}`);
            if (response.status !== 200) {
                throw new Error('Failed to unpublish content');
            }

            setIsPublished(false);
            setPublishStatus('idle');

            toast({
                title: 'Unpublished Successfully',
                description: 'Your content has been unpublished successfully.',
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

    const formatLastSaved = (date: Date | null) => {
        if (!date) return '';

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
    };

    const getSaveStatusColor = () => {
        switch (saveStatus) {
            case 'saving':
                return 'text-yellow-600';
            case 'saved':
                return 'text-green-600';
            case 'error':
                return 'text-red-600';
            default:
                return 'text-gray-500';
        }
    };

    const getSaveStatusText = () => {
        switch (saveStatus) {
            case 'saving':
                return 'Saving...';
            case 'saved':
                return 'Saved';
            case 'error':
                return 'Save failed';
            default:
                return 'Ready';
        }
    };

    const generateSlug = (title: string) => {
        const thaiToEng: { [key: string]: string } = {
            'ก': 'k', 'ข': 'k', 'ค': 'k', 'ฆ': 'k',
            'ง': 'ng',
            'จ': 'j',
            'ฉ': 'ch', 'ช': 'ch', 'ฌ': 'ch',
            'ซ': 's', 'ศ': 's', 'ษ': 's', 'ส': 's',
            'ญ': 'y', 'ย': 'y',
            'ฎ': 'd', 'ด': 'd',
            'ต': 't', 'ฏ': 't', 'ถ': 't', 'ท': 't', 'ธ': 't', 'ฐ': 't',
            'ณ': 'n', 'น': 'n',
            'บ': 'b',
            'ป': 'p', 'พ': 'p', 'ผ': 'p', 'ภ': 'p',
            'ฝ': 'f', 'ฟ': 'f',
            'ม': 'm',
            'ร': 'r',
            'ล': 'l', 'ฬ': 'l',
            'ว': 'w',
            'ห': 'h', 'ฮ': 'h',
            'อ': 'a',
        };

        const lowerTitle = title.trim().toLowerCase();

        // Keep Thai characters and alphanumerics for the main slug
        const mainSlug = lowerTitle
            .replace(/[^ก-๙a-z0-9\s]/g, '') // remove special chars except Thai and a-z0-9
            .replace(/\s+/g, '-') // replace spaces with dash
            .replace(/-+/g, '-') // remove multiple dashes
            .trim();

        // Generate English part by converting Thai letters
        const engSlug = lowerTitle
            .replace(/[^\u0E00-\u0E7F]/g, '') // keep only Thai characters
            .split('')
            .map(char => thaiToEng[char] || '')
            .join('')
            .replace(/[^a-z0-9]/g, '') // ensure only a-z0-9 remain
            .replace(/-+/g, '-');

        return engSlug + "-" + getnerateId() ? `${mainSlug}-${engSlug}-${getnerateId()}` : mainSlug + '-' + getnerateId();
    };


    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const uploadThumbnail = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('post_id', localStorage.getItem('pid') || '');
            setIsUploadingThumbnail(true);

            const response = await axiosInstance.post('/media/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                const url = response?.data?.data?.image_url

                console.log('Image uploaded successfully:', url);
                handleMetadataChange('thumbnail', url);
            } else {
                throw new Error('Failed to upload image');
            }

            setIsUploadingThumbnail(false);
        } catch (error) {
            console.error('Image upload failed:', error);
            setIsUploadingThumbnail(false);
        }
    }
    const handleMetadataChange = (field: keyof Metadata, value: any) => {
        setMetadata(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-generate slug when title changes
            if (field === 'title' && value) {
                updated.slug = generateSlug(value);
            }

            if (field === 'thumbnail' && value instanceof File) {
                uploadThumbnail(value);
            }

            return updated;
        });
    };

    const addTag = () => {
        if (newTag && !metadata.tags.includes(newTag)) {
            setMetadata(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setMetadata(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const getSaveStatusIcon = () => {
        switch (saveStatus) {
            case 'saving':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            case 'saved':
                return <Check className="h-4 w-4" />;
            case 'error':
                return <AlertCircle className="h-4 w-4" />;
            default:
                return <div className="h-4 w-4 rounded-full bg-gray-400" />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full h-full">

            <NewUserModal />
            {/* Header Bar */}
            <Card className="w-full max-w-screen-xl mb-6">
                <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                        {/* Save Status */}
                        <div className="flex items-center space-x-2">
                            <div className={getSaveStatusColor()}>
                                {getSaveStatusIcon()}
                            </div>
                            <span className={`text-sm font-medium ${getSaveStatusColor()}`}>
                                {getSaveStatusText()}
                            </span>
                        </div>

                        {/* Last Saved Time */}
                        {lastSaved ? (
                            <>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-sm text-muted-foreground">
                                    Last saved {formatLastSaved(lastSaved)}
                                </span>
                            </>
                        ) : isPublished ? (
                            <>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-sm text-muted-foreground">
                                    Published post will not be automatically saved.
                                </span>
                            </>
                        ) : null}

                        {/* Publish Status */}
                        {isPublished && (
                            <>
                                <Separator orientation="vertical" className="h-4" />
                                <div className="flex items-center space-x-2">
                                    <Globe className="h-4 w-4 text-green-600" />
                                    <span className="text-sm font-medium text-green-600">
                                        Published
                                    </span>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        {!isPublished ? (
                            <Button
                                onClick={() => setShowPublishModal(true)}
                                disabled={publishStatus === 'publishing' || !contentState}
                                className="gap-2"
                            >
                                {publishStatus === 'publishing' ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Publishing...
                                    </>
                                ) : (
                                    <>
                                        <Globe className="h-4 w-4" />
                                        Publish
                                    </>
                                )}
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    onClick={handleUnpublish}
                                    disabled={publishStatus === 'publishing'}
                                    size="sm"
                                >
                                    Unpublish
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPublishModal(true)}
                                    size="sm"
                                    className="gap-2"
                                >
                                    <Edit3 className="h-4 w-4" />
                                    Edit Metadata
                                </Button>

                                <Button
                                    variant="default"
                                    onClick={() => saveContent()}
                                    disabled={saveStatus === "saved"}
                                    size="sm"
                                    className="gap-2"
                                >
                                    Save Changes
                                </Button>
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Editor */}


            {contentState || !isLoadingOldContent ? (
                <SimpleEditor
                    onContentChange={setContentState}
                    initialContent={contentState}
                />
            ) : (
                <>
                    <Loading label="Editor loading..." className="w-full h-[80vh] flex items-center justify-center" />
                </>
            )}

            {/* Publish Modal */}
            <Dialog open={showPublishModal} onOpenChange={setShowPublishModal}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {isPublished ? 'Edit Publication' : 'Publish Content'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Blog Cover Image Upload */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Blog Cover Image
                            </Label>

                            <div className=" min-h-64 relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:border-gray-400 transition-colors">
                                {metadata.thumbnail && !isUploadingThumbnail ? (
                                    <>
                                        <div className="space-y-3">
                                            <div className="relative inline-block">
                                                <img
                                                    src={metadata.thumbnail}
                                                    alt={`Thumbnail for ${metadata.title}`}
                                                    className="max-h-64  rounded-lg object-cover"
                                                />
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                                    onClick={() => handleMetadataChange('thumbnail', '')}
                                                >
                                                    <X className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : !isUploadingThumbnail ? (
                                    <div className="space-y-2">
                                        <Upload className="h-8 w-8 mx-auto text-gray-400" />
                                        <p className="text-sm text-gray-600">
                                            Click to upload cover image or drag and drop
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            PNG, JPG, WebP up to 5MB
                                        </p>
                                    </div>
                                ) : isUploadingThumbnail ? (
                                    <>
                                        <div className="flex items-center justify-center space-x-2">
                                            <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                            <span className="text-sm text-gray-500">Uploading...</span>
                                        </div>
                                    </>
                                ) : null}


                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            uploadThumbnail(file);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Title & Slug */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="flex items-center gap-2">
                                    <Edit3 className="h-4 w-4" />
                                    Title *
                                </Label>
                                <Input
                                    id="title"
                                    value={metadata.title}
                                    onChange={(e) => handleMetadataChange('title', e.target.value)}
                                    placeholder="Enter post title"
                                />
                            </div>
                        </div>

                        <Separator />

                        {/* Description */}
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                value={metadata.description}
                                onChange={(e) => handleMetadataChange('description', e.target.value)}
                                placeholder="Brief description of your content"
                                rows={3}
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-3">
                            <Label className="flex items-center gap-2">
                                <Tag className="h-4 w-4" />
                                Tags (in comming soon...)
                            </Label>

                            <div className="flex gap-2">
                                <Input
                                    disabled
                                    value={newTag}
                                    onChange={(e) => setNewTag(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addTag();
                                        }
                                    }}
                                    placeholder="Add a tag"
                                    className="flex-1"
                                />
                                <Button onClick={addTag} variant="outline" size="sm">
                                    Add
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        {/* Category & Author */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="flex items-center gap-2">
                                    <FolderOpen className="h-4 w-4" />
                                    Category (in comming soon...)
                                </Label>
                                <Select
                                    value={metadata.category}
                                    onValueChange={(value) => handleMetadataChange('category', value)}
                                    disabled={true}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technology">Technology</SelectItem>
                                        <SelectItem value="design">Design</SelectItem>
                                        <SelectItem value="business">Business</SelectItem>
                                        <SelectItem value="personal">Personal</SelectItem>
                                        <SelectItem value="tutorial">Tutorial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowPublishModal(false)}>
                            Cancel
                        </Button>
                        <Button
                            onClick={handlePublish}
                            disabled={!metadata.title || publishStatus === 'publishing'}
                        >
                            {publishStatus === 'publishing' ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                isPublished ? 'Update' : 'Publish'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Status Alerts */}
            <div className="w-full max-w-screen-xl mt-6 space-y-4">
                {saveStatus === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>Failed to save your changes. Please try again.</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleManualPublish}
                                className="ml-4"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {publishStatus === 'error' && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="flex items-center justify-between">
                            <span>Failed to publish. Please try again.</span>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPublishModal(true)}
                                className="ml-4"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </div>
        </div>
    )
}