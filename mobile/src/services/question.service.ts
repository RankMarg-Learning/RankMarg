import api from '@/utils/api';

export const reportQuestion = async (
  slug: string,
  payload: { type: string; feedback: string }
) => {
  try {
    const response = await api.post(`/question/${slug}/report`, payload);
    return response.data;
  } catch (error) {
    console.error('[mobile] Error reporting question:', error);
    return {
      success: false,
      message: 'Error reporting question',
    };
  }
};


