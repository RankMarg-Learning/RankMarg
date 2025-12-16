import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface UseImageUploadOptions {
  onImageInserted: (markdown: string, fieldName?: string) => void;
  getFormValue: (fieldName: string) => any;
}

export const useImageUpload = ({ onImageInserted, getFormValue }: UseImageUploadOptions) => {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const generateImageName = (questionTitle: string) => {
    const baseName = questionTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 30);
    const index = Math.floor(1000 + Math.random() * 9000);
    return `${baseName}-${index.toString()}`;
  };

  const uploadImage = async (file: File, fieldName?: string) => {
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Image size should be less than 5MB",
        variant: "default",
        duration: 500,
        className: "bg-red-500 text-white",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Please upload an image file",
        variant: "default",
        duration: 500,
        className: "bg-red-500 text-white",
      });
      return;
    }

    setIsUploading(true);

    try {
      const readFileAsDataURL = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      };

      const dataUrl = await readFileAsDataURL(file);

      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      };

      const img = await loadImage(dataUrl);

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Failed to create canvas context");
      }

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const originalImage = canvas.toDataURL("image/png", 0.9);
      const questionTitle = getFormValue("title") || "question";
      const imageName = generateImageName(questionTitle);

      const response = await api.post("/m/upload-s3", {
        image: originalImage,
        folder: "question-images",
        fileName: imageName
      });

      const imageUrl = response.data.data;
      const markdownImage = `![${imageName}](${imageUrl})`;
      
      onImageInserted(markdownImage, fieldName);

      toast({
        title: "Image uploaded successfully!",
        variant: "default",
        duration: 3000,
        className: "bg-green-500 text-white",
      });

    } catch (error) {
      console.error("Image upload error:", error);
      toast({
        title: "Failed to process or upload image",
        variant: "default",
        duration: 3000,
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    uploadImage,
    isUploading,
  };
};
