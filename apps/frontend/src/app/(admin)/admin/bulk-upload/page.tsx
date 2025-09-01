"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Trash2, Upload, CheckCircle, XCircle, Clock } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { useTopics } from '@/hooks/useTopics'
import { useSubtopics } from '@/hooks/useSubtopics'
import { useSubjects } from '@/hooks/useSubject'
import { bulkUploadQuestions, getBulkUploadStatus } from '@/services/bulk-upload.service'

interface UploadedFile {
  id: string
  file: File
  preview: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  error?: string
}

interface ProcessingJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalFiles: number
  processedFiles: number
  successCount: number
  errorCount: number
  errors: string[]
  createdAt: string
}

const BulkUpload = () => {
  const router = useRouter()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('auto')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [processingJob, setProcessingJob] = useState<ProcessingJob | null>(null)
  const { subjects: rawSubjects = [], isLoading: subjectsLoading } = useSubjects()
  const { topics: rawTopics = [], isLoading: topicsLoading } = useTopics(selectedSubjectId)
  useSubtopics(selectedTopicId === 'auto' ? undefined : selectedTopicId)

  const subjects = Array.isArray(rawSubjects?.data) ? rawSubjects.data : Array.isArray(rawSubjects) ? rawSubjects : []
  const topics = Array.isArray(rawTopics?.data) ? rawTopics.data : Array.isArray(rawTopics) ? rawTopics : []


  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newFiles: UploadedFile[] = []
    
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const preview = URL.createObjectURL(file)
        
        newFiles.push({
          id,
          file,
          preview,
          status: 'pending'
        })
      }
    })

    setUploadedFiles(prev => [...prev, ...newFiles])
    
    event.target.value = ''
  }, [])

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview)
      }
      return prev.filter(f => f.id !== id)
    })
  }

  const handleSubmit = async () => {
    if (!selectedSubjectId) {
      toast({
        title: "Subject Required",
        description: "Please select a subject before uploading.",
        variant: "destructive"
      })
      return
    }

    if (uploadedFiles.length === 0) {
      toast({
        title: "No Files",
        description: "Please upload at least one image.",
        variant: "destructive"
      })
      return
    }

    setIsUploading(true)

    try {
      const formData = new FormData()
      formData.append('subjectId', selectedSubjectId)
      if (selectedTopicId && selectedTopicId !== 'auto') {
        formData.append('topicId', selectedTopicId)
      }

      uploadedFiles.forEach((uploadedFile, index) => {
        formData.append(`files`, uploadedFile.file)
      })

      const response = await bulkUploadQuestions(formData)

      if (response.success) {
        setProcessingJob(response.data.job)
        
        toast({
          title: "Upload Started",
          description: `Processing ${uploadedFiles.length} images. This may take a few minutes.`,
          variant: "default"
        })

        // Start polling for status updates
        pollJobStatus(response.data.job.id)
      } else {
        throw new Error(response.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Failed to start processing",
        variant: "destructive"
      })
    } finally {
      setIsUploading(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const poll = async () => {
      try {
        const response = await getBulkUploadStatus(jobId)
        if (response.success) {
          setProcessingJob(response.data)
          
          if (response.data.status === 'completed' || response.data.status === 'failed') {
            // Stop polling
            return
          }
          
          // Continue polling
          setTimeout(poll, 2000)
        }
      } catch (error) {
        console.error('Status polling error:', error)
        // Stop polling on error
      }
    }

    poll()
  }

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Question Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple question screenshots and convert them to structured data using AI
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => router.push('/admin/questions')}
        >
          Back to Questions
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Configuration */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>
                Select subject and topic for the questions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <SearchableSelect
                  value={selectedSubjectId}
                  onValueChange={setSelectedSubjectId}
                  disabled={subjectsLoading}
                  placeholder={subjectsLoading ? "Loading subjects..." : "Select subject"}
                  options={subjects.map(subject => ({
                    value: subject.id,
                    label: subject.name
                  }))}
                  emptyMessage="No subjects found"
                  searchPlaceholder="Search subjects..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topic">Topic (Optional)</Label>
                <SearchableSelect
                  value={selectedTopicId}
                  onValueChange={setSelectedTopicId}
                  disabled={!selectedSubjectId || topicsLoading || subjectsLoading}
                  placeholder="Select topic or let AI decide"
                  options={[
                    { value: 'auto', label: 'Let AI decide topic' },
                    ...(topics?.map(topic => ({
                      value: topic.id,
                      label: topic.name
                    })) || [])
                  ]}
                  emptyMessage={
                    topicsLoading ? "Loading topics..." :
                    selectedSubjectId ? `No topics available for selected subject` :
                    "Select a subject first"
                  }
                  searchPlaceholder="Search topics..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Upload Images</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <p className="text-sm text-muted-foreground">
                  Upload screenshots of questions. Supports JPG, PNG, WebP formats.
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={isUploading || uploadedFiles.length === 0 || !selectedSubjectId || subjectsLoading}
                className="w-full"
              >
                {isUploading ? (
                  <>
                    <Upload className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload & Process ({uploadedFiles.length} files)
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* File Preview */}
        <div className="lg:col-span-2">
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
                          src={file.preview}
                          alt={file.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Badge variant="secondary" className="text-xs">
                          {getStatusIcon(file.status)}
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
                      <p className="mt-2 text-xs text-muted-foreground truncate">
                        {file.file.name}
                      </p>
                      {file.error && (
                        <p className="text-xs text-red-500 mt-1">{file.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing Status */}
      {processingJob && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(processingJob.status)}
              Processing Status
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
              value={(processingJob.processedFiles / processingJob.totalFiles) * 100} 
              className="w-full"
            />
            
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

            {processingJob.errors.length > 0 && (
              <Alert>
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Errors encountered:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {processingJob.errors.slice(0, 5).map((error, index) => (
                      <li key={index}>{error}</li>
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
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default BulkUpload
