/* eslint-disable @next/next/no-img-element */
'use client'
import React from 'react';
import {
    Eye,
    Heart,
    Calendar,
    Edit3,
    Trash2,
    Share2,
    MoreVertical,
    Bot,
    Sparkles,
    Loader2,
    Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Post, statusDescriptions } from '../../interfaces';
import { formatDate } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PostCardProps {
    post: Post;
    deleteConfirm: string | null;
    onView: (postId: string) => void;
    onEdit: (postId: string) => void;
    onDelete: (postId: string) => void;
    onShare: (post: Post) => void;
    onLike: (postId: string) => void;
    onToggleAiMode: (postId: string) => void; // เพิ่ม prop สำหรับ AI Mode
    getPostStatusClass: (status: string) => string;
    isAiModeEnabled?: boolean; // เพิ่ม prop สำหรับสถานะ AI Mode
    onToggleAiModeOff: (postId: string) => void; // เพิ่ม prop สำหรับปิด AI Mode
}

export const PostCard: React.FC<PostCardProps> = ({
    post,
    deleteConfirm,
    onView,
    onEdit,
    onDelete,
    onShare,
    onLike,
    onToggleAiMode,
    getPostStatusClass,
    isAiModeEnabled = false,
    onToggleAiModeOff
}) => {
    // AI State Logic - Simplified
    const getAiState = () => {
        if (!post.ai_chat_open && !post.ai_ready) return 'inactive';
        if (post.ai_chat_open && !post.ai_ready) return 'processing';
        if (post.ai_chat_open && post.ai_ready) return 'ready';
        return 'inactive';
    };

    const aiState = getAiState();
    const isAiActive = aiState !== 'inactive';
    const isAiProcessing = aiState === 'processing';
    const isAiReady = aiState === 'ready';


    // AI Status Badge - Minimal Design
    const AiStatusBadge = () => {
        if (!isAiActive) return null;

        const getBadgeStyles = () => {
            if (isAiProcessing) {
                return "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700";
            }
            return "bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-700";
        };

        const getIcon = () => {
            if (isAiProcessing) return <Loader2 className="w-3 h-3 animate-spin" />;
            return <Sparkles className="w-3 h-3" />;
        };

        const getText = () => {
            if (isAiProcessing) return 'Processing...';
            return 'AI Ready';
        };

        return (
            <div className="absolute top-3 left-3 z-10">
                <Badge variant="outline" className={`${getBadgeStyles()} px-2 py-1 text-xs font-medium flex items-center gap-1.5 shadow-sm backdrop-blur-sm`}>
                    {getIcon()}
                    {getText()}
                </Badge>
            </div>
        );
    };


    return (
        <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full max-w-sm mx-auto sm:max-w-none">
            {/* Thumbnail Section */}
            <div className="h-32 sm:h-40 md:h-48 lg:h-36 xl:h-40 relative">
                <div className="absolute inset-0 bg-black/10" />
                <img
                    src={post?.thumbnail || "./default-thumbnail.png"}
                    alt={post.title || "Post Image"}
                    className="w-full h-full object-cover"
                />

                {/* AI Status Badge - Clean and Minimal */}
                <AiStatusBadge />

                {/* Overlay Stats */}
                <div className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 md:bottom-4 md:left-4 md:right-4 flex justify-between items-end">
                    <div className="flex gap-2 sm:gap-3 md:gap-4 text-white/90">
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="text-xs sm:text-sm font-medium">{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart
                                className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-red-300 transition-colors"
                                onClick={() => onLike(post.id)}
                            />
                            <span className="text-xs sm:text-sm font-medium">{post.likes}</span>
                        </div>
                    </div>
                    <div className="text-white/70 text-xs sm:text-sm bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                        {post.read_time}m read
                    </div>
                </div>
            </div>

            {/* Header Section */}
            <CardHeader className="p-3 sm:p-4 md:p-5 lg:p-4 xl:p-6 pb-2 sm:pb-3">
                <div className="flex flex-col gap-2">
                    <CardTitle
                        className="line-clamp-2 group-hover:text-primary transition-colors cursor-pointer text-sm sm:text-base md:text-lg lg:text-base xl:text-lg leading-tight font-semibold"
                        onClick={() => onEdit(post.slug)}
                    >
                        {post.title || "untitled"}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 sm:line-clamp-3 text-xs sm:text-sm md:text-base lg:text-sm leading-relaxed">
                        {post.description}
                    </CardDescription>
                </div>
            </CardHeader>

            {/* Content Section */}
            <CardContent className="p-3 sm:p-4 md:p-5 lg:p-4 xl:p-6 pt-0">
                {/* Date and Status */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3 sm:mb-4">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="hidden md:inline">{formatDate(post.created_at)}</span>
                        <span className="md:hidden">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className='cursor-pointer flex items-center gap-1 hover:scale-110'>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Badge variant="outline" className="text-xs w-fit">
                                        <div className={getPostStatusClass(post.status)} />
                                        <span>{post.status.toLowerCase()}</span>
                                    </Badge>
                                </TooltipTrigger>
                                <TooltipContent side="top">
                                    {statusDescriptions[post.status]}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                </div>

                {/* AI Status Message - Only show when processing with minimal design */}
                {isAiProcessing && (
                    <div className="mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 text-sm bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-3 py-2 rounded-lg">
                            <Loader2 className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-spin flex-shrink-0" />
                            <span className="text-amber-800 dark:text-amber-200 text-sm">AI analyzing content...</span>
                        </div>
                    </div>
                )}


                {/* Action Buttons */}
                <div className="flex items-center justify-between">
                    {/* Quick Actions */}
                    <div className="flex gap-1 sm:gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 sm:h-8 sm:w-8 md:h-9 md:w-9"
                            onClick={() => onEdit(post.id)}
                            title="Edit post"
                        >
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 sm:h-8 sm:w-8 md:h-9 md:w-9"
                            onClick={() => onShare(post)}
                            title="Share post"
                        >
                            <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-7 w-7 p-0 sm:h-8 sm:w-8 md:h-9 md:w-9 ${deleteConfirm === post.id ? 'text-red-600 bg-red-50' : ''
                                }`}
                            onClick={() => onDelete(post.id)}
                            title={deleteConfirm === post.id ? 'Confirm delete' : 'Delete post'}
                        >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                    </div>

                    {/* More Options */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 sm:h-8 sm:w-8 md:h-9 md:w-9"
                                title="More options"
                            >
                                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 sm:w-48">
                            <DropdownMenuItem
                                onClick={() => {
                                    if (isAiActive) {
                                        onToggleAiModeOff(post.id);
                                    } else {
                                        onToggleAiMode(post.id);
                                    }
                                }}
                                className="text-xs sm:text-sm cursor-pointer flex items-center gap-2"
                                disabled={isAiProcessing}
                            >
                                {isAiProcessing ? (
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                ) : isAiReady ? (
                                    <Brain className="w-4 h-4 mr-2" />
                                ) : (
                                    <Bot className="w-4 h-4 mr-2" />
                                )}
                                {isAiProcessing ? 'Processing...' :
                                    isAiReady ? 'Disable AI Mode' : 'Enable AI Mode'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardContent>
        </Card>
    );
}