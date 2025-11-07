"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Clock, FileText, AlertTriangle } from 'lucide-react'
import { FileProcessingStatus } from '@/services/bulk-upload.service'

interface ProcessingJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  successCount: number
  errorCount: number
  errors: string[]
  files: FileProcessingStatus[]
  createdAt: string
  gptModel?: string
  lastUpdated: string
  isExpired?: boolean
  timeRemaining?: number
  lastUpdatedAgo?: number
  progressPercentage?: number
}

interface ProcessingStatusProps {
  processingJob: ProcessingJob | null
}

export const ProcessingStatus = ({ processingJob }: ProcessingStatusProps) => {
  if (!processingJob) return null

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

  const getFileStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'failed':
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
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon(processingJob.status)}
          Processing Status
          {processingJob.gptModel && (
            <Badge variant="outline" className="ml-auto">
              {processingJob.gptModel}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Real-time updates on your bulk upload job
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{processingJob.processedFiles} / {processingJob.totalFiles}</span>
        </div>
        <Progress 
          value={processingJob.progressPercentage || (processingJob.processedFiles / processingJob.totalFiles) * 100} 
          className="w-full"
        />
        
        {/* Additional metadata */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Last updated: {new Date(processingJob.lastUpdated).toLocaleString()}</div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              Redis Connected
            </span>
            <span>•</span>
            <span>Job ID: {processingJob.id.slice(-8)}</span>
          </div>
          {processingJob.isExpired && (
            <div className="text-red-500 font-medium">⚠️ This job has expired</div>
          )}
          {processingJob.timeRemaining && !processingJob.isExpired && (
            <div>Expires in: {Math.round(processingJob.timeRemaining / (1000 * 60 * 60))} hours</div>
          )}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-green-600">{processingJob.successCount}</div>
            <div className="text-muted-foreground">Successful</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-red-600">{processingJob.errorCount}</div>
            <div className="text-muted-foreground">Failed</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-blue-600">
              {processingJob.totalFiles - processingJob.processedFiles}
            </div>
            <div className="text-muted-foreground">Remaining</div>
          </div>
        </div>

        {/* Individual File Status */}
        {processingJob.files && processingJob.files.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Individual File Status
            </h4>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {processingJob.files.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs truncate">{file.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getFileStatusColor(file.status)}`}
                    >
                      <span className="flex items-center gap-1">
                        {getStatusIcon(file.status)}
                        {file.status}
                      </span>
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {processingJob.errors.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Errors encountered:</div>
              <ul className="list-disc list-inside text-sm space-y-1">
                {processingJob.errors.slice(0, 5).map((error, index) => (
                  <li key={index} className="break-words">{error}</li>
                ))}
                {processingJob.errors.length > 5 && (
                  <li>... and {processingJob.errors.length - 5} more errors</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {processingJob.status === 'completed' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Bulk upload completed! {processingJob.successCount} questions were successfully processed and added to the database.
              {processingJob.errorCount > 0 && (
                <span className="block mt-1 text-amber-600">
                  {processingJob.errorCount} files failed to process.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

        {processingJob.status === 'failed' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Bulk upload failed. Please check the errors above and try again.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
