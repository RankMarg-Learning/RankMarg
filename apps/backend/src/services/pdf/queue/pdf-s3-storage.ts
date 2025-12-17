import { S3Client, PutObjectCommand, HeadObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import ServerConfig from "@/config/server.config";

const s3Client = new S3Client({
  region: ServerConfig.s3.region,
  credentials: {
    accessKeyId: ServerConfig.s3.accessKeyId!,
    secretAccessKey: ServerConfig.s3.secretAccessKey!,
  },
});

export interface PDFUploadResult {
  url: string;
  key: string;
  bucket: string;
}

export interface PDFCheckResult {
  exists: boolean;
  url?: string;
  key?: string;
}

/**
 * Generate deterministic S3 key based on test/data identifier
 * Same test/data will always map to the same S3 location
 */
export function generatePDFKey(
  identifier: string, // e.g., testId
  type: string,
  folder: string = "pdfs"
): string {
  // Create a deterministic key based on identifier and type
  const sanitizedId = identifier.replace(/[^a-z0-9]/gi, "_");
  const sanitizedType = type.toLowerCase();
  return `${folder}/${sanitizedType}/${sanitizedId}.pdf`;
}

/**
 * Check if PDF already exists in S3
 */
export async function checkPDFExistsInS3(
  identifier: string,
  type: string,
  folder: string = "pdfs"
): Promise<PDFCheckResult> {
  try {
    const s3Key = generatePDFKey(identifier, type, folder);

    const command = new HeadObjectCommand({
      Bucket: ServerConfig.s3.bucket!,
      Key: s3Key,
    });

    await s3Client.send(command);

    // PDF exists
    const publicUrl = `https://cdn.rankmarg.in/${s3Key}`;
    return {
      exists: true,
      url: publicUrl,
      key: s3Key,
    };
  } catch (error: any) {
    // If error is 404 (NotFound), PDF doesn't exist
    if (error.name === "NotFound" || error.$metadata?.httpStatusCode === 404) {
      return {
        exists: false,
      };
    }
    // For other errors, log and assume it doesn't exist
    console.error(`Error checking PDF existence in S3 for ${identifier}:`, error);
    return {
      exists: false,
    };
  }
}

/**
 * Upload PDF buffer to S3
 * Uses deterministic key if identifier is provided, otherwise generates unique key
 */
export async function uploadPDFToS3(
  buffer: Buffer,
  fileName: string,
  folder: string = "pdfs",
  identifier?: string, // Optional: if provided, uses deterministic key
  type?: string // Required if identifier is provided
): Promise<PDFUploadResult> {
  try {
    let s3Key: string;

    if (identifier && type) {
      // Use deterministic key for the same test/data
      s3Key = generatePDFKey(identifier, type, folder);
    } else {
      // Generate unique key for new uploads
      const extension = "pdf";
      const uniqueFileName = `${Date.now()}-${fileName.replace(/[^a-z0-9]/gi, "_")}.${extension}`;
      s3Key = `${folder}/${uniqueFileName}`;
    }

    const command = new PutObjectCommand({
      Bucket: ServerConfig.s3.bucket!,
      Key: s3Key,
      Body: buffer,
      ContentType: "application/pdf",
      ContentDisposition: `attachment; filename="${fileName}.pdf"`,
    });

    await s3Client.send(command);

    // Generate public URL
    const publicUrl = `https://cdn.rankmarg.in/${s3Key}`;

    return {
      url: publicUrl,
      key: s3Key,
      bucket: ServerConfig.s3.bucket!,
    };
  } catch (error) {
    throw new Error(`Failed to upload PDF to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Download PDF from S3 by key
 */
export async function downloadPDFFromS3(
  key: string
): Promise<Buffer> {
  try {
    const command = new GetObjectCommand({
      Bucket: ServerConfig.s3.bucket!,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error("No body in S3 response");
    }

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  } catch (error) {
    throw new Error(`Failed to download PDF from S3: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
