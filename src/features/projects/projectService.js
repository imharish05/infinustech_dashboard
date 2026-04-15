import Swal from "sweetalert2"
import api from "../../api/axios"
import { addProjects, allProjects, assignStaffToProject, deleteProject, removeStaffFromProject, updateProject } from "./projectSlice"

export const getAllProjects = async(dispatch) => {
    try {
        
        // const res = await api.get("/projects")

        // const data = res.data.projects

        // dispatch(allProjects(data))

        Swal.fire({
                title : "Success!",
                text : "Project has been added Successfully",
                icon : "success",
                confirmButtonColor : "#ea8b0c",
                timer : 3000
            })
    } catch (err) {
        const message = err.response?.data?.message || "Unable To Add Customer";
        
                Swal.fire({
                    title : "Error!",
                    text : message,
                    icon :"error",
                    confirmButtonColor :"#d33",
            })
    }
}


export const addNewProject = async(dispatch,payload) => {
    try{
        // const res = await api.post("/add-project",payload)

        // const data = res.data.project

        dispatch(addProjects(payload))

        Swal.fire({
                title : "Success!",
                text : "Project has been added Successfully",
                icon : "success",
                confirmButtonColor : "#ea8b0c",
                timer : 3000
            })

            return true;
    }
    catch(err){
        const message = err.response?.data?.message || "Unable To Add Project";
        
                Swal.fire({
                    title : "Error!",
                    text : message,
                    icon :"error",
                    confirmButtonColor :"#d33",
            })

            return false;
    }
}

export const updateProjectFunction = async(dispatch,id,payload) => {
    try{
        // const res = await api.patch(`/update-project/${id}`,payload)

        // const data = res.data.project

        dispatch(updateProject(payload))

        Swal.fire({
                title : "Success!",
                text : "Project updated Successfully",
                icon : "success",
                confirmButtonColor : "#ea8b0c",
                timer : 3000
            })

            return true;
    }
    catch(err){
        const message = err.response?.data?.message || "Unable To Add Customer";
        
                Swal.fire({
                    title : "Error!",
                    text : message,
                    icon :"error",
                    confirmButtonColor :"#d33",
            })

            return false;
    }
}

export const deleteProjectFunction = async (dispatch, id) => {
    try {
        // const res = await api.delete(`/delete-customer/${id}`);

        dispatch(deleteProject(id));

        Swal.fire({
            title: "Deleted!",
            text: "Project record has been removed.",
            icon: "success",
            confirmButtonColor: "#ea8b0c",
            timer: 2000
        });

    } catch (err) {
        const message = err.response?.data?.message || "Unable to delete customer";

        Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonColor: "#d33",
        });
    }
};