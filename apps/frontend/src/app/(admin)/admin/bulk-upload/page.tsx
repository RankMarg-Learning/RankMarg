"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { useTopics } from '@/hooks/useTopics'
import { useSubtopics } from '@/hooks/useSubtopics'
import { useSubjects } from '@/hooks/useSubject'
import { bulkUploadQuestions, getBulkUploadStatus } from '@/services/bulk-upload.service'
import { UploadConfiguration } from '@/components/admin/bulk-upload/UploadConfiguration'
import { FilePreview } from '@/components/admin/bulk-upload/FilePreview'
import { ProcessingStatus } from '@/components/admin/bulk-upload/ProcessingStatus'

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
  files: any[]
  createdAt: string
  gptModel?: string
  lastUpdated: string
}

const BulkUpload = () => {
  const router = useRouter()
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('')
  const [selectedTopicId, setSelectedTopicId] = useState<string>('auto')
  const [selectedGptModel, setSelectedGptModel] = useState<string>('gpt-4o-mini')
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
      formData.append('gptModel', selectedGptModel)
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
          description: `Processing ${uploadedFiles.length} images with ${selectedGptModel}. This may take a few minutes.`,
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
    let pollCount = 0
    const maxPolls = 300 // Stop after 10 minutes (300 * 2 seconds)
    
    const poll = async () => {
      try {
        pollCount++
        const response = await getBulkUploadStatus(jobId)
        
        if (response.success) {
          setProcessingJob(response.data)
          
          // Stop polling if job is completed, failed, or expired
          if (response.data.status === 'completed' || 
              response.data.status === 'failed' || 
              response.data.isExpired) {
            
            if (response.data.status === 'completed') {
              toast({
                title: "Processing Complete!",
                description: `Successfully processed ${response.data.successCount} out of ${response.data.totalFiles} files.`,
                variant: "default"
              })
            } else if (response.data.status === 'failed') {
              toast({
                title: "Processing Failed",
                description: `Processing failed. Check the errors below for details.`,
                variant: "destructive"
              })
            } else if (response.data.isExpired) {
              toast({
                title: "Job Expired",
                description: "This job has expired and been cleaned up.",
                variant: "destructive"
              })
            }
            return
          }
          
          // Stop polling if we've reached max polls
          if (pollCount >= maxPolls) {
            toast({
              title: "Polling Timeout",
              description: "Stopped checking for updates. You can refresh the page to check status.",
              variant: "destructive"
            })
            return
          }
          
          // Continue polling with exponential backoff
          const delay = Math.min(2000 + (pollCount * 100), 5000) // Max 5 seconds
          setTimeout(poll, delay)
        } else {
          // Handle API errors
          console.error('Status polling error:', response.message)
          setProcessingJob({
            ...processingJob!,
            status: 'failed',
            errors: [response.message]
          })
          
          toast({
            title: "Status Check Failed",
            description: response.message,
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Status polling error:', error)
        toast({
          title: "Connection Error",
          description: "Failed to check job status. Please refresh the page.",
          variant: "destructive"
        })
      }
    }

    poll()
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
          <UploadConfiguration
            selectedSubjectId={selectedSubjectId}
            setSelectedSubjectId={setSelectedSubjectId}
            selectedTopicId={selectedTopicId}
            setSelectedTopicId={setSelectedTopicId}
            selectedGptModel={selectedGptModel}
            setSelectedGptModel={setSelectedGptModel}
            subjects={subjects}
            topics={topics}
            subjectsLoading={subjectsLoading}
            topicsLoading={topicsLoading}
            handleFileUpload={handleFileUpload}
            handleSubmit={handleSubmit}
            isUploading={isUploading}
            uploadedFiles={uploadedFiles}
          />
        </div>

        {/* File Preview */}
        <div className="lg:col-span-2">
          <FilePreview
            uploadedFiles={uploadedFiles}
            removeFile={removeFile}
            isUploading={isUploading}
          />
        </div>
      </div>

      {/* Processing Status */}
      <ProcessingStatus processingJob={processingJob} />
    </div>
  )
}

export default BulkUpload
