import api from "./api";

export const handleSignOut = async () => {
    try {
        const res = await api.post("/auth/sign-out");
        localStorage.removeItem('accessToken');
        if (res.data.success) {
            window.location.href = "/sign-in";
        }
    } catch (error) {
        console.error("Error signing out:", error);
    }
}