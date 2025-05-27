import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Brain, Calculator, BookOpen, Zap, PenTool } from 'lucide-react';
import axios from 'axios';

// Enum matching your backend structure
enum MistakeType {
    NONE = 'NONE',
    CONCEPTUAL = 'CONCEPTUAL',
    CALCULATION = 'CALCULATION',
    READING = 'READING',
    OVERCONFIDENCE = 'OVERCONFIDENCE',
    OTHER = 'OTHER'
}

interface MistakeFeedbackModalProps {
    attemptId: string;
    isOpen: boolean;
    onClose: () => void;
    apiEndpoint?: string; // Optional API endpoint override
}

const MistakeFeedbackModal: React.FC<MistakeFeedbackModalProps> = ({
    attemptId,
    isOpen,
    onClose,
    apiEndpoint = '/api/mistake-feedback' // Default API endpoint
}) => {
    const [selectedMistakeType, setSelectedMistakeType] = useState<MistakeType | ''>('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    const mistakeTypes = [
        {
            id: MistakeType.CONCEPTUAL,
            label: 'Conceptual Mistakes',
            description: 'I misunderstood the underlying physics concepts',
            icon: Brain,
            color: 'purple'
        },
        {
            id: MistakeType.CALCULATION,
            label: 'Calculation Errors',
            description: 'I made mathematical or computational errors',
            icon: Calculator,
            color: 'blue'
        },
        {
            id: MistakeType.READING,
            label: 'Reading & Interpretation Errors',
            description: 'I misread or misinterpreted the question',
            icon: BookOpen,
            color: 'green'
        },
        {
            id: MistakeType.OVERCONFIDENCE,
            label: 'Overconfidence Errors',
            description: 'I was too confident and didn\'t consider all possibilities',
            icon: Zap,
            color: 'orange'
        },
        {
            id: MistakeType.OTHER,
            label: 'Other',
            description: 'Something else caused my mistake',
            icon: PenTool,
            color: 'gray'
        }
    ];

    const getColorClasses = (color: string) => {
        const colorMap = {
            purple: 'border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-800',
            blue: 'border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-800',
            green: 'border-green-200 bg-green-50 hover:bg-green-100 text-green-800',
            orange: 'border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-800',
            gray: 'border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-800'
        };
        return colorMap[color as keyof typeof colorMap] || colorMap.gray;
    };

    const handleSubmit = async () => {
        if (!selectedMistakeType) {
            toast({
                title: "Please select a reason",
                description: "Choose why you think you got this question wrong.",
                variant: "destructive",
                className: "bg-white"
            });
            return;
        }
        setIsSubmitting(true);

        try {
            const response = await axios.put(`/api/attempts/${attemptId}`, { mistake: selectedMistakeType })
            if (!response.data.success) {
                toast({
                    title: "Submission failed",
                    description: "There was an error submitting your feedback. Please try again.",
                    variant: "destructive",
                    className: "bg-white"
                });
            } else {
                toast({
                    title: "Feedback submitted!",
                    description: "Thank you for helping us understand your learning process.",
                    className: "bg-white",
                });
            }
            handleClose();
        } catch (error) {
            console.error('Error submitting mistake feedback:', error);

            toast({
                title: "Submission failed",
                description: "There was an error submitting your feedback. Please try again.",
                variant: "destructive",
                className: "bg-white"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedMistakeType('');
        onClose();
    };

    const handleMistakeSelect = (mistakeId: MistakeType) => {
        setSelectedMistakeType(mistakeId);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="space-y-4">
                    <DialogTitle className="flex items-center gap-3 text-xl">
                        <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center">
                            <MessageCircle className="w-5 h-5" />
                        </div>
                        Why was your answer incorrect?
                    </DialogTitle>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        Understanding your mistakes helps us provide better learning experiences.
                        Please select what you think went wrong with your answer.
                    </p>
                </DialogHeader>

                <div className="space-y-6">
                    <RadioGroup
                        value={selectedMistakeType}
                        onValueChange={(value) => setSelectedMistakeType(value as MistakeType)}
                        className="space-y-3"
                    >
                        {mistakeTypes.map((mistake) => {
                            const IconComponent = mistake.icon;
                            const isSelected = selectedMistakeType === mistake.id;

                            return (
                                <div
                                    key={mistake.id}
                                    className={`rounded-lg border-2 p-4 transition-all cursor-pointer select-none ${isSelected
                                        ? `${getColorClasses(mistake.color)} border-opacity-100`
                                        : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
                                        }`}
                                    onClick={() => handleMistakeSelect(mistake.id)}
                                >
                                    <div className="flex items-start space-x-3 pointer-events-none">
                                        <RadioGroupItem
                                            value={mistake.id}
                                            id={mistake.id}
                                            className="mt-1 pointer-events-none"
                                            checked={isSelected}
                                        />
                                        <div className="flex-1">
                                            <Label
                                                htmlFor={mistake.id}
                                                className="font-semibold cursor-pointer flex items-center gap-2 mb-1 pointer-events-none"
                                            >
                                                <IconComponent className="w-4 h-4" />
                                                {mistake.label}
                                            </Label>
                                            <p className="text-sm text-gray-600 leading-relaxed pointer-events-none">
                                                {mistake.description}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </RadioGroup>



                    <div className="flex gap-3">
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-gradient-to-bl from-primary-500 to-primary-600 hover:from-primary-500 hover:to-primary-700 text-white flex-1"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-4">
                    <div className="text-center">
                        <p className="text-xs text-gray-400">
                            Attempt ID: {attemptId}
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default MistakeFeedbackModal;