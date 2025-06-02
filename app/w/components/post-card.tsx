'use client'
import React from 'react';
import {
    Eye,
    Heart,
    Calendar,
    Edit3,
    Trash2,
    Share2,
    MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Post } from '../../interfaces';
import { formatDate } from '@/lib/utils';

interface PostCardProps {
    post: Post;
    deleteConfirm: string | null;
    onView: (postId: string) => void;
    onEdit: (postId: string) => void;
    onDelete: (postId: string) => void;
    onShare: (post: Post) => void;
    onLike: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
    post,
    deleteConfirm,
    onView,
    onEdit,
    onDelete,
    onShare,
    onLike,
}) => (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className={`h-24 sm:h-32 relative`}>
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 right-2 sm:right-4 flex justify-between items-end">
                <div className="flex gap-2 sm:gap-4 text-white/90 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{post.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Heart
                            className="w-3 h-3 sm:w-4 sm:h-4 cursor-pointer hover:text-red-300 transition-colors"
                            onClick={() => onLike(post.id)}
                        />
                        <span>{post.likes}</span>
                    </div>
                </div>
                <div className="text-white/70 text-xs">
                    {post.read_time}m read
                </div>
            </div>
        </div>

        <CardHeader className="pb-3 p-3 sm:p-6">
            <CardTitle
                className="line-clamp-2 group-hover:text-primary transition-colors cursor-pointer text-sm sm:text-base"
                onClick={() => onView(post.id)}
            >
                {post.title || "untitled"}
            </CardTitle>
            <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                {post.description}
            </CardDescription>
        </CardHeader>

        <CardContent className="pt-0 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{formatDate(post.created_at)}</span>
                    <span className="sm:hidden">{new Date(post.created_at).toLocaleDateString()}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                    Live
                </Badge>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex gap-1">
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
                        className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                        onClick={() => onShare(post)}
                    >
                        <Share2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className={`h-8 w-8 p-0 sm:h-9 sm:w-9 ${deleteConfirm === post.id ? 'text-red-600 bg-red-50' : ''}`}
                        onClick={() => onDelete(post.id)}
                    >
                        <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                </div>

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
        </CardContent>
    </Card>
);
