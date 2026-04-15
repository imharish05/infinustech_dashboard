import { createSlice } from "@reduxjs/toolkit"; // NOT 'react-redux'
const initialState = {
    user : null,
    token : null,
    isAuthenticated : false,
    loading : false,
    error : null
}

const authSlice = createSlice({
    name : "auth",
    initialState,
    reducers : {
        loginStart : (state) => {
            state.loading = true;
            state.error = null;
        },
        loginSuccess : (state,action) => {
            state.loading = false;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;

            localStorage.setItem("token",action.payload.token)
        },
        loginFailure : (state,action) => {
            state.loading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },
        logout : (state) => {
            state.loading = false;
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem("token")
        }
    }
})


export const {loginStart,loginSuccess,loginFailure,logout} = authSlice.actions
export default authSlice.reducer;