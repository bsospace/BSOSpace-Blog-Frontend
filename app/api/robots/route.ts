import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const baseUrl = 'https://blog.bsospace.com';
  
  const robotsTxt = `# BSO Space Blog Robots.txt
User-agent: *
Allow: /

# Disallow admin and private areas
Disallow: /w/
Disallow: /auth/
Disallow: /_action/
Disallow: /api/

# Allow important pages
Allow: /home
Allow: /posts/
Allow: /sitemap.xml

# Sitemap
Sitemap: ${baseUrl}/sitemap.xml

# Crawl-delay for respectful crawling
Crawl-delay: 1

# Additional rules for specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /`;

  return new NextResponse(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
} 