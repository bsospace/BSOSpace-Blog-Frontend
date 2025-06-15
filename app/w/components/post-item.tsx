/* eslint-disable @next/next/no-img-element */
'use client'
import React from 'react';
import {
    Eye,
    Heart,
    Clock,
    Calendar,
    Edit3,
    Trash2,
    Share2,
    MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Post, statusDescriptions } from '../../interfaces';
import { formatDate } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
interface PostListItemProps {
    post: Post;
    deleteConfirm: string | null;
    onView: (postId: string) => void;
    onEdit: (postId: string) => void;
    onDelete: (postId: string) => void;
    onShare: (post: Post) => void;
    onLike: (postId: string) => void;
    getPostStatusClass: (status: string) => string;
}

export const PostListItem: React.FC<PostListItemProps> = ({
    post,
    deleteConfirm,
    onView,
    onEdit,
    onDelete,
    onShare,
    onLike,
    getPostStatusClass
}) => (
    <Card className="transition-all duration-300 hover:shadow-md w-full">
        <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6">
            {/* Mobile Layout - Stack Vertically */}
            <div className="block sm:hidden">
                <div className="flex items-start gap-3 mb-3">
                    {post.thumbnail ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={post.thumbnail}
                                alt={post.title || "Post thumbnail"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 dark:bg-gray-900 bg-gray-300 rounded-lg flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                            {post.title[0]?.toUpperCase() || 'U'}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                            <h3
                                className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors cursor-pointer flex-1"
                                onClick={() => onView(post.slug)}
                            >
                                {post.title || "untitled"}
                            </h3>
                            <Badge variant="outline" className="text-xs flex-shrink-0 ml-2">
                                <div className={getPostStatusClass(post.status)} />
                                <span>{post.status}</span>
                            </Badge>
                        </div>
                        <p className="text-muted-foreground text-xs line-clamp-2 mb-2">
                            {post.description}
                        </p>
                    </div>
                </div>

                {/* Mobile Stats */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Heart
                                className="w-3 h-3 cursor-pointer hover:text-red-500 transition-colors"
                                onClick={() => onLike(post.id)}
                            />
                            <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{post.read_time}m</span>
                        </div>
                    </div>
                </div>

                {/* Mobile Actions */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onEdit(post.id)}
                            title="Edit post"
                        >
                            <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => onShare(post)}
                            title="Share post"
                        >
                            <Share2 className="w-3 h-3" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={`h-8 w-8 p-0 ${deleteConfirm === post.id ? 'text-red-600 bg-red-50' : ''}`}
                            onClick={() => onDelete(post.id)}
                            title={deleteConfirm === post.id ? 'Confirm delete' : 'Delete post'}
                        >
                            <Trash2 className="w-3 h-3" />
                        </Button>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="More options">
                                <MoreVertical className="w-3 h-3" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem onClick={() => onView(post.slug)} className="text-xs">
                                <Eye className="w-3 h-3 mr-2" />
                                View Post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(post.id)} className="text-xs">
                                <Edit3 className="w-3 h-3 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare(post)} className="text-xs">
                                <Share2 className="w-3 h-3 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive text-xs"
                                onClick={() => onDelete(post.id)}
                            >
                                <Trash2 className="w-3 h-3 mr-2" />
                                {deleteConfirm === post.id ? 'Confirm Delete' : 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Desktop Layout - Horizontal */}
            <div className="hidden sm:flex items-center justify-between">
                <div className="flex items-center gap-3 md:gap-4 lg:gap-5 flex-1 min-w-0">
                    {post.thumbnail ? (
                        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg overflow-hidden flex-shrink-0">
                            <img
                                src={post.thumbnail}
                                alt={post.title || "Post thumbnail"}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 dark:bg-gray-900 bg-gray-300 rounded-lg flex items-center justify-center text-white font-semibold text-sm md:text-base flex-shrink-0">
                            {post.title[0]?.toUpperCase() || 'U'}
                        </div>
                    )}

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 md:gap-3 mb-1 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <h3
                                    className="font-semibold text-sm md:text-base lg:text-lg truncate hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => onView(post.slug)}
                                >
                                    {post.title || "untitled"}
                                </h3>
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

                        <p className="text-muted-foreground text-xs md:text-sm line-clamp-1 lg:line-clamp-2 mb-2">
                            {post.description}
                        </p>

                        <div className="flex items-center gap-3 md:gap-4 lg:gap-5 text-xs md:text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                                <span className="hidden md:inline">{formatDate(post.created_at)}</span>
                                <span className="md:hidden">{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart
                                    className="w-3 h-3 md:w-4 md:h-4 cursor-pointer hover:text-red-500 transition-colors"
                                    onClick={() => onLike(post.id)}
                                />
                                <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 md:w-4 md:h-4" />
                                <span>{post.read_time}m</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop Actions */}
                <div className="flex items-center gap-1 md:gap-2 ml-3 md:ml-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 md:h-9 md:w-9"
                        onClick={() => onEdit(post.id)}
                        title="Edit post"
                    >
                        <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 md:h-9 md:w-9 hidden md:flex"
                        onClick={() => onShare(post)}
                        title="Share post"
                    >
                        <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 md:h-9 md:w-9 hidden lg:flex ${deleteConfirm === post.id ? 'text-red-600 bg-red-50' : ''}`}
                        onClick={() => onDelete(post.id)}
                        title={deleteConfirm === post.id ? 'Confirm delete' : 'Delete post'}
                    >
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 md:h-9 md:w-9" title="More options">
                                <MoreVertical className="w-3 h-3 md:w-4 md:h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 md:w-48">
                            <DropdownMenuItem onClick={() => onView(post.slug)} className="text-xs md:text-sm">
                                <Eye className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                View Post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(post.id)} className="text-xs md:text-sm">
                                <Edit3 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare(post)} className="text-xs md:text-sm">
                                <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive text-xs md:text-sm"
                                onClick={() => onDelete(post.id)}
                            >
                                <Trash2 className="w-3 h-3 md:w-4 md:h-4 mr-2" />
                                {deleteConfirm === post.id ? 'Confirm Delete' : 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </CardContent>
    </Card>
);