"use client";

import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  Button, 
  Textarea,
  Badge
} from "@repo/common-ui";
import { useHomeConfig } from "@/hooks/useHomeConfig";
import { Save, RefreshCw, AlertTriangle, FileCode } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ConfigPage() {
  const { config, isLoading, updateConfig, isUpdating } = useHomeConfig();
  const [jsonString, setJsonString] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (config) {
      setJsonString(JSON.stringify(config, null, 4));
    }
  }, [config]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setJsonString(value);
    
    try {
      if (value.trim()) {
        JSON.parse(value);
        setIsValid(true);
        setErrorMessage("");
      }
    } catch (err: any) {
      setIsValid(false);
      setErrorMessage(err.message);
    }
  };

  const handleSave = () => {
    if (!isValid) return;
    try {
      const parsed = JSON.parse(jsonString);
      updateConfig(parsed);
    } catch (err) {
      setIsValid(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
          <p className="text-sm text-gray-500">Edit the home.json configuration stored on S3 (json/home.json).</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => config && setJsonString(JSON.stringify(config, null, 4))}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Changes
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isValid || isUpdating || isLoading} 
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700"
          >
            {isUpdating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save to S3
          </Button>
        </div>
      </div>

      {!isValid && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3 text-red-700 font-medium">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold">Invalid JSON Syntax</p>
            <p className="font-mono text-xs mt-1 bg-white/50 p-2 rounded border border-red-100">{errorMessage}</p>
          </div>
        </div>
      )}

      <Card className="border border-gray-200 shadow-sm overflow-hidden">
        <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-gray-500" />
            <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">json/home.json</span>
          </div>
          <Badge variant="outline" className="bg-white text-[10px] text-gray-500 font-mono border-gray-200">
            S3 Bucket Source
          </Badge>
        </div>
        <CardContent className="p-0">
          <Textarea
            value={jsonString}
            onChange={handleJsonChange}
            className={cn(
              "min-h-[600px] font-mono text-sm p-4 border-0 focus-visible:ring-0 rounded-none resize-none transition-colors",
              "bg-[#1e1e1e] text-[#d4d4d4] selection:bg-primary/30",
              !isValid && "border-l-4 border-l-red-500"
            )}
            placeholder={isLoading ? "Loading configuration from S3..." : "Paste your JSON configuration here..."}
            spellCheck={false}
          />
        </CardContent>
      </Card>
      
      <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-100 rounded-xl text-amber-800 shadow-sm">
        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
        <p className="text-xs leading-relaxed">
          <strong className="font-bold">Live System Warning:</strong> Changes made here will take effect immediately on the dashboard for all students. 
          The backend will read this new JSON on the next request. Ensure you have tested the configuration locally first.
        </p>
      </div>
    </div>
  );
}
