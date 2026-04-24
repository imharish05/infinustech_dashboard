import api from "../../api/axios";
import { setAllPermissions, setLoading, setError } from "./permissionSlice";
import Swal from "sweetalert2";

// 1. Fetch current permission settings from backend
export const fetchPermissionsFunction = async (dispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await api.get("/permissions");
        let data = res.data;

        // Defensive check: If the backend sent a stringified string, parse it
        Object.keys(data).forEach(role => {
            if (typeof data[role] === 'string') {
                try {
                    data[role] = JSON.parse(data[role]);
                } catch (e) {
                    data[role] = [];
                }
            }
        });

        dispatch(setAllPermissions(data));
    } catch (err) {
        dispatch(setError(err.message));
    }
};

// 2. Save the entire updated map to the backend
export const savePermissionsFunction = async (rolePermissions) => {
    try {
        
        await api.post("/update-permissions", { permissions: rolePermissions });
        
        Swal.fire({
           title: '<span style="font-size: 25px">Success</span>',
            text: "User roles and permissions updated successfully.",
            icon: "success",
            confirmButtonColor: "#ea8b0c",
            timer: 2500
        });
        return true;
    } catch (err) {
        Swal.fire({
            title: '<span style="font-size: 25px">Error!</span>',
            text: err.response?.data?.message || "Failed to update permissions",
            icon: "error"
        });
        return false;
    }
};