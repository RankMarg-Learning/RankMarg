import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import { Input } from '@repo/common-ui'
import { Label } from '@repo/common-ui'
import { SearchableSelect } from '@repo/common-ui'
import { Upload } from 'lucide-react'
import { Textarea } from '@repo/common-ui'
import { useState, useRef } from 'react'

interface UploadConfigurationProps {
  selectedSubjectId: string
  setSelectedSubjectId: (value: string) => void
  selectedTopicId: string
  setSelectedTopicId: (value: string) => void
  selectedGptModel: string
  setSelectedGptModel: (value: string) => void
  subjects: any[]
  topics: any[]
  subjectsLoading: boolean
  topicsLoading: boolean
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  handleSubmit: () => void
  isUploading: boolean
  uploadedFiles: any[]
  additionalInstructions: string
  setAdditionalInstructions: (value: string) => void
}

export const UploadConfiguration = ({
  selectedSubjectId,
  setSelectedSubjectId,
  selectedTopicId,
  setSelectedTopicId,
  selectedGptModel,
  setSelectedGptModel,
  subjects,
  topics,
  subjectsLoading,
  topicsLoading,
  handleFileUpload,
  handleSubmit,
  isUploading,
  uploadedFiles,
  additionalInstructions,
  setAdditionalInstructions,
}: UploadConfigurationProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      // Create a synthetic event to reuse handleFileUpload
      const syntheticEvent = {
        target: {
          files: files,
        },
      } as React.ChangeEvent<HTMLInputElement>
      handleFileUpload(syntheticEvent)
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
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
          <Label htmlFor="topic">Topic *</Label>
          <SearchableSelect
            value={selectedTopicId}
            onValueChange={setSelectedTopicId}
            disabled={!selectedSubjectId || topicsLoading || subjectsLoading}
            placeholder="Select topic"
            options={topics?.map(topic => ({
              value: topic.id,
              label: topic.name
            })) || []}
            emptyMessage={
              topicsLoading ? "Loading topics..." :
              selectedSubjectId ? `No topics available for selected subject` :
              "Select a subject first"
            }
            searchPlaceholder="Search topics..."
          />
        </div>


        <div className="space-y-2">
          <Label htmlFor="additionalInstructions">Additional AI Instructions (Optional)</Label>
          <Textarea
            id="additionalInstructions"
            value={additionalInstructions}
            onChange={(e) => setAdditionalInstructions(e.target.value)}
            placeholder="e.g., Focus on numerical questions, Include detailed solutions"
          />
          <p className="text-xs text-muted-foreground">
            Custom instructions for the AI processing
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="files">Upload Images</Label>
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
              ${isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
              }
              ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            <Upload className={`mx-auto h-12 w-12 mb-4 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
            <p className="text-sm font-medium mb-2">
              {isDragging ? 'Drop images here' : 'Drag and drop images here, or click to select'}
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WebP formats
            </p>
          </div>
          <Input
            ref={fileInputRef}
            id="files"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isUploading || uploadedFiles.length === 0 || !selectedSubjectId || !selectedTopicId || subjectsLoading || topicsLoading}
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
  )
}
