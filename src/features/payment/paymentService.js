
import api from "../../api/axios";
import { setTotalCollected } from "../stages/stageSlice";
import { 
    allRecords,
  recordPaymentStart, 
  recordPaymentSuccess, 
  recordPaymentFailure 
} from "./paymentSlice";
import Swal from "sweetalert2";


export const stagePaymentCollection = async (dispatch, paymentData, stageId, projectId) => {
    dispatch(recordPaymentStart());

    try {
        // paymentData now includes payment_status and stage_amount from the frontend
        const response = await api.post("/payments/record", {
            ...paymentData,
            stageId,
            projectId
        });

        if (response.data) {
            dispatch(recordPaymentSuccess(response.data));
            return true;
        }
    } catch (error) {
        const message = error.response?.data?.message || "Failed to record payment";
        dispatch(recordPaymentFailure(message));
        return false;
    }
};

export const fetchAllPayments = async (dispatch) => {
    dispatch(recordPaymentStart()); // Reuse the start action for loading state
    try {
        const response = await api.get("/payments/all"); // Ensure this matches your backend route

        if (response.data) {
            dispatch(allRecords(response.data));
            return true;
        }
    } catch (error) {
        const message = error.response?.data?.message || "Failed to fetch payment records";
        dispatch(recordPaymentFailure(message));
        return false;
    }
};