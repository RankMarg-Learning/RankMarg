# Solution Filter System

## Overview

The Solution Filter System provides users with control over which sections of the step-by-step solution are displayed. This allows users to customize their learning experience by showing or hiding optional content sections like shortcuts, tips, and exploratory information.

## Features

### Supported Section Types

The system automatically detects and handles the following special sections in solution markdown:

1. **Shortcut/Trick** (`**Shortcut:** or **Trick:**`)
   - Quick methods and mental math tricks
   - Time-saving approaches
   - Icon: ⚡

2. **Did You Know** (`**Did You Know:**`)
   - Interesting facts and additional context
   - Historical background
   - Icon: 💡

3. **Exploratory** (`**Exploratory:**`)
   - Deep dive into concepts
   - Alternative approaches
   - Advanced explanations
   - Icon: 🔍

4. **If-Then Scenario** (`**If-Then Scenario:**`)
   - What-if scenarios
   - Problem variations
   - Parameter changes
   - Icon: 🔄

5. **Key Insight** (`**Key Insight:**`)
   - Important takeaways
   - Pattern recognition
   - Core concepts
   - Icon: 🎯

6. **Pro Tip** (`**Pro-Tip:** or **Pro Tip:**`)
   - Expert tips
   - Best practices
   - Advanced techniques
   - Icon: ⭐

7. **Quick Recall** (`**Quick Recall:**`)
   - Key formulas and concepts for quick reference
   - Essential points to remember
   - Summary of important facts
   - Icon: 🧠

### Core Sections (Always Visible)

The following sections are always displayed and cannot be toggled off:
- Given data
- Relevant relation
- Calculation
- Solution steps
- Final Answer

## How It Works

### 1. Automatic Detection

The system uses pattern matching to identify special sections in the solution markdown:

```markdown
**Given data:**
initial frequency $f=100$ Hz

**Calculation:**
$$f' = f\sqrt{1.04}$$

**Shortcut/Trick:** 
For small x use $\sqrt{1+x} \approx 1 + x/2$

**If-Then Scenario:** 
If tension increases by 9 percent then beats ≈ 4.4 Hz
```

### 2. Section Parsing

The `parseSolutionSections()` function:
- Splits content into main and special sections
- Preserves markdown formatting
- Maintains proper spacing and structure

### 3. Content Filtering

The `filterSolutionContent()` function:
- Applies user preferences
- Filters out disabled sections
- Reconstructs the markdown content

### 4. User Preferences

- Settings are stored in browser's localStorage
- Persist across sessions
- Can be reset to defaults
- Only appear when special sections are detected

## Implementation

### File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── QuestionUI.tsx              # Main question component
│   │   └── SolutionFilterSettings.tsx  # Settings modal component
│   └── utils/
│       └── solutionFilter.ts           # Core filtering logic
```

### Usage in Components

```typescript
import {
  filterSolutionContent,
  getAvailableSections,
  loadFilterSettings,
  hasSpecialSections,
} from '@/utils/solutionFilter';

// In component
const [filterSettings, setFilterSettings] = useState(loadFilterSettings());

const availableSections = useMemo(() => 
  question?.solution ? getAvailableSections(question.solution) : [],
  [question?.solution]
);

const filteredSolution = useMemo(() => 
  question?.solution ? filterSolutionContent(question.solution, filterSettings) : '',
  [question?.solution, filterSettings]
);
```

## User Experience

### Settings Access

1. The "Customize" button appears next to "Step-by-Step Analysis" heading
2. Only visible when the solution contains special sections
3. Opens a modal with toggle switches for each available section

### Settings Modal

- **Toggle Switches**: Enable/disable each section type
- **Icons**: Visual indicators for each section type
- **Descriptions**: Brief explanation of what each section contains
- **Reset Button**: Restore default settings (all sections enabled)
- **Persistent**: Settings saved automatically on change

### Visual Design

- Consistent with existing purple theme for solutions
- Clear visual hierarchy
- Responsive design for mobile and desktop
- Smooth transitions when toggling sections

## Benefits

### For Students

1. **Focused Learning**: Hide distracting information when needed
2. **Progressive Disclosure**: Start with core content, expand as needed
3. **Personalized Experience**: Tailor content to learning style
4. **Time Management**: Skip shortcuts when learning concepts deeply

### For Content Creators

1. **Rich Content**: Add optional information without overwhelming users
2. **Flexible Structure**: Include various types of supporting content
3. **Backward Compatible**: Works with existing solutions
4. **No Special Formatting**: Uses standard markdown bold syntax

## Example Solution Format

```markdown
**Given data:**
- initial frequency $f=100$ Hz
- tension increased by 4 percent: $T' = 1.04\,T$

