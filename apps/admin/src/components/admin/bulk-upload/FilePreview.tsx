
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Trash2, Upload, Eye } from 'lucide-react'

interface UploadedFile {
  id: string
  url: string
  fileName: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

interface FilePreviewProps {
  uploadedFiles: UploadedFile[]
  removeFile: (id: string) => void
  isUploading: boolean
}

export const FilePreview = ({
  uploadedFiles,
  removeFile,
  isUploading,
}: FilePreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
        <CardDescription>
          Preview of uploaded question screenshots
        </CardDescription>
      </CardHeader>
      <CardContent>
        {uploadedFiles.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Upload className="mx-auto h-12 w-12 mb-4" />
            <p>No files uploaded yet</p>
            <p className="text-sm">Select images to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                className="group flex flex-col items-center gap-3 rounded-lg border p-2 text-center transition-shadow hover:shadow-sm sm:flex-row sm:items-center sm:justify-between sm:text-left"
              >
                <div className="min-w-0 space-y-2 sm:flex-1">
                  <div className="flex flex-wrap justify-center sm:justify-start">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-sm font-medium text-primary hover:underline"
                    >
                      {file.fileName}
                    </a>
                  </div>
                  {file.error && (
                    <p className="text-xs text-red-500" title={file.error}>
                      {file.error.length > 50
                        ? `${file.error.substring(0, 50)}...`
                        : file.error}
                    </p>
                  )}
                </div>
                <div className="flex w-full items-center justify-center gap-2 sm:w-auto">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={isUploading}
                    asChild
                  >
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1"
                      aria-label={`Open ${file.fileName} in a new tab`}
                    >
                      <Eye className="h-3 w-3" />
                      <span className="hidden text-xs font-medium sm:inline">
                        Open
                      </span>
                    </a>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span className="hidden text-xs font-medium sm:inline">
                      Remove
                    </span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
