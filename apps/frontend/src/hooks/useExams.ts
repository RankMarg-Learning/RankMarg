import { useState, useEffect } from "react";
import { Exam } from "@/types/typeAdmin";
import { toast } from "@/hooks/use-toast";
import api from "@/utils/api";

interface UseExamsReturn {
  exams: { data: Exam[]; loading: boolean; error: string | null };
  saveExam: (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateExam: (id: string, exam: Partial<Exam>) => Promise<void>;
  removeExam: (id: string) => Promise<void>;
  addSubjectToExam: (examId: string, subjectId: string, weightage: number) => Promise<void>;
  removeSubjectFromExam: (examId: string, subjectId: string) => Promise<void>;
  isLoading: boolean;
}

export const useExams = (): UseExamsReturn => {
  const [exams, setExams] = useState<{ data: Exam[]; loading: boolean; error: string | null }>({
    data: [],
    loading: true,
    error: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchExams = async () => {
    try {
      setExams(prev => ({ ...prev, loading: true }));
      const response = await api.get('/exams');
      const result = await response.data;
      
      if (result.success) {
        setExams({ data: result.data, loading: false, error: null });
      } else {
        setExams({ data: [], loading: false, error: result.message });
      }
    } catch (error) {
      setExams({ data: [], loading: false, error: 'Failed to fetch exams' });
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const saveExam = async (exam: Omit<Exam, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true);
    try {
      const response = await api.post('/exams', exam);
      
      const result = await response.data;
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Exam created successfully",
        });
        await fetchExams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to create exam",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateExam = async (id: string, exam: Partial<Exam>) => {
    setIsLoading(true);
    try {
      const response = await api.put(`/exams/${id}`, exam);
      
      const result = await response.data;
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Exam updated successfully",
        });
        await fetchExams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to update exam",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeExam = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await api.delete(`/exams/${id}`);
      
      const result = await response.data;
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Exam deleted successfully",
        });
        await fetchExams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to delete exam",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSubjectToExam = async (examId: string, subjectId: string, weightage: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/exams/${examId}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId, weightage }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Subject added to exam successfully",
        });
        await fetchExams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to add subject to exam",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add subject to exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeSubjectFromExam = async (examId: string, subjectId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/exams/${examId}/subjects?subjectId=${subjectId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        toast({
          title: "Success",
          description: "Subject removed from exam successfully",
        });
        await fetchExams();
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to remove subject from exam",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove subject from exam",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    exams,
    saveExam,
    updateExam,
    removeExam,
    addSubjectToExam,
    removeSubjectFromExam,
    isLoading,
  };
};
