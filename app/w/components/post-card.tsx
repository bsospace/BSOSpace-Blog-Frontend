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
    Sparkles
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
    isAiModeEnabled = false
}) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 w-full max-w-sm mx-auto sm:max-w-none">
        {/* Thumbnail Section */}
        <div className="h-32 sm:h-40 md:h-48 lg:h-36 xl:h-40 relative">
            <div className="absolute inset-0 bg-black/10" />
            <img
                src={post?.thumbnail || "./default-thumbnail.png"}
                alt={post.title || "Post Image"}
                className="w-full h-full object-cover"
            />

            {/* AI Mode Indicator */}
            {isAiModeEnabled && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-1.5 rounded-full shadow-lg">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-pulse" />
                    </div>
                </div>
            )}

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
                    
                    {/* AI Mode Button */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant={isAiModeEnabled ? "default" : "ghost"}
                                    size="sm"
                                    className={`h-7 w-7 p-0 sm:h-8 sm:w-8 md:h-9 md:w-9 transition-all duration-200 ${
                                        isAiModeEnabled 
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-600  text-white shadow-lg' 
                                            : ''
                                    }`}
                                    onClick={() => onToggleAiMode(post.id)}
                                >
                                    <Bot className={`w-3 h-3 sm:w-4 sm:h-4 ${isAiModeEnabled ? 'animate-pulse' : ''}`} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                                {isAiModeEnabled ? 'Disable AI Mode' : 'Enable AI Mode'}
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

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
                        <DropdownMenuItem onClick={() => onView(post.slug)} className="text-xs sm:text-sm">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            View Post
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(post.id)} className="text-xs sm:text-sm">
                            <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onClick={() => onToggleAiMode(post.id)}
                            className="text-xs sm:text-sm"
                        >
                            <Bot className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            {isAiModeEnabled ? 'Disable AI Mode' : 'Enable AI Mode'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="text-destructive text-xs sm:text-sm"
                            onClick={() => onDelete(post.id)}
                        >
                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                            {deleteConfirm === post.id ? 'Confirm Delete' : 'Delete'}
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </CardContent>
    </Card>
);