import { test } from "@/types/typeAdmin";
import api from "@/utils/api";

export const getTests = async () => {
  try {
    const response = await api.get('/test');
    return response.data;
  } catch (error) {
    console.error("Error fetching tests:", error);
    return {
      success: false,
      message: "Error fetching tests",
    };
  }
  
};

export const getTestById = async (testId: string) => {
  try {
    const response = await api.get(`/test/${testId}`);
  return response.data;
  } catch (error) {
    console.error("Error fetching test by ID:", error);
    return {
      success: false,
      message: "Error fetching test",
    };
  }
  
};

export const addTest = async (test: Partial<test>) => {
  try {
    const response = await api.post('/test', test);
    return response.data;
  } catch (error) {
    console.error("Error adding test:", error);
    return {
      success: false,
      message: "Error adding test",
    };
  }
 
};

export const updateTest = async (id: string, test: Partial<test>) => {
  try {
    const response = await api.put(`/test/${id}`, test);
    return response.data;
  } catch (error) {
    console.error("Error updating test:", error);
    return {
      success: false,
      message: "Error updating test",
    };
  }
 
};

export const deleteTest = async (id: string) => {
  try {
    const response = await api.delete(`/test/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting test:", error);
    return {
      success: false,
      message: "Error deleting test",
    };
  }
};


export const getTestResults = async(resultsLimit:number)=>{
  const version = process.env.VERSION || '/v.1.0';
  try {
    const response = await api.get(`${version}/tests/results?limit=${resultsLimit}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching test results:", error);
    return {
      success: false,
      message: "Error fetching test results",
    };
  }
}
