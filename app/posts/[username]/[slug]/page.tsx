import { Metadata } from 'next';
import { Post } from '@/app/interfaces';
import { axiosInstanceServer } from '@/app/utils/api-server';
import PostClient from './PostClient';
import { notFound } from 'next/navigation';

function sanitizeParam(value: string): string {
    return decodeURIComponent(value).replace(/^@/, '').split(/[?#]/)[0].trim();
}

export async function generateMetadata({ params }: { params: { username: string; slug: string } }): Promise<Metadata> {
    const { username: rawUsername, slug: rawSlug } = await params;
    const username = sanitizeParam(rawUsername);
    const slug = sanitizeParam(rawSlug);

    const apiUrl = `/posts/public/${username}/${slug}`;

    try {
        const res = await axiosInstanceServer.get(apiUrl);
        const post = res.data.data as Post;
        const baseUrl = 'https://blog.bsospace.com';
        const postUrl = `${baseUrl}/posts/${username}/${slug}`;

        return {
            title: post.title,
            description: post.description,
            openGraph: {
                title: post.title,
                description: post.description,
                url: postUrl,
                type: "article",
                images: [
                    {
                        url: post.thumbnail || `${baseUrl}/default-thumbnail.png`,
                        width: 1200,
                        height: 630,
                        alt: post.title,
                    },
                ],
                authors: [post.author?.username || "Unknown Author"],
                publishedTime: post.published_at ?? undefined,
                modifiedTime: post.updated_at ?? undefined,
                tags: post.tags?.map(tag => typeof tag === "string" ? tag : tag.name || "") || [],
            },
            twitter: {
                card: "summary_large_image",
                title: post.title,
                description: post.description,
                images: [post.thumbnail || `${baseUrl}/default-thumbnail.png`],
                creator: "@bsospace",
                site: "@bsospace",
            },
            alternates: {
                canonical: postUrl,
            },
        };
    } catch (e: any) {
        console.error('[generateMetadata] API Error:', e.response?.status, e.response?.data);
        if (e.response?.status === 404) notFound();
        throw e;
    }
}

export default async function PostPage({ params }: { params: { username: string; slug: string } }) {
  const { username: rawUsername, slug: rawSlug } = await params;
  const username = sanitizeParam(rawUsername);
  const slug = sanitizeParam(rawSlug);
  const apiUrl = `/posts/public/${username}/${slug}`;

  try {
    const res = await axiosInstanceServer.get(apiUrl);
    const post = res.data.data as Post;
    return <PostClient post={post} isLoadingPost={false} />;
  } catch (e: any) {
    console.error('[PostPage] API Error:', e.response?.status, e.response?.data);
    if (e.response?.status === 404) notFound();
    throw e;
  }
}
