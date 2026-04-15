import api from "../../api/axios";
import { setAllPermissions, setLoading, setError } from "./permissionSlice";
import Swal from "sweetalert2";

// 1. Fetch current permission settings from backend
export const fetchPermissionsFunction = async (dispatch) => {
    dispatch(setLoading(true));
    try {
        // const res = await api.get("/permissions");
        // dispatch(setAllPermissions(res.data));
    } catch (err) {
        dispatch(setError(err.message));
    }
};

// 2. Save the entire updated map to the backend
export const savePermissionsFunction = async (rolePermissions) => {
    try {
        // await api.post("/update-permissions", { permissions: rolePermissions });

        Swal.fire({
            title: "Permissions Saved!",
            text: "User roles have been updated successfully.",
            icon: "success",
            confirmButtonColor: "#ea8b0c", // Matching your brand color
            timer: 2500
        });
        return true;
    } catch (err) {
        Swal.fire({
            title: "Error!",
            text: err.response?.data?.message || "Failed to update permissions",
            icon: "error"
        });
        return false;
    }
};