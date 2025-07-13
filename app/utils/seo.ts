import { Metadata } from 'next';

export interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
  nofollow?: boolean;
}

export function generateMetadata(data: SEOData): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = 'https://blog.bsospace.com/blog-image.webp',
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
    noindex = false,
    nofollow = false,
  } = data;

  const fullTitle = title ? `${title} | BSO Space Blog` : 'BSO Space Blog - Software Engineering Knowledge Hub';
  const fullDescription = description || 'BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.';

  const defaultKeywords = [
    'software engineering',
    'programming',
    'technology',
    'blog',
    'coding',
    'development',
    'BSO Space',
    'student projects',
    'tech knowledge'
  ];

  const allKeywords = [...new Set([...defaultKeywords, ...keywords])];

  const metadata: Metadata = {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    authors: [{ name: author || 'BSO Space Team' }],
    creator: 'BSO Space',
    publisher: 'BSO Space',
    robots: {
      index: !noindex,
      follow: !nofollow,
      googleBot: {
        index: !noindex,
        follow: !nofollow,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url || 'https://blog.bsospace.com',
    },
    openGraph: {
      title: fullTitle,
      description: fullDescription,
      url: url || 'https://blog.bsospace.com',
      siteName: 'BSO Space Blog',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: fullTitle,
          type: 'image/webp',
        },
      ],
      locale: 'en_US',
      type: type,
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description: fullDescription,
      images: [image],
      creator: '@bsospace',
      site: '@bsospace',
    },
  };

  // Add article-specific metadata
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
    };

    if (publishedTime) {
      metadata.openGraph = {
        ...metadata.openGraph,
        publishedTime,
      };
    }

    if (modifiedTime) {
      metadata.openGraph = {
        ...metadata.openGraph,
        modifiedTime,
      };
    }

    if (author) {
      metadata.openGraph = {
        ...metadata.openGraph,
        authors: [author],
      };
    }

    if (section) {
      metadata.openGraph = {
        ...metadata.openGraph,
        section,
      };
    }

    if (tags.length > 0) {
      metadata.openGraph = {
        ...metadata.openGraph,
        tags,
      };
    }
  }

  return metadata;
}

export function generateStructuredData(data: SEOData) {
  const {
    title,
    description,
    image = 'https://blog.bsospace.com/blog-image.webp',
    url,
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
  } = data;

  const fullTitle = title ? `${title} | BSO Space Blog` : 'BSO Space Blog - Software Engineering Knowledge Hub';
  const fullDescription = description || 'BSO Blog is a collaborative blogging platform created by Software Engineering students, aimed at sharing knowledge, cutting-edge techniques, and real-world experiences.';
  const currentUrl = url || 'https://blog.bsospace.com';

  if (type === 'article') {
    return {
      "@context": "https://schema.org",
      "@type": "Article",
      "headline": fullTitle,
      "description": fullDescription,
      "image": image,
      "author": {
        "@type": "Person",
        "name": author || "BSO Space Team"
      },
      "publisher": {
        "@type": "Organization",
        "name": "BSO Space",
        "logo": {
          "@type": "ImageObject",
          "url": "https://blog.bsospace.com/logo.png"
        }
      },
      "datePublished": publishedTime,
      "dateModified": modifiedTime || publishedTime,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": currentUrl
      }
    };
  }

  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": fullTitle,
    "description": fullDescription,
    "url": currentUrl,
    "publisher": {
      "@type": "Organization",
      "name": "BSO Space",
      "logo": {
        "@type": "ImageObject",
        "url": "https://blog.bsospace.com/logo.png"
      }
    }
  };
}

export function generateBreadcrumbStructuredData(breadcrumbs: Array<{ label: string; href?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://blog.bsospace.com/home"
      },
      ...breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 2,
        "name": item.label,
        "item": item.href ? `https://blog.bsospace.com${item.href}` : undefined
      }))
    ]
  };
}

export function generateOrganizationStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BSO Space",
    "url": "https://blog.bsospace.com",
    "logo": "https://blog.bsospace.com/logo.png",
    "description": "Software Engineering Knowledge Hub - Collaborative blogging platform for students",
    "sameAs": [
      "https://twitter.com/bsospace",
      "https://github.com/bsospace"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "contact@bsospace.com"
    }
  };
}

export function generateWebsiteStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BSO Space Blog",
    "description": "Software Engineering Knowledge Hub - Collaborative blogging platform for students",
    "url": "https://blog.bsospace.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://blog.bsospace.com/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
}

export function sanitizeText(text: string, maxLength: number = 160): string {
  // Remove HTML tags
  const cleanText = text.replace(/<[^>]*>/g, '');
  
  // Remove extra whitespace
  const trimmedText = cleanText.replace(/\s+/g, ' ').trim();
  
  // Truncate if too long
  if (trimmedText.length <= maxLength) {
    return trimmedText;
  }
  
  // Truncate at word boundary
  const truncated = trimmedText.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  return lastSpace > 0 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
} 