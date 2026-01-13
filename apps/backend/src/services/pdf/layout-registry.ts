/**
 * Layout Registry for PDF Templates
 * Manages registration and retrieval of different PDF layouts
 */

import { TestPaperLayout } from "./types";

/**
 * Metadata for a PDF layout template
 */
export interface LayoutMetadata {
    name: string;
    templatePath: string;
    description: string;
    supportedExamTypes?: string[];
    defaultConfig?: Record<string, any>;
    isDefault?: boolean;
}

/**
 * Layout Registry
 * Centralized management of PDF layouts following the registry pattern
 */
export class LayoutRegistry {
    private layouts: Map<TestPaperLayout, LayoutMetadata>;
    private examTypeMapping: Map<string, TestPaperLayout>;

    constructor() {
        this.layouts = new Map();
        this.examTypeMapping = new Map();
    }

    /**
     * Register a new layout
     * @param layout - Layout type enum
     * @param metadata - Layout metadata including template path
     */
    register(layout: TestPaperLayout, metadata: LayoutMetadata): void {
        this.layouts.set(layout, metadata);

        // Auto-map exam types to layouts
        if (metadata.supportedExamTypes) {
            metadata.supportedExamTypes.forEach((examType) => {
                this.examTypeMapping.set(examType.toUpperCase(), layout);
            });
        }
    }

    /**
     * Get layout metadata by layout type
     * @param layout - Layout type
     * @returns Layout metadata
     * @throws Error if layout not found
     */
    getLayout(layout: TestPaperLayout): LayoutMetadata {
        const metadata = this.layouts.get(layout);
        if (!metadata) {
            throw new Error(`Layout not found: ${layout}`);
        }
        return metadata;
    }

    /**
     * Get layout for a specific exam type
     * Falls back to default layout if no specific mapping exists
     * @param examType - Exam type code (e.g., "JEE", "NEET")
     * @returns Layout metadata
     */
    getLayoutForExamType(examType: string): LayoutMetadata {
        const normalizedExamType = examType?.toUpperCase() || "";
        const layoutType = this.examTypeMapping.get(normalizedExamType);

        if (layoutType) {
            return this.getLayout(layoutType);
        }

        // Fallback to default layout
        return this.getLayout(TestPaperLayout.DEFAULT);
    }

    /**
     * List all registered layouts
     * @returns Array of layout metadata
     */
    listLayouts(): LayoutMetadata[] {
        return Array.from(this.layouts.values());
    }

    /**
     * Check if a layout is registered
     * @param layout - Layout type
     * @returns True if layout exists
     */
    hasLayout(layout: TestPaperLayout): boolean {
        return this.layouts.has(layout);
    }

    /**
     * Get default layout
     * @returns Default layout metadata
     */
    getDefaultLayout(): LayoutMetadata {
        const defaultLayout = Array.from(this.layouts.values()).find(
            (metadata) => metadata.isDefault
        );

        if (defaultLayout) {
            return defaultLayout;
        }

        // Fallback to DEFAULT enum
        return this.getLayout(TestPaperLayout.DEFAULT);
    }

    /**
     * Clear all registered layouts
     * Useful for testing
     */
    clear(): void {
        this.layouts.clear();
        this.examTypeMapping.clear();
    }
}

/**
 * Singleton instance of layout registry
 * Shared across all PDF generators
 */
export const globalLayoutRegistry = new LayoutRegistry();
