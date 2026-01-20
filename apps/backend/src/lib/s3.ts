import ServerConfig from "@/config/server.config";
import {
    S3Client,
} from "@aws-sdk/client-s3";


export const s3 = new S3Client({
    region: ServerConfig.s3.region!,
    credentials: {
        accessKeyId: ServerConfig.s3.accessKeyId!,
        secretAccessKey: ServerConfig.s3.secretAccessKey!,
    },
});