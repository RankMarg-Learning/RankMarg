# Question UI Customization System

## Overview

The Question UI Customization System provides comprehensive control over what students see during their learning experience. Unlike simple content filtering, this system allows users to toggle entire sections of the learning interface including hints, solutions, strategies, and common mistakes.

## 🎯 Features

### Main UI Controls

Students can customize their entire learning experience with these toggles:

#### Learning Features
1. **💡 Show Hint Button**
   - Controls: Hint button visibility before submitting
   - Impact: Hides/shows "Show Hint" button
   - Helps: Students who want to challenge themselves without hints

2. **📖 Show Detailed Solution**
   - Controls: Entire solution section after answering
   - Impact: Hides/shows complete solution accordion
   - Helps: Students practicing retrieval or time management

#### Solution Components
3. **🎯 Show Solving Strategy**
   - Controls: Strategic approach section (premium feature)
   - Impact: Hides/shows blue strategy card
   - Helps: Students who prefer direct solutions

4. **⚠️ Show Common Mistakes**
   - Controls: Common mistakes section (premium feature)
   - Impact: Hides/shows red mistakes card
   - Helps: Students who don't want negative examples

### Solution Content Filters

Fine-grained control over special sections within step-by-step solutions:

1. **⚡ Shortcuts & Tricks** - Quick methods and mental math
2. **💡 Did You Know** - Interesting facts and context
3. **🔍 Exploratory** - Deep dives and alternatives
4. **🔄 If-Then Scenarios** - What-if variations
5. **🎯 Key Insights** - Important takeaways
6. **⭐ Pro Tips** - Expert advice
7. **🧠 Quick Recall** - Key formulas for reference

These filters only appear when:
- "Show Detailed Solution" is enabled
- The current question's solution contains these sections

## 🎨 User Interface

### Fixed Settings Button

- **Location**: Bottom-right corner (fixed position)
- **Icon**: Purple gear/settings icon
- **Behavior**: Always accessible, floats above content
- **Visual**: Pulsing shadow, scales on hover

### Settings Modal

Beautiful, organized modal with:

- **Header**: Gradient purple header with title and close button
- **Sections**: Organized by category
  - Learning Features
  - Solution Components  
  - Solution Content Filters (when applicable)
- **Toggle Switches**: Smooth animated switches
- **Icons & Descriptions**: Clear visual indicators
- **Reset Button**: Return to defaults
- **Scrollable**: Handles long content gracefully

## 🔧 Technical Implementation

### Architecture

```
┌─────────────────────────────────────┐
│   QuestionUI (Main Component)       │
│  ┌───────────────────────────────┐  │
│  │ UI Preferences State          │  │
│  │ - showHint                    │  │
│  │ - showDetailedSolution        │  │
│  │ - showStrategy                │  │
│  │ - showCommonMistakes          │  │
│  │ - solutionContentFilters      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Conditionally renders:             │
│  - Hint button & section            │
│  - Solution accordion               │
│  - Strategy card                    │
│  - Common mistakes card             │
│  - Filtered solution content        │
└─────────────────────────────────────┘
         ▲
         │ Preferences Updates
         │
┌────────┴────────────────────────────┐
│  QuestionUISettings (Modal)         │
│  - Fixed position button            │
│  - Comprehensive modal              │
│  - Auto-save to localStorage        │
└─────────────────────────────────────┘
```

