import { User } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { verifyToken } from "@/app/utils/auth";
import { v4 as uuidv4 } from "uuid";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Cloudflare R2 settings
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

const s3Client = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY!,
    secretAccessKey: R2_SECRET_KEY!,
  },
});

// Function to extract images from content and upload to Cloudflare R2
async function uploadImagesFromContent(content: string): Promise<string> {
  const imgTagRegex = /<img[^>]+src="([^">]+)"/g;
  let match;
  const uploads = [];

  // Detect every <img> tag with a base64 src
  while ((match = imgTagRegex.exec(content)) !== null) {
    const imgSrc = match[1];

    // Check if it is base64
    const isBase64 = imgSrc.startsWith("data:image/");
    if (isBase64) {
      // Separate the image type and base64 data
      const base64Data = imgSrc.split(";base64,").pop();
      const contentTypeMatch = imgSrc.match(/^data:([^;]+);base64/);
      const contentType = contentTypeMatch ? contentTypeMatch[1] : "image/jpeg";

      // Convert file type to file extension
      const fileExtension = contentType.split("/")[1]; // Extract extension from content-type e.g., "jpeg", "png"
      const newFileName = `${uuidv4()}.${fileExtension}`; // Generate new file name based on original file type

      // Decode base64 to Buffer
      const imageBuffer = Buffer.from(base64Data!, "base64");

      // Upload image to Cloudflare R2
      const uploadPromise = s3Client.send(
        new PutObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: newFileName,
          Body: imageBuffer,
          ContentType: contentType, // Set file type based on base64
        })
      );

      // Create new URL from Cloudflare R2
      const newImageUrl = `https://bso-image.posyayee.shop/${newFileName}`;
      content = content.replace(imgSrc, newImageUrl); // Replace original URL with new URL

      uploads.push(uploadPromise);
    }
  }

  // Wait for all uploads
  await Promise.all(uploads);

  return content;
}

// Handler for POST requests to create a post
export async function POST(req: NextRequest) {
  if (req.method !== "POST") {
    return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const { title, content, categoryId, tagIds, key } = await req.json();

    const token = req.cookies.get("auth-token");

    if (!token) {
      return NextResponse.json({ error: "No token found" }, { status: 401 });
    }

    // Verify and decode the token
    const decoded: User | null = verifyToken(
      token?.value as unknown as string
    ) as User | null;

    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tagsArray = tagIds || [];

    // Check if the title contains non-English characters
    const isNonEnglish = /[^\x00-\x7F]/.test(title);

    // Generate initial slug from title or UUID if non-English
    let slug = isNonEnglish ? uuidv4() : title.toLowerCase().replace(/ /g, "-");

    // Check if slug already exists in the database
    let existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    // If slug exists, append UUID to make it unique
    if (existingPost) {
      slug = `${slug}-${uuidv4()}`;
    }

    // Extract and upload images from content
    const updatedContent = await uploadImagesFromContent(content);

    // Save post to the database with updated content containing new image URLs
    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        published: key !== null ? false : true,
        key: key !== null ? key : null,
        content: updatedContent,
        authorId: decoded?.id,
        categoryId: parseInt(categoryId),
        tags: {
          connect: tagsArray.map((id: number) => ({ id })),
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: any) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { error: "Failed to create post", message: error.message },
      { status: 500 }
    );
  }
}
