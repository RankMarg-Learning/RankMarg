import api from "@/utils/api";

interface User {
    fullname:string;
    username:string;
    email:string;
    password:string;
    confirmpassword:string;
}

export const addUser = async (user: Partial<User>) => {
    try {
        const response = await api.post('/users', user);
        return response.data;

    } catch (error) {
        console.error("Error adding user:", error);
        return {
            success: false,
            message: error?.response?.data?.message ||"Error adding user",
        };
    }

}