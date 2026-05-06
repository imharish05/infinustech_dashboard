import { toast } from 'react-hot-toast';
import api from "../../api/axios";
import { addProjects, allProjects, assignStaffToProject, deleteProject, updateProject } from "./projectSlice";
import { assignProjectToStaff } from '../staff/staffSlice';

export const getAllProjects = async (dispatch, page = 1, limit = 5) => {
    try {
        const res = await api.get(`/projects/all?page=${page}&limit=${limit}`);
        // Dispatch the entire data object (projects + pagination metadata)
        dispatch(allProjects(res.data));
    } catch (err) {
        toast.error("Unable To Fetch Projects");
        console.log(err);
    }
};
export const addNewProject = async (dispatch, payload) => {
    const loadingToast = toast.loading("Saving new project...");
    try {
        const res = await api.post("/projects/add-project", payload);
        dispatch(addProjects(res.data.project));
        
        toast.success("Project added successfully! 🎉", { id: loadingToast });
        return true;
    } catch (err) {
        const message = err.response?.data?.message || "Could not save project.";
        toast.error(message, { id: loadingToast });
        return false;
    }
};

export const updateProjectFunction = async (dispatch, id, payload) => {
    if (!id) {
        toast.error("Project ID is missing!");
        return false;
    }

    const loadingToast = toast.loading("Updating project...");

    try {
        const res = await api.patch(`/projects/update-project/${id}`, payload);
        // Syncing with the project data returned from the server
        dispatch(updateProject(res.data.project)); 
        
        toast.success("Project updated successfully!", { id: loadingToast });
        return true;
    } catch (err) {
        const message = err.response?.data?.message || "Update failed.";
        toast.error(message, { id: loadingToast });
        return false;
    }
};

export const deleteProjectFunction = async (dispatch, id) => {
    const loadingToast = toast.loading("Removing project...");

    try {
        await api.delete(`/projects/delete-project/${id}`);
        dispatch(deleteProject(id));
        
        toast.success("Project deleted.", { id: loadingToast });
        return true;
    } catch (err) {
        toast.error("Delete failed.", { id: loadingToast });
        console.log(err);
        return false;
    }
};

