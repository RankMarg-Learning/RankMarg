# Bulk Question Upload System

This system allows administrators to upload multiple question screenshots and automatically convert them to structured question data using GPT-4 Vision API.

## Features

- **Bulk Image Upload**: Upload multiple question screenshots at once
- **AI-Powered Processing**: Uses GPT-4 Vision to extract question content, options, solutions, and metadata
- **Topic Management**: Automatically assigns topics and subtopics or lets you pre-select them
- **Real-time Status**: Live progress tracking with success/error counts
- **Markdown Support**: Properly formatted mathematical equations and content
- **Background Processing**: Non-blocking async processing with job status tracking

## Setup Requirements

### 1. Environment Variables

Add the following to your `.env.local` file:

```bash
# OpenAI API Key for GPT-4 Vision processing
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Database Schema

The system uses the existing Question, Topic, SubTopic, and Option models from your Prisma schema. No additional migrations needed.

### 3. Dependencies

The following packages are automatically installed:
- `openai` - OpenAI API client
- `uuid` - For generating unique job IDs
- `@types/uuid` - TypeScript types for uuid

## Usage Flow

1. **Navigate to Bulk Upload**: Go to `/admin/bulk-upload` in your admin panel
2. **Select Subject**: Choose the subject for all questions (required)
3. **Select Topic (Optional)**: Pre-select a topic, or let AI auto-detect
4. **Upload Images**: Select multiple question screenshot files
5. **Submit**: Start the processing job
6. **Monitor Progress**: Watch real-time status updates
7. **Review Results**: Check success/error counts and any error messages

## AI Processing

The system uses GPT-4 Vision (gpt-4o model) which is cost-efficient and accurate for:

- **Text Extraction**: Reads question content from images
- **Mathematical Formulas**: Converts to proper LaTeX format for MarkdownRenderer
- **Multiple Choice Options**: Extracts and identifies correct answers
- **Metadata Detection**: Determines difficulty, categories, and estimated time
- **Topic Classification**: Auto-assigns appropriate topics and subtopics
- **Solution Generation**: Creates detailed step-by-step solutions

## Output Format

Generated questions include:
- **Content**: Properly formatted with LaTeX math expressions
- **Options**: All multiple choice options with correct answer marked
- **Solution**: Detailed explanation compatible with MarkdownRenderer
- **Metadata**: Difficulty, categories, estimated time, hints, strategies
- **Associations**: Linked to appropriate subject, topic, and subtopic

## Error Handling

The system handles various error scenarios:
- Invalid image formats
- API rate limits
- Processing failures
- Database constraint violations
- Network timeouts

All errors are logged and reported in the job status with specific error messages.

## Performance

- **Concurrent Processing**: Processes images sequentially to avoid API rate limits
- **Memory Efficient**: Streams file data without storing large files in memory
- **Job Persistence**: Jobs persist across server restarts (in production, use Redis/database)
- **Progress Tracking**: Real-time updates every 2 seconds

## Production Considerations

1. **Job Storage**: Replace in-memory job storage with Redis or database
2. **File Storage**: Consider cloud storage for uploaded images
3. **Rate Limiting**: Implement proper API rate limiting for OpenAI
4. **Error Recovery**: Add retry mechanisms for failed processing
5. **Monitoring**: Add logging and monitoring for job processing
6. **Security**: Validate file types and sizes, sanitize inputs

## API Endpoints

- `POST /api/admin/bulk-upload` - Start bulk upload job
- `GET /api/admin/bulk-upload/{jobId}/status` - Get job status
- `GET /api/admin/bulk-upload` - List all user jobs

## File Structure

```
apps/frontend/src/
├── app/(admin)/admin/bulk-upload/
│   └── page.tsx                    # Main upload interface
├── app/api/admin/bulk-upload/
│   ├── route.ts                    # Main upload API
│   └── [jobId]/status/route.ts     # Status API
├── services/
│   ├── bulk-upload.service.ts      # Frontend service
│   └── ai/gpt-vision.service.ts    # GPT processing
└── lib/
    └── bulk-upload-jobs.ts         # Job storage management
```

## Troubleshooting

### Common Issues

1. **OpenAI API Key Missing**: Ensure OPENAI_API_KEY is set in environment
2. **Topic Not Found**: Verify topic IDs exist in database
3. **Processing Stuck**: Check OpenAI API status and rate limits
4. **Upload Fails**: Verify file sizes and formats are supported
5. **Database Errors**: Check Prisma connection and schema

### Logs

Check server logs for detailed error information:
```bash
# Development
npm run dev

# Production
pm2 logs your-app
```