**Relevant relation:**
frequency of a stretched string $f \propto \sqrt{T}$

**Calculation:**
$$f' = f\sqrt{1.04} = 100\times 1.0199 = 101.98\ \text{Hz}$$

**Final Answer:** 2 Hz

**Shortcut/Trick:** 
For small x use $\sqrt{1+x} \approx 1 + x/2$. Here $\sqrt{1.04} \approx 1.02$

**If-Then Scenario:** 
If tension increases by 9 percent then beats ≈ 4.4 Hz

**Did You Know:**
Beat frequency is used in musical instrument tuning since ancient times.

**Quick Recall:**
- Beat frequency: $|f_1 - f_2|$
- String frequency: $f \propto \sqrt{T}$
```

## Technical Details

### Storage

- **Key**: `solution-filter-settings`
- **Format**: JSON object with boolean flags
- **Location**: Browser localStorage
- **Scope**: Per user, per browser

### Performance

- **Parsing**: Done once per solution using `useMemo`
- **Filtering**: Cached until settings change
- **Rendering**: Optimized with React.memo on MarkdownRenderer
- **Memory**: Minimal overhead (~1KB per solution)

### Browser Compatibility

- Works in all modern browsers
- Graceful fallback if localStorage unavailable
- No external dependencies beyond React

## Future Enhancements

Potential improvements for future versions:

1. **Section Reordering**: Allow users to change section order
2. **Collapsible Sections**: Expand/collapse individual sections
3. **Highlighting**: Different colors for different section types
4. **Export Settings**: Share preferences across devices
5. **Teacher Override**: Allow instructors to set default preferences
6. **Analytics**: Track which sections users find most valuable
7. **Accessibility**: Enhanced screen reader support

## Troubleshooting

### Settings Not Persisting

- Check if localStorage is enabled
- Verify browser privacy settings
- Clear cache and try again

### Sections Not Detected

- Verify markdown syntax: `**Section Name:**` (with bold and colon)
- Check for typos in section names
- Ensure proper spacing and formatting

### UI Not Appearing

- Verify solution contains special sections
- Check that `hasSpecialSections()` returns true
- Inspect browser console for errors

## API Reference

### Functions

#### `parseSolutionSections(content: string): SolutionSection[]`
Parses solution content into main and special sections.

#### `filterSolutionContent(content: string, settings: SolutionFilterSettings): string`
Filters solution content based on user settings.

#### `getAvailableSections(content: string): SolutionSectionType[]`
Returns array of section types present in content.

#### `hasSpecialSections(content: string): boolean`
Checks if solution contains any special sections.

#### `loadFilterSettings(): SolutionFilterSettings`
Loads user preferences from localStorage.

#### `saveFilterSettings(settings: SolutionFilterSettings): void`
Saves user preferences to localStorage.

#### `getSectionInfo(type: SolutionSectionType): { label, description, icon }`
Returns display information for a section type.

### Types

```typescript
type SolutionSectionType = 
  | 'shortcut-trick'
  | 'did-you-know'
  | 'exploratory'
  | 'if-then-scenario'
  | 'key-insight'
  | 'pro-tip'
  | 'quick-recall';

interface SolutionFilterSettings {
  'shortcut-trick': boolean;
  'did-you-know': boolean;
  'exploratory': boolean;
  'if-then-scenario': boolean;
  'key-insight': boolean;
  'pro-tip': boolean;
  'quick-recall': boolean;
}
```

## Contributing

When adding new section types:

1. Add pattern to `SECTION_PATTERNS` in `solutionFilter.ts`
2. Update `SolutionSectionType` type
3. Add to `SolutionFilterSettings` interface
4. Update `DEFAULT_FILTER_SETTINGS`
5. Add display info to `getSectionInfo()`
6. Update this documentation

## License

Part of the RankMarg application. All rights reserved.

