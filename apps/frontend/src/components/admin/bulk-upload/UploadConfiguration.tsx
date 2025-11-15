import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/common-ui'
import { Button } from '@repo/common-ui'
import { Input } from '@repo/common-ui'
import { Label } from '@repo/common-ui'
import { SearchableSelect } from '@repo/common-ui'
import { Upload } from 'lucide-react'
import { Textarea } from '@repo/common-ui'

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

const GPT_MODELS = [
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Faster, Cost-effective)' },
  { value: 'gpt-5-mini', label: 'GPT-5 Mini (More Accurate)' },
  { value: 'gpt-5', label: 'GPT-5 (More Accurate)' },
]

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
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration</CardTitle>
        <CardDescription>
          Select subject, topic, and AI model for the questions
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
          <Label htmlFor="gptModel">AI Model *</Label>
          <SearchableSelect
            value={selectedGptModel}
            onValueChange={setSelectedGptModel}
            placeholder="Select AI model"
            options={GPT_MODELS}
            emptyMessage="No models available"
            searchPlaceholder="Search models..."
          />
          <p className="text-xs text-muted-foreground">
            GPT-4o Mini is faster and more cost-effective. GPT-4 Turbo provides higher accuracy.
          </p>
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
          disabled={isUploading || uploadedFiles.length === 0 || !selectedSubjectId || !selectedGptModel || subjectsLoading}
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
