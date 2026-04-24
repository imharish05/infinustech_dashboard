import Swal from "sweetalert2";
import api from "../../api/axios";
import { 
    setStages, addStage, recordStagePayment, recordDocument, 
    startDocumentUpload, uploadDocumentError, deleteDocumentSuccess, 
    updateStageStatus, 
    setLoading,
    setTotalCollected,
    setAllStages
} from "./stageSlice";
import { toast } from "react-hot-toast";
import { addSocketNotification } from "../notification/notificationSlice"; // 👈 ADD THIS IMPORT

/**
 * Fetch stages for one specific project
 */
export const individualStages = async (dispatch, projectId) => {
    dispatch(setLoading(true));
    try {
        const res = await api.get(`/stages/project/${projectId}`);
        dispatch(setStages(res.data));
    } catch (err) {
        const message = err.response?.data?.message || "Unable to fetch project stages";
        Swal.fire({
            title: '<span style="font-size: 25px">Error!</span>',
            text: message,
            icon: "error",
            confirmButtonColor: "#d33",
        });
    } finally {
        dispatch(setLoading(false));
    }
};

/**
 * Add a new stage to the database and update Redux
 */
export const addStageFunction = async (dispatch, payload, projectId) => {
    const loadingToast = toast.loading("Adding new stage...");
    try {
        const res = await api.post(`/stages/add-stage/${projectId}`, payload);
        dispatch(addStage({ 
            projectId, 
            stage: res.data.stage 
        }));
        toast.success("Stage added successfully!", { id: loadingToast });
        return true;
    } catch (err) {
        const message = err.response?.data?.message || "Unable to add stage";
        toast.error(message, { id: loadingToast });
        return false;
    }
};

/**
 * Record payment and update stage status in DB and Redux
 */
export const recordStagePaymentFunction = async (dispatch, payload, stageId, projectId) => {
    const loadingToast = toast.loading("Recording payment...");
    try {
        const res = await api.put(`/stages/record-payment/${stageId}`, payload);
        const data = res.data.stage;

        dispatch(recordStagePayment({ 
            projectId,
            stageId: data.id, 
            paid: data.paid,
            status: data.status,
            payment_date: data.payment_date,
            payment_mode: data.payment_mode,
            payment_status: data.payment_status
        }));

        toast.success("Payment balance updated!", { id: loadingToast });

        // 👇 ADD THIS BLOCK — fires notification if stage is completed but still unpaid
        if (res.data.reminder) {
            dispatch(addSocketNotification({
                id: `pay-${stageId}-${Date.now()}`,
                title: 'Payment Pending',
                message: `Stage is completed but balance remains unpaid.`,
                projectId: projectId,
                timestamp: new Date().toISOString(),
            }));
        }
        // 👆 END OF NEW BLOCK

        return true;
    } catch (err) {
        const message = err.response?.data?.message || "Unable to record payment";
        toast.error(message, { id: loadingToast });
        return false;
    }
};

/**
 * Upload CAD/PDF/Images to the server and update Redux path
 */
export const recordDocumentFunction = async (dispatch, projectId, stageId, customerId, formData) => {
    dispatch(startDocumentUpload());
    try {
        const res = await api.post(`/stages/upload-document/${stageId}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        dispatch(recordDocument({
            projectId,
            stageId,
            data: { file_path: res.data.file_path } 
        }));
        return true;
    } catch (error) {
        dispatch(uploadDocumentError());
        return false;
    }
};

/**
 * Delete document from server and clear path in Redux
 */
export const deleteStageDocumentFunction = async (dispatch, projectId, stageId) => {
    const loadingToast = toast.loading("Deleting document...");
    try {
        await api.delete(`/stages/delete-document/${stageId}`);
        dispatch(deleteDocumentSuccess({ projectId, stageId }));
        toast.success("Document deleted!", { id: loadingToast });
        return true;
    } catch (error) {
        toast.error("Failed to delete file.", { id: loadingToast });
        return false;
    }
};

/**
 * Update the status of a stage manually
 */
export const updateStageStatusFunction = async (dispatch, data, stageId, projectId) => {
    const loadingToast = toast.loading("Updating status...");
    try {
        const res = await api.patch(`/stages/update-status/${stageId}`, data);

        dispatch(updateStageStatus({ 
            projectId, 
            stageId, 
            status: res.data.status 
        }));

        toast.success("Status updated!", { id: loadingToast });

        // 👇 ADD THIS BLOCK — fires notification when stage is manually set to Completed but unpaid
        if (res.data.reminder) {
            dispatch(addSocketNotification({
                id: `stage-${stageId}-${Date.now()}`,
                title: 'Payment Pending',
                message: `Stage completed but payment is still due.`,
                projectId: projectId,
                timestamp: new Date().toISOString(),
            }));
        }
        // 👆 END OF NEW BLOCK

        return true;
    } catch (error) {
        toast.error("Status update failed.", { id: loadingToast });
        return false;
    }
};

/**
 * Fetch total collected amount
 */
export const fetchTotalCollectedAmount = async (dispatch) => {
    try {
        const response = await api.get("/stages/total-paid");
        if (response.data.success) {
            dispatch(setTotalCollected(response.data.totalCollected));
            return response.data.totalCollected;
        }
    } catch (error) {
        console.error("Error fetching total collected:", error);
        return 0;
    }
};

/**
 * Fetch all stages for stats/notifications
 */
export const fetchAllStagesForStats = async (dispatch) => {
    try {
        const res = await api.get("/stages/all-stages");
        dispatch(setAllStages(res.data.stages));
    } catch (err) {
        console.error("Chart data fetch failed", err);
    }
};