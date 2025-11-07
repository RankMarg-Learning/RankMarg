
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, Upload, CheckCircle, XCircle, Clock, Eye } from 'lucide-react'

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
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

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
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {uploadedFiles.map((file) => (
              <div key={file.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border">
                  <img
                    src={file.url}
                    alt={file.fileName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute top-2 right-2 flex gap-1">
                  <Badge 
                    variant="secondary" 
                    className={`text-xs hidden ${getStatusColor(file.status)}`}
                  >
                    <span className="flex items-center gap-1">
                      {getStatusIcon(file.status)}
                      {file.status}
                    </span>
                  </Badge>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                    disabled={isUploading}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <div className="absolute top-2 left-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => window.open(file.url, '_blank')}
                  >
                    <Eye className="h-3 w-3" />
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground truncate">
                  {file.fileName}
                </p>
                {file.error && (
                  <p className="text-xs text-red-500 mt-1" title={file.error}>
                    {file.error.length > 50 ? `${file.error.substring(0, 50)}...` : file.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
