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
import { Post } from '../../interfaces';
import { formatDate } from '@/lib/utils';

interface PostListItemProps {
    post: Post;
    deleteConfirm: string | null;
    onView: (postId: string) => void;
    onEdit: (postId: string) => void;
    onDelete: (postId: string) => void;
    onShare: (post: Post) => void;
    onLike: (postId: string) => void;
}

export const PostListItem: React.FC<PostListItemProps> = ({
    post,
    deleteConfirm,
    onView,
    onEdit,
    onDelete,
    onShare,
    onLike,
}) => (
    <Card className="transition-all duration-300 hover:shadow-md">
        <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 dark:bg-gray-900 bg-gray-300 rounded-lg flex items-center justify-center text-white font-semibold text-sm sm:text-base`}>
                        {post.title[0]?.toUpperCase() || 'U'}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <div className="flex-1 min-w-0">
                                <h3
                                    className="font-semibold text-sm sm:text-lg truncate hover:text-primary transition-colors cursor-pointer"
                                    onClick={() => onView(post.id)}
                                >
                                    {post.title || "untitled"}
                                </h3>
                            </div>
                            <div className="hidden sm:block">
                                <Badge variant="outline" className="text-xs">
                                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                                    Live
                                </Badge>
                            </div>
                        </div>

                        <p className="text-muted-foreground text-xs sm:text-sm line-clamp-1 mb-2">
                            {post.description}
                        </p>

                        <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">{formatDate(post.created_at)}</span>
                                <span className="sm:hidden">{new Date(post.created_at).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{post.views}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Heart
                                    className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-red-500 transition-colors"
                                    onClick={() => onLike(post.id)}
                                />
                                <span>{post.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{post.read_time}m</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 ml-2 sm:ml-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        onClick={() => onEdit(post.id)}
                    >
                        <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9 hidden sm:flex"
                        onClick={() => onShare(post)}
                    >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 sm:h-9 sm:w-9 hidden sm:flex ${deleteConfirm === post.id ? 'text-red-600 bg-red-50' : ''}`}
                        onClick={() => onDelete(post.id)}
                    >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 sm:h-9 sm:w-9">
                                <MoreVertical className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(post.id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View Post
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(post.id)}>
                                <Edit3 className="w-4 h-4 mr-2" />
                                Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onShare(post)}>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => onDelete(post.id)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deleteConfirm === post.id ? 'Confirm Delete' : 'Delete'}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </CardContent>
    </Card>
);