### File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── QuestionUI.tsx              # Main component (updated)
│   │   └── QuestionUISettings.tsx      # Settings modal (new)
│   └── utils/
│       ├── questionUIPreferences.ts    # Preferences logic (new)
│       └── solutionFilter.ts           # Content filtering (existing)
```

### Data Flow

1. **Initialization**
   ```typescript
   const [uiPreferences, setUiPreferences] = useState(loadUIPreferences());
   ```

2. **User Changes Setting**
   - Toggle clicked in modal
   - State updates immediately
   - Saved to localStorage
   - UI re-renders with new preferences

3. **Conditional Rendering**
   ```typescript
   {uiPreferences.showHint && !isAnswered && !isHintUsed && (
     <Button>Show Hint</Button>
   )}
   ```

### Storage

**Key**: `question-ui-preferences`

**Structure**:
```json
{
  "showHint": true,
  "showDetailedSolution": true,
  "showStrategy": true,
  "showCommonMistakes": true,
  "solutionContentFilters": {
    "shortcut-trick": true,
    "did-you-know": true,
    "exploratory": true,
    "if-then-scenario": true,
    "key-insight": true,
    "pro-tip": true,
    "quick-recall": true
  }
}
```

## 💡 Use Cases

### Self-Testing Mode
```
Settings:
✅ Show Hint Button: OFF
✅ Show Detailed Solution: OFF
```
**Result**: Pure testing environment, no help available

### Quick Review Mode
```
Settings:
✅ Show Hint Button: ON
✅ Show Detailed Solution: ON
✅ Show Strategy: OFF
✅ Show Common Mistakes: OFF
✅ Solution Filters: Core content only
```
**Result**: Fast review with essential information

### Deep Learning Mode
```
Settings:
✅ Everything: ON
```
**Result**: Complete learning experience with all features

### Exam Simulation
```
Settings:
✅ Show Hint Button: OFF
✅ Show Detailed Solution: OFF
```
**Result**: Real exam conditions, review solutions later

## 🎓 Educational Benefits

### For Different Learning Styles

1. **Visual Learners**
   - Enable: Did You Know, Exploratory
   - Benefit: Rich context and diagrams

2. **Fast Learners**
   - Disable: Common Mistakes, If-Then Scenarios
   - Benefit: Focus on core concepts

3. **Detail-Oriented**
   - Enable: Everything
   - Benefit: Complete understanding

4. **Exam-Focused**
   - Enable: Shortcuts, Quick Recall
   - Benefit: Time-saving techniques

### Progressive Disclosure

Students can adjust complexity as they learn:

**Beginner Phase**: All features ON
- Learn from mistakes
- Understand strategies
- Explore alternatives

**Intermediate Phase**: Selective features
- Hide basics they know
- Focus on weak areas
- Practice with hints

**Advanced Phase**: Minimal assistance
- No hints
- No strategies
- Pure problem-solving

## 🚀 Features in Action

### Example 1: Hint Control

**Before (Hint ON)**:
- Hint button visible
- Student can click for help
- Hint section appears when used

**After (Hint OFF)**:
- No hint button
- Forces independent thinking
- Hint section never appears

### Example 2: Solution Control

**Before (Solution ON)**:
- Full solution accordion visible
- All components shown
- Strategy and mistakes included

**After (Solution OFF)**:
- Solution accordion hidden
- Shows "Solution is hidden" message
- Link to settings to re-enable

### Example 3: Content Filtering

**Full Solution**:
```markdown
**Given data:** ...
**Calculation:** ...
**Shortcut/Trick:** Use approximation
**If-Then Scenario:** What if value changes
**Quick Recall:** Key formulas
```

**Filtered (Shortcuts OFF, Scenarios OFF)**:
```markdown
**Given data:** ...
**Calculation:** ...
**Quick Recall:** Key formulas
```

## 🔐 Premium Feature Integration

The system respects subscription status:

- **Free Users**: Can customize UI, but premium features show upgrade prompt
- **Premium Users**: Full access to Strategy and Common Mistakes
- **Customization**: Both tiers can toggle what they have access to

```typescript
{isUnlocked ? (
  <>
    {uiPreferences.showStrategy && <StrategyCard />}
    {uiPreferences.showCommonMistakes && <MistakesCard />}
  </>
) : (
  <UpgradePrompt />
)}
```

## 📱 Responsive Design

- **Mobile**: Full-screen modal, optimized touch targets
- **Tablet**: Medium modal, comfortable spacing
- **Desktop**: Large modal, all content visible

Settings button scales appropriately on all devices.

## ⚙️ API Reference

### Types

```typescript
interface QuestionUIPreferences {
  showHint: boolean;
  showDetailedSolution: boolean;
  showStrategy: boolean;
  showCommonMistakes: boolean;
  solutionContentFilters: {
    'shortcut-trick': boolean;
    'did-you-know': boolean;
    'exploratory': boolean;
    'if-then-scenario': boolean;
    'key-insight': boolean;
    'pro-tip': boolean;
    'quick-recall': boolean;
  };
}
```

### Functions

#### `loadUIPreferences(): QuestionUIPreferences`
Loads preferences from localStorage with defaults for missing values.

#### `saveUIPreferences(preferences: QuestionUIPreferences): void`
Saves preferences to localStorage.

#### `resetUIPreferences(): void`
Clears localStorage and returns to defaults.

#### `getPreferencesByCategory(category: 'learning' | 'solution'): PreferenceInfo[]`
Returns preferences filtered by category.

### Component Props

```typescript
interface QuestionUISettingsProps {
  availableSolutionSections?: SolutionSectionType[];
  onPreferencesChange?: (preferences: QuestionUIPreferences) => void;
}
```

## 🧪 Testing Scenarios

1. **Toggle Each Setting**: Verify UI updates immediately
2. **Persist Across Questions**: Settings should persist
3. **Reset to Default**: All toggles return to ON
4. **Mobile Responsiveness**: Modal works on small screens
5. **Empty Solution Sections**: Filters hide when not applicable
6. **Subscription Integration**: Premium features respect unlock status

## 🎯 Best Practices

### For Students

1. **Start With Everything ON**: Learn the full system
2. **Gradually Reduce**: As you master topics
3. **Exam Mode Before Tests**: Practice without assistance
4. **Review Mode After**: Re-enable to learn from mistakes

### For Instructors

1. **Recommend Defaults**: Most students benefit from all features
2. **Suggest Progressive Reduction**: As students advance
3. **Exam Simulation**: Encourage practice with hints/solutions off
4. **Learning Styles**: Help students find their optimal settings

## 🔄 Migration from Old System

The old `SolutionFilterSettings` component has been:
- **Replaced by**: `QuestionUISettings`
- **Enhanced with**: Full UI control (not just content)
- **Improved UX**: Fixed button position, better organization
- **Backward Compatible**: Settings migrate automatically

## 🐛 Troubleshooting

### Settings Not Saving
- Check localStorage is enabled
- Verify no browser extensions blocking
- Clear cache and try again

### Solution Still Hidden After Enabling
- Check question actually has a solution
- Verify no parent component overriding
- Refresh the page

### Filters Not Working
- Ensure solution contains filtered sections
- Check markdown formatting is correct
- Verify preferences saved correctly

## 🚧 Future Enhancements

Potential improvements:

1. **Preset Modes**: Quick buttons for "Study Mode", "Exam Mode", etc.
2. **Time-Based Auto-Hide**: Automatically hide hints after time limit
3. **Analytics**: Track which settings help students most
4. **Teacher Override**: Allow instructors to set defaults
5. **Per-Subject Settings**: Different preferences for different subjects
6. **Keyboard Shortcuts**: Quick toggle with hotkeys
7. **Accessibility**: Enhanced screen reader support
8. **Export/Import**: Share settings across devices

## 📊 Impact Metrics

Track these to measure success:

- **Engagement**: Do students use customization?
- **Performance**: Does hiding hints improve scores?
- **Retention**: Do personalized experiences reduce churn?
- **Feature Usage**: Which toggles are most popular?

## 🤝 Contributing

When adding new UI toggles:

1. Add to `QuestionUIPreferences` interface
2. Update `DEFAULT_UI_PREFERENCES`
3. Add to `PREFERENCE_INFO` array
4. Implement conditional rendering in `QuestionUI`
5. Update this documentation
6. Test on all device sizes

## 📄 License

Part of the RankMarg application. All rights reserved.

---

**Last Updated**: November 2025  
**Version**: 2.0 (Comprehensive UI Control)

