"use client"

import { useState, useCallback, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from '@/hooks/use-toast'
import { useTopics } from '@/hooks/useTopics'
import { useSubtopics } from '@/hooks/useSubtopics'
import { useSubjects } from '@/hooks/useSubject'
import { bulkUploadQuestions, getBulkUploadStatus } from '@/services/bulk-upload.service'
import { UploadConfiguration } from '@/components/admin/bulk-upload/UploadConfiguration'
import { FilePreview } from '@/components/admin/bulk-upload/FilePreview'
import { ProcessingStatus } from '@/components/admin/bulk-upload/ProcessingStatus'
import api from '@/utils/api'

interface UploadedFile {
  id: string
  url: string
  fileName: string
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
  const searchParams = useSearchParams()
  
  // Initialize from URL params
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(searchParams.get('subjectId') || '')
  const [selectedTopicId, setSelectedTopicId] = useState<string>(searchParams.get('topicId') || '')
  const [selectedGptModel, setSelectedGptModel] = useState<string>('gpt-5-mini')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [processingJob, setProcessingJob] = useState<ProcessingJob | null>(null)
  const [additionalInstructions, setAdditionalInstructions] = useState<string>('')
  const { subjects: rawSubjects = [], isLoading: subjectsLoading } = useSubjects()
  const { topics: rawTopics = [], isLoading: topicsLoading } = useTopics(selectedSubjectId)
  useSubtopics(selectedTopicId || undefined)

  const subjects = Array.isArray(rawSubjects) ? rawSubjects : []
  const topics = Array.isArray(rawTopics) ? rawTopics : []
  
  // Update URL when subjectId or topicId changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedSubjectId) {
      params.set('subjectId', selectedSubjectId)
    }
    if (selectedTopicId) {
      params.set('topicId', selectedTopicId)
    }
    
    const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
    router.replace(newUrl, { scroll: false })
  }, [selectedSubjectId, selectedTopicId, router])


  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    for (const file of Array.from(files)) {
      if (file.type.startsWith('image/')) {
        const id = Math.random().toString(36).substr(2, 9)
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = async () => {
          const base64 = reader.result as string
          const public_id = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-]/g, '-')
          const res = await api.post('/m/upload-cloudinary', {
            image: base64,
            folder: 'bulk-questions',
            public_id
          }, {
            headers: {'Content-Type': 'application/json'},
          })
          const data = res.data
          if (data.success) {
            const newFile: UploadedFile = {id, url: data.data, fileName: file.name, status: 'pending'}
            setUploadedFiles(prev => {
              if (prev.some(f => f.url === newFile.url)) return prev
              return [...prev, newFile]
            })
          } else {
            toast({title: "Upload Failed", description: "Failed to upload to Cloudinary", variant: "destructive"})
          }
        }
      }
    }
    event.target.value = ''
  }, [])

  const removeFile = (id: string) => {
    setUploadedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === id)
      if (fileToRemove) {
        // URL.revokeObjectURL(fileToRemove.preview) // This line is removed as per new UploadedFile interface
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

    if (!selectedTopicId || selectedTopicId === 'auto') {
      toast({
        title: "Topic Required",
        description: "Please select a topic before uploading.",
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
      const requestData = {
        subjectId: selectedSubjectId,
        gptModel: selectedGptModel,
        topicId: selectedTopicId,
        additionalInstructions,
        urls: uploadedFiles.map(f => f.url)
      }
      console.log("requestData", requestData);
      const response = await bulkUploadQuestions(requestData)

      if (response.success) {
        setProcessingJob(response.data.job)
        
        toast({
          title: "Upload Started",
          description: `Processing ${uploadedFiles.length} images with ${selectedGptModel}. This may take a few minutes.`,
          variant: "default"
        })

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
    const maxPolls = 300 
    
    const poll = async () => {
      try {
        pollCount++
        const response = await getBulkUploadStatus(jobId)
        
        if (response.success) {
          setProcessingJob(response.data)
          
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
          
          if (pollCount >= maxPolls) {
            toast({
              title: "Polling Timeout",
              description: "Stopped checking for updates. You can refresh the page to check status.",
              variant: "destructive"
            })
            return
          }
          
          setTimeout(poll, 30000)  // 30 seconds
        } else {
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
    <div className="container mx-auto p-2 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">Bulk Question Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple question screenshots and convert them to structured data using AI
          </p>
        </div>
       
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
            additionalInstructions={additionalInstructions}
            setAdditionalInstructions={setAdditionalInstructions}
          />
        </div>

        {/* File Preview */}
        <div className="lg:col-span-2 space-y-2">
          {/* Processing Status */}
          {processingJob && <ProcessingStatus processingJob={processingJob} />}
          <FilePreview
            uploadedFiles={uploadedFiles}
            removeFile={removeFile}
            isUploading={isUploading}
          />
        </div>
      </div>

      
    </div>
  )
}

export default function BulkUploadPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-2">Loading...</div>}>
      <BulkUpload />
    </Suspense>
  )
}
