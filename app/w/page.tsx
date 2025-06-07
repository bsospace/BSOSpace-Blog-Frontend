'use client'
import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Eye,
  Heart,
  Clock,
  Calendar,
  Edit3,
  Trash2,
  SortAsc,
  SortDesc,
  Grid3X3,
  List,
  MoreVertical,
  Share2,
  TrendingUp,
  Users,
  FileText,
  Globe,
  ArrowUpRight,
  Sparkles,
  Zap,
  Filter
} from 'lucide-react';

// shadcn/ui imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Post } from '../interfaces';
import { axiosInstance } from '../utils/api';
import { formatDate, getnerateId } from '@/lib/utils';
import { PostCard } from './components/post-card';
import { PostListItem } from './components/post-item';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/authContext';

const PostsManagement = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Post>('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch posts function
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const response = await axiosInstance.get('/posts/my-posts');
      setPosts(response.data.data.posts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchPosts();
  }, []);

  // Event Handlers
  const handleCreatePost = () => {
    router.push(`/w/${getnerateId()}`)
  };

  const handleViewPost = (slug: string) => {
    router.push(`/posts/@${user?.username}/${slug}`);
  };

  const handleEditPost = (shortSlug: string) => {
    router.push(`w/${shortSlug}`)
  };

  const handleDeletePost = async (postId: string) => {
    if (deleteConfirm !== postId) {
      setDeleteConfirm(postId);
      return;
    }

    try {
      await axiosInstance.delete(`/posts/${postId}`);
      setPosts(posts.filter(post => post.id !== postId));
      setDeleteConfirm(null);
      console.log('Post deleted successfully');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
    }
  };

  const handleSharePost = async (post: Post) => {
    const shareUrl = `${window.location.origin}/posts/${post.id}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        console.log('Link copied to clipboard');
        // You might want to show a toast notification here
      } catch (err) {
        console.error('Failed to copy link:', err);
      }
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await axiosInstance.post(`/posts/${postId}/like`);
      // Update the post in the local state
      setPosts(posts.map(post =>
        post.id === postId
          ? { ...post, likes: (post.likes || 0) + 1 }
          : post
      ));
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const getRandomGradient = () => {
    const gradients = [
      'bg-gradient-to-br from-violet-500 to-purple-600',
      'bg-gradient-to-br from-blue-500 to-cyan-600',
      'bg-gradient-to-br from-green-500 to-emerald-600',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-pink-500 to-rose-600',
      'bg-gradient-to-br from-indigo-500 to-blue-600'
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const filteredAndSortedPosts = posts
    ?.filter(post => {
      const title = post.title || '';
      const description = post.description || '';
      return title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());
    })
    .sort((a, b) => {
      let aValue = (a[sortBy] as string) || '';
      let bValue = (b[sortBy] as string) || '';

      if (sortBy === 'created_at') {
        return sortOrder === 'asc'
          ? new Date(aValue).getTime() - new Date(bValue).getTime()
          : new Date(bValue).getTime() - new Date(aValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 sm:p-8 space-y-4 sm:space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-6 sm:h-8 w-48 sm:w-64" />
            <Skeleton className="h-3 sm:h-4 w-32 sm:w-48" />
          </div>
          <Skeleton className="h-8 sm:h-10 w-full sm:w-32" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3 sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-3 sm:h-4 w-16 sm:w-20" />
                    <Skeleton className="h-6 sm:h-8 w-8 sm:w-16" />
                  </div>
                  <Skeleton className="h-8 w-8 sm:h-12 sm:w-12 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <Skeleton className="h-24 sm:h-32 w-full" />
              <CardContent className="p-3 sm:p-6 space-y-2 sm:space-y-4">
                <Skeleton className="h-4 sm:h-6 w-3/4" />
                <Skeleton className="h-3 sm:h-4 w-full" />
                <Skeleton className="h-3 sm:h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4 sm:p-8">
        <Alert variant="destructive">
          <Zap className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-8 space-y-4 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-black text-2xl sm:text-3xl font-bold">
              Content Studio
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your amazing content</p>
          </div>
        </div>

        <Button
          className="w-full sm:w-auto sm:max-w-40"
          onClick={handleCreatePost}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Stats Dashboard */}
      <div className="flex md:flex-row gap-4 flex-col">
        <Card className='w-full'>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Posts</p>
                <p className="text-lg sm:text-2xl font-bold">{posts?.length || 0}</p>
              </div>
              <div className="p-2 sm:p-3 bg-violet-100 rounded-lg">
                <FileText className="w-4 h-4 sm:w-6 sm:h-6 text-violet-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='w-full'>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {posts?.reduce((sum, post) => sum + (post.views || 0), 0).toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-blue-100 rounded-lg">
                <TrendingUp className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=' w-full'>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Likes</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {posts?.reduce((sum, post) => sum + (post.likes || 0), 0).toLocaleString() || 0}
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-pink-100 rounded-lg">
                <Heart className="w-4 h-4 sm:w-6 sm:h-6 text-pink-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className=' w-full'>
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Avg. Read Time</p>
                <p className="text-lg sm:text-2xl font-bold">
                  {posts?.length > 0 ? Math.round(posts.reduce((sum, post) => sum + (post.read_time || 0), 0) / posts.length) : 0}m
                </p>
              </div>
              <div className="p-2 sm:p-3 bg-green-100 rounded-lg">
                <Clock className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
            <div className="flex-1 max-w-full lg:max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as keyof Post)}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Date Created</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                </Button>

                <Separator orientation="vertical" className="h-8 hidden sm:block" />

                <div className="flex border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Alert */}
      {deleteConfirm && (
        <Alert>
          <Trash2 className="h-4 w-4" />
          <AlertDescription>
            Click delete again to confirm removal of this post.
          </AlertDescription>
        </Alert>
      )}

      {/* Posts Display */}
      {filteredAndSortedPosts?.length === 0 ? (
        <Card>
          <CardContent className="p-6 sm:p-12 text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base">
              {searchTerm ? "Try adjusting your search terms" : "Start creating your first post"}
            </p>
            <Button
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              onClick={handleCreatePost}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid'
          ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6"
          : "space-y-3 sm:space-y-4"
        }>
          {filteredAndSortedPosts?.map((post) => (
            viewMode === 'grid'
              ? <PostCard 
                  key={post.id} 
                  post={post} 
                  deleteConfirm={deleteConfirm}
                  onView={() => handleViewPost(post.id)}
                  onEdit={() => handleEditPost(post.short_slug)}
                  onDelete={() => handleDeletePost(post.id)}
                  onShare={() => handleSharePost(post)}
                  onLike={() => handleLikePost(post.id)}
                />
              : <PostListItem 
                  key={post.id} 
                  post={post}
                  deleteConfirm={deleteConfirm}
                  onView={() => handleViewPost(post.id)}
                onEdit={() => handleEditPost(post.short_slug)}
                  onDelete={() => handleDeletePost(post.id)}
                  onShare={() => handleSharePost(post)}
                  onLike={() => handleLikePost(post.id)}
                />
          ))}
        </div>
      )}
    </div>
  );
};

export default PostsManagement;