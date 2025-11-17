"use client"

import React from 'react';
import Loading from '../Loading';

export const renderLoadingState = () => <Loading />;

export const renderErrorState = (message?: string) => (
    <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-red-500 mb-2">
                Session Error
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
                {message || "Failed to load session"}
            </p>
        </div>
    </div>
);

export const renderEmptyState = (title?: string, description?: string, action?: React.ReactNode) => (
    <div className="flex justify-center items-center min-h-screen px-4">
        <div className="text-center">
            <h1 className="text-lg sm:text-xl text-gray-600 mb-4">
                {title || "No questions available"}
            </h1>
            {description && (
                <p className="text-sm text-gray-500 mb-4">
                    {description}
                </p>
            )}
            {action}
        </div>
    </div>
);

