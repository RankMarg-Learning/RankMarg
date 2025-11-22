"use client";

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  X, 
  RotateCcw, 
  Lightbulb, 
  BookOpen, 
  Target, 
  AlertTriangle,
  Zap,
  Info,
  Search,
  RefreshCw,
  Crosshair,
  Star,
  Brain,
  FileText
} from 'lucide-react';
import { Button } from '@repo/common-ui';
import {
  QuestionUIPreferences,
  loadUIPreferences,
  saveUIPreferences,
  DEFAULT_UI_PREFERENCES,
  getPreferencesByCategory,
} from '@/utils/questionUIPreferences';
import {
  SolutionSectionType,
  getSectionInfo,
} from '@/utils/solutionFilter';

interface QuestionUISettingsProps {
  availableSolutionSections?: SolutionSectionType[];
  onPreferencesChange?: (preferences: QuestionUIPreferences) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const QuestionUISettings: React.FC<QuestionUISettingsProps> = ({
  availableSolutionSections = [],
  onPreferencesChange,
  isOpen,
  onOpenChange,
}) => {
  const [preferences, setPreferences] = useState<QuestionUIPreferences>(loadUIPreferences());

  // Load preferences on mount
  useEffect(() => {
    const loaded = loadUIPreferences();
    setPreferences(loaded);
    onPreferencesChange?.(loaded);
  }, []);

  const handleToggle = (key: keyof Omit<QuestionUIPreferences, 'solutionContentFilters'>) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    saveUIPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const handleContentFilterToggle = (section: SolutionSectionType) => {
    const newPreferences = {
      ...preferences,
      solutionContentFilters: {
        ...preferences.solutionContentFilters,
        [section]: !preferences.solutionContentFilters[section],
      },
    };
    setPreferences(newPreferences);
    saveUIPreferences(newPreferences);
    onPreferencesChange?.(newPreferences);
  };

  const handleReset = () => {
    setPreferences(DEFAULT_UI_PREFERENCES);
    saveUIPreferences(DEFAULT_UI_PREFERENCES);
    onPreferencesChange?.(DEFAULT_UI_PREFERENCES);
  };

  const learningPreferences = getPreferencesByCategory('learning');
  const solutionPreferences = getPreferencesByCategory('solution');

  // Icon mapping for preferences
  const getPreferenceIcon = (key: string) => {
    switch (key) {
      case 'showHint':
        return <Lightbulb className="h-5 w-5" />;
      case 'showDetailedSolution':
        return <BookOpen className="h-5 w-5" />;
      case 'showStrategy':
        return <Target className="h-5 w-5" />;
      case 'showCommonMistakes':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  // Icon mapping for solution sections
  const getSectionIcon = (section: SolutionSectionType) => {
    switch (section) {
      case 'shortcut-trick':
        return <Zap className="h-5 w-5" />;
      case 'did-you-know':
        return <Info className="h-5 w-5" />;
      case 'exploratory':
        return <Search className="h-5 w-5" />;
      case 'if-then-scenario':
        return <RefreshCw className="h-5 w-5" />;
      case 'key-insight':
        return <Crosshair className="h-5 w-5" />;
      case 'pro-tip':
        return <Star className="h-5 w-5" />;
      case 'quick-recall':
        return <Brain className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <>
      {/* Settings Modal */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
          />

          {/* Modal */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 w-[95%] max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Display Settings</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Customize your learning experience</p>
                </div>
              </div>
              <button
                onClick={() => onOpenChange(false)}
                className="text-gray-400 hover:text-gray-600 transition p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-gray-50">
              {/* Learning Features Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Learning Features</h4>
                </div>
                <div className="space-y-2">
                  {learningPreferences.map((pref) => (
                    <div
                      key={pref.key}
                      className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition bg-white"
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        preferences[pref.key] ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getPreferenceIcon(pref.key)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-sm font-semibold text-gray-900">{pref.label}</h5>
                          <button
                            onClick={() => handleToggle(pref.key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                              preferences[pref.key] ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={preferences[pref.key]}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                preferences[pref.key] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">{pref.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Components Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Solution Components</h4>
                </div>
                <div className="space-y-2">
                  {solutionPreferences.map((pref) => (
                    <div
                      key={pref.key}
                      className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition bg-white"
                    >
                      <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        preferences[pref.key] ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getPreferenceIcon(pref.key)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="text-sm font-semibold text-gray-900">{pref.label}</h5>
                          <button
                            onClick={() => handleToggle(pref.key)}
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                              preferences[pref.key] ? 'bg-purple-600' : 'bg-gray-300'
                            }`}
                            role="switch"
                            aria-checked={preferences[pref.key]}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                preferences[pref.key] ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5">{pref.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Solution Content Filters */}
              {availableSolutionSections.length > 0 && preferences.showDetailedSolution && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <FileText className="h-4 w-4 text-purple-600" />
                    <h4 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">Solution Content</h4>
                    <span className="text-xs text-gray-500 bg-purple-50 px-2 py-0.5 rounded-full">Step-by-Step</span>
                  </div>
                  <div className="space-y-2">
                    {availableSolutionSections.map((section) => {
                      const info = getSectionInfo(section);
                      return (
                        <div
                          key={section}
                          className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-sm transition bg-white"
                        >
                          <div className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            preferences.solutionContentFilters[section] ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {getSectionIcon(section)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <h5 className="text-sm font-semibold text-gray-900">{info.label}</h5>
                              <button
                                onClick={() => handleContentFilterToggle(section)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                                  preferences.solutionContentFilters[section] ? 'bg-purple-600' : 'bg-gray-300'
                                }`}
                                role="switch"
                                aria-checked={preferences.solutionContentFilters[section]}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    preferences.solutionContentFilters[section] ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                            <p className="text-xs text-gray-500 mt-1.5">{info.description}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-4 bg-white flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium transition px-3 py-2 rounded-lg hover:bg-purple-50"
              >
                <RotateCcw className="h-4 w-4" />
                Reset All
              </button>
              <Button
                onClick={() => onOpenChange(false)}
                size="sm"
                className="bg-purple-600 hover:bg-purple-700 text-white px-6"
              >
                Save & Close
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default QuestionUISettings;

