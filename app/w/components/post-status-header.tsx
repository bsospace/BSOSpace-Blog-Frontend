import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
    Loader2,
    Check,
    X,
    AlertCircle,
    Globe,
    Edit3,
    Clock,
    CheckCircle,
    XCircle,
    Eye
} from "lucide-react";
import { Post } from "@/app/interfaces/index"

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type PublishStatus = 'idle' | 'publishing' | 'published' | 'error';

interface PostStatusHeaderProps {
    post: Post | null;
    saveStatus: SaveStatus;
    publishStatus: PublishStatus;
    lastSaved: Date | null;
    onPublish: () => void;
    onUnpublish: () => void;
    onEditMetadata: () => void;
    onManualSave: () => void;
    canManualEdit: boolean;
    metadata?: {
        id?: string;
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
}

export const PostStatusHeader: React.FC<PostStatusHeaderProps> = ({
    post,
    saveStatus,
    publishStatus,
    lastSaved,
    onPublish,
    onUnpublish,
    onEditMetadata,
    onManualSave,
    canManualEdit,
    metadata
}) => {
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

    const getPostStatusInfo = () => {
        if (!post) return null;

        switch (post.status) {
            case 'DRAFT':
                return {
                    icon: <Edit3 className="h-4 w-4 text-gray-600" />,
                    text: 'Draft',
                    color: 'text-gray-600',
                    description: 'Not published yet - auto-saving enabled'
                };
            case 'PROCESSING':
                return {
                    icon: <Clock className="h-4 w-4 text-blue-600 animate-pulse" />,
                    text: 'Under Review',
                    color: 'text-blue-600',
                    description: 'Content is being reviewed by AI - editing disabled'
                };
            case 'PUBLISHED':
                return {
                    icon: <Globe className="h-4 w-4 text-green-600" />,
                    text: 'Published',
                    color: 'text-green-600',
                    description: 'Live and public - manual save required for changes'
                };
            case 'REJECTED':
                return {
                    icon: <XCircle className="h-4 w-4 text-red-600" />,
                    text: 'Rejected',
                    color: 'text-red-600',
                    description: 'Content review failed - please revise and resubmit'
                };
            default:
                return {
                    icon: <Edit3 className="h-4 w-4 text-gray-600" />,
                    text: 'Draft',
                    color: 'text-gray-600',
                    description: 'Not published yet - auto-saving enabled'
                };
        }
    };

    const postStatusInfo = getPostStatusInfo();

    return (
        <Card className="w-full max-w-screen-xl mb-6">
            <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    {/* Post Status */}
                    {postStatusInfo && (
                        <>
                            <div className="flex items-center space-x-2">
                                <div className={postStatusInfo.color}>
                                    {postStatusInfo.icon}
                                </div>
                                <div className="flex flex-col">
                                    <span className={`text-sm font-medium ${postStatusInfo.color}`}>
                                        {postStatusInfo.text}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {postStatusInfo.description}
                                    </span>
                                </div>
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                        </>
                    )}

                    {/* Save Status */}
                    {canManualEdit && (
                        <>
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
                        </>
                    )}

                    {/* Processing Message */}
                    {post?.status === 'PROCESSING' && (
                        <span className="text-sm text-muted-foreground">
                            Editing is disabled while content is under review
                        </span>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2">
                    {post?.status === 'DRAFT' || post?.status === 'REJECTED' || metadata?.id !== "" ? (
                        <Button
                            onClick={onPublish}
                            disabled={publishStatus === 'publishing'}
                            className="gap-2"
                        >
                            {publishStatus === 'publishing' ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4" />
                                    Submit for Review
                                </>
                            )}
                        </Button>
                    ) : post?.status === 'PUBLISHED' ? (
                        <>
                            <Button
                                variant="outline"
                                onClick={onUnpublish}
                                disabled={publishStatus === 'publishing'}
                                size="sm"
                            >
                                Unpublish
                            </Button>
                            <Button
                                variant="outline"
                                onClick={onEditMetadata}
                                size="sm"
                                className="gap-2"
                            >
                                <Edit3 className="h-4 w-4" />
                                Edit Metadata
                            </Button>
                            <Button
                                variant="default"
                                onClick={onManualSave}
                                disabled={saveStatus === "saved"}
                                size="sm"
                                className="gap-2"
                            >
                                Save Changes
                            </Button>
                        </>
                    ) : post?.status === 'PROCESSING' ? (
                        <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-md">
                            <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                            <span className="text-sm text-blue-700">
                                Under AI Review
                            </span>
                        </div>
                    ) : null}
                </div>
            </CardContent>
        </Card>
    );
};