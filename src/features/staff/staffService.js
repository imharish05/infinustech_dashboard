
import api from "../../api/axios";
import { assignStaffToProject, unAssignStaffFromProject } from "../projects/projectSlice";
import { updateStaff,addStaff,deleteStaff, assignProjectToStaff, unAssignProjectFromStaff } from "./staffSlice";

import Swal from "sweetalert2";

export const updateStaffFunction = async (dispatch, id, payload) => {
    try {
        // await api.patch(`/update-staff/${id}`, payload);
        dispatch(updateStaff(payload));

        Swal.fire({
            title: "Success!",
            text: "Staff record has been updated Successfully",
            icon: "success",
            confirmButtonColor: "#ea8b0c",
            timer: 3000
        });

        return true;

    } catch (err) {

        const message = err.response?.data?.message || "Unable To Update Staff Record";
        Swal.fire({ title: "Error!", text: message, icon: "error", confirmButtonColor: "#d33" });
        return false;
    }
};

export const allStaffFunction = async(dispatch) => {
    try {
        
        // const res = await api.get("/staffs")

        // const data = res.data.staffs

        // dispatch(allStaffs(data))

    } catch (err) {
        const message = err.response?.data?.message || "Unable To Add Staff";

        Swal.fire({
            title : "Error!",
            text : message,
            icon :"error",
            confirmButtonColor :"#d33",
        })
    }
}

export const addStaffFunction = async(dispatch,payload) => {
    try{
        // const res = await api.post("/add-staff",payload)

        // const data = res.data.staff

        // console.log(payload);
        

        dispatch(addStaff(payload))

        Swal.fire({
            title : "Success!",
            text : "Staff has been added Successfully",
            icon : "success",
            confirmButtonColor : "#ea8b0c",
            timer : 3000
        })

    }
    catch(err){
        const message = err.response?.data?.message || "Unable To Add Staff";

        Swal.fire({
            title : "Error!",
            text : message,
            icon :"error",
            confirmButtonColor :"#d33",
        })
    }
}



export const deleteStaffFunction = async (dispatch, id) => {
    try {
        // await api.delete(`/delete-staff/${id}`);

        dispatch(deleteStaff(id));

        Swal.fire({
            title: "Deleted!",
            text: "Staff record has been removed.",
            icon: "success",
            confirmButtonColor: "#ea8b0c",
            timer: 2000
        });

    } catch (err) {
        const message = err.response?.data?.message || "Unable to delete staff record";

        Swal.fire({
            title: "Error!",
            text: message,
            icon: "error",
            confirmButtonColor: "#d33",
        });
    }
};


export const toggleAssignmentFunction = async (dispatch,staffId,projectId,staffName = null,isAssigning  =true) => {
    try{

        if(isAssigning){

            console.log("The assigning is wporking");
            

            dispatch(assignProjectToStaff({staffId,projectId}))
            dispatch(assignStaffToProject({staffId,projectId,staffName}))
        return true;

        }
        else{
            // await api.post("/staffs/unassign-project", { projectId });

            dispatch(unAssignProjectFromStaff({staffId, projectId} ));
            dispatch(unAssignStaffFromProject({projectId}))
    }
    }
    catch(err){
        const message = err.response?.data?.message || "Unable to delete staff record";
        return false;
    }
}