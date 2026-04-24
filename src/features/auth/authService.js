import api from "../../api/axios";
import { loginStart, loginSuccess, loginFailure, logout } from "./authSlice";
import toast from 'react-hot-toast'; // Import toast



export const signupFunction = async (dispatch, navigate, userData) => {
    dispatch(loginStart());

    // Create a loading toast
    const loadToast = toast.loading('Creating your account...');

    try {
        // Send POST request to /auth/signup
        const res = await api.post("/auth/signup", userData); 

        // On success, we treat it like a login: save user data and token
        dispatch(loginSuccess(res.data));

        toast.success(`Account created! Welcome, ${res.data.user.name}`, {
            id: loadToast,
        });

        // Redirect to dashboard or home
        navigate("/");

    } catch (err) {
        const errorMessage = err.response?.data?.message || "Registration failed";
        
        toast.error(errorMessage, {
            id: loadToast,
        });

        if (typeof loginFailure === 'function') {
            dispatch(loginFailure(errorMessage));
        }
    }
};


export const loginFunction = async (dispatch, navigate, { phone, password }) => {
    dispatch(loginStart());

    // Create a loading toast that we will update later
    const loadToast = toast.loading('Logging in...');

    try {
        const res = await api.post("/auth/login", { phone, password });

        dispatch(loginSuccess(res.data));

        // Update the existing toast to success
        toast.success(`Welcome back, ${res.data.user.name}!`, {
            id: loadToast,
        });

        navigate("/");

    } catch (err) {
        const errorMessage = err.response?.data?.message || "Login failed";
        
        // Update the existing toast to error
        toast.error(errorMessage, {
            id: loadToast,
        });

        // Ensure you have a failure action to stop the loading state in Redux
        if (typeof loginFailure === 'function') {
            dispatch(loginFailure(errorMessage));
        }
    }
};


export const loadUserFunction = async (dispatch) => {
    try {
        const res = await api.get("/auth/me"); 
        
        // Pass both user and the existing token back to the reducer
        dispatch(loginSuccess({ 
            user: res.data.user, 
            token: localStorage.getItem("token") 
        }));
    } catch (err) {
        dispatch(logout());
    }
};