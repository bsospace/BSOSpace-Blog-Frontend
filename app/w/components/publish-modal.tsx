/* eslint-disable @next/next/no-img-element */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
    Loader2, 
    X, 
    Globe, 
    Edit3, 
    Tag, 
    FolderOpen, 
    ImageIcon, 
    Upload,
    Eye
} from "lucide-react";
import { axiosInstance } from "@/app/utils/api";

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

interface PublishModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    metadata: Metadata;
    onMetadataChange: React.Dispatch<React.SetStateAction<Metadata>>;
    onPublish: () => void;
    publishStatus: PublishStatus;
    isPublished: boolean;
    generateSlug: (title: string) => string;
}

export const PublishModal: React.FC<PublishModalProps> = ({
    open,
    onOpenChange,
    metadata,
    onMetadataChange,
    onPublish,
    publishStatus,
    isPublished,
    generateSlug
}) => {
    const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
    const [newTag, setNewTag] = useState('');

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
                const url = response?.data?.data?.image_url;
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
    };

    const handleMetadataChange = (field: keyof Metadata, value: any) => {
        onMetadataChange(prev => {
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
            onMetadataChange(prev => ({
                ...prev,
                tags: [...prev.tags, newTag]
            }));
            setNewTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        onMetadataChange(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isPublished ? (
                            <>
                                <Globe className="h-5 w-5" />
                                Edit Publication
                            </>
                        ) : (
                            <>
                                <Eye className="h-5 w-5" />
                                Submit for Review
                            </>
                        )}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Blog Cover Image Upload */}
                    <div className="space-y-3">
                        <Label className="flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Blog Cover Image
                        </Label>

                        <div className="min-h-64 relative flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-2 text-center hover:border-gray-400 transition-colors">
                            {metadata.thumbnail && !isUploadingThumbnail ? (
                                <div className="space-y-3">
                                    <div className="relative inline-block">
                                        <img
                                            src={metadata.thumbnail}
                                            alt={`Thumbnail for ${metadata.title}`}
                                            className="max-h-64 rounded-lg object-cover"
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
                            ) : (
                                <div className="flex items-center justify-center space-x-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
                                    <span className="text-sm text-gray-500">Uploading...</span>
                                </div>
                            )}

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
                            Tags (coming soon...)
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
                            <Button onClick={addTag} variant="outline" size="sm" disabled>
                                Add
                            </Button>
                        </div>

                        {/* Display existing tags */}
                        {metadata.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {metadata.tags.map((tag, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md text-sm"
                                    >
                                        <span>{tag}</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0 hover:bg-gray-200"
                                            onClick={() => removeTag(tag)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Category & Author */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" />
                                Category (coming soon...)
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={onPublish}
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
    );
};