import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    // Initial state matches your component's structure
    rolePermissions: {
        admin: [],
        designer: [],
        customer: [],
        staff: []
    },
    loading: false,
    error: null
};

const permissionSlice = createSlice({
    name: 'permissions',
    initialState,
    reducers: {
        setAllPermissions: (state, action) => {
            state.rolePermissions = action.payload;
            state.loading = false;
        },

        toggleRolePermission: (state, action) => {
            const { roleId, permId } = action.payload;
            const currentPerms = state.rolePermissions[roleId] || [];
            
            if (currentPerms.includes(permId)) {
                state.rolePermissions[roleId] = currentPerms.filter(id => id !== permId);
            } else {
                state.rolePermissions[roleId] = [...currentPerms, permId];
            }
        },
        
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.loading = false;
        }
    }
});

export const { setAllPermissions, toggleRolePermission, setLoading, setError } = permissionSlice.actions;
export default permissionSlice.reducer;