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
import { Loader2, Check, X, AlertCircle, Globe, Edit3, Calendar, User, Tag, FolderOpen, Star } from "lucide-react";

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type PublishStatus = 'idle' | 'publishing' | 'published' | 'error';

interface Metadata {
    title: string;
    description: string;
    tags: string[];
    category: string;
    featured: boolean;
    publishDate: string;
    author: string;
    slug: string;
}

export default function Page() {
    const [contentState, setContentState] = useState<JSONContent>();
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [publishStatus, setPublishStatus] = useState<PublishStatus>('idle');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPublishModal, setShowPublishModal] = useState(false);
    const [isPublished, setIsPublished] = useState(false);
    const [newTag, setNewTag] = useState('');
    const [metadata, setMetadata] = useState<Metadata>({
        title: '',
        description: '',
        tags: [],
        category: '',
        featured: false,
        publishDate: new Date().toISOString().split('T')[0],
        author: '',
        slug: ''
    });
    const navigate = useRouter();

    useEffect(() => {
        console.log('contentState', contentState);

        // Auto-save logic when content changes
        if (contentState && saveStatus !== 'saving') {
            setSaveStatus('saving');

            // Simulate save operation
            const saveTimeout = setTimeout(() => {
                try {
                    // Here you would normally save to your backend
                    // For now, we'll simulate a successful save
                    setSaveStatus('saved');
                    setLastSaved(new Date());

                    // Reset to idle after 2 seconds
                    setTimeout(() => {
                        setSaveStatus('idle');
                    }, 2000);
                } catch (error) {
                    setSaveStatus('error');
                    console.error('Save failed:', error);
                }
            }, 1000); // Simulate 1 second save delay

            return () => clearTimeout(saveTimeout);
        }
    }, [contentState]);

    const handleManualSave = async () => {
        if (saveStatus === 'saving') return;

        setSaveStatus('saving');

        try {
            // Simulate manual save operation
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSaveStatus('saved');
            setLastSaved(new Date());

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

        try {
            // Simulate publish operation
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Here you would send both content and metadata to your backend
            console.log('Publishing content:', contentState);
            console.log('Publishing metadata:', metadata);

            setPublishStatus('published');
            setIsPublished(true);
            setShowPublishModal(false);

            setTimeout(() => {
                setPublishStatus('idle');
            }, 3000);
        } catch (error) {
            setPublishStatus('error');
            console.error('Publish failed:', error);
        }
    };

    const handleUnpublish = async () => {
        setPublishStatus('publishing');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setIsPublished(false);
            setPublishStatus('idle');
        } catch (error) {
            setPublishStatus('error');
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
        return title
            .toLowerCase()
            .replace(/[^a-z0-9 -]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
    };

    const handleMetadataChange = (field: keyof Metadata, value: any) => {
        setMetadata(prev => {
            const updated = { ...prev, [field]: value };

            // Auto-generate slug when title changes
            if (field === 'title' && value) {
                updated.slug = generateSlug(value);
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
                        {lastSaved && (
                            <>
                                <Separator orientation="vertical" className="h-4" />
                                <span className="text-sm text-muted-foreground">
                                    Last saved {formatLastSaved(lastSaved)}
                                </span>
                            </>
                        )}

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
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Editor */}
            <SimpleEditor
                onContentChange={setContentState}
            />

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

                            <div className="space-y-2">
                                <Label htmlFor="slug">URL Slug</Label>
                                <Input
                                    id="slug"
                                    value={metadata.slug}
                                    onChange={(e) => handleMetadataChange('slug', e.target.value)}
                                    placeholder="url-friendly-slug"
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
                                Tags
                            </Label>
                            <div className="flex flex-wrap gap-2">
                                {metadata.tags.map((tag, index) => (
                                    <Badge key={index} variant="secondary" className="gap-1">
                                        {tag}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-auto p-0 text-muted-foreground hover:text-foreground"
                                            onClick={() => removeTag(tag)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
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
                                    Category
                                </Label>
                                <Select
                                    value={metadata.category}
                                    onValueChange={(value) => handleMetadataChange('category', value)}
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

                            <div className="space-y-2">
                                <Label htmlFor="author" className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    Author
                                </Label>
                                <Input
                                    id="author"
                                    value={metadata.author}
                                    onChange={(e) => handleMetadataChange('author', e.target.value)}
                                    placeholder="Author name"
                                />
                            </div>
                        </div>

                        {/* Publish Date & Featured */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="publishDate" className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    Publish Date
                                </Label>
                                <Input
                                    id="publishDate"
                                    type="date"
                                    value={metadata.publishDate}
                                    onChange={(e) => handleMetadataChange('publishDate', e.target.value)}
                                />
                            </div>

                            <div className="flex items-center space-x-3 pt-6">
                                <Checkbox
                                    id="featured"
                                    checked={metadata.featured}
                                    onCheckedChange={(checked) => handleMetadataChange('featured', checked)}
                                />
                                <Label htmlFor="featured" className="flex items-center gap-2 cursor-pointer">
                                    <Star className="h-4 w-4" />
                                    Featured post
                                </Label>
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
                                onClick={handleManualSave}
                                className="ml-4"
                            >
                                Retry
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                {publishStatus === 'published' && (
                    <Alert className="border-green-200 bg-green-50">
                        <Check className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            Content published successfully!
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