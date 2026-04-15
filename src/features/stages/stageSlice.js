import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
  stage: [
    {
      "projectId": "7a36e31a-0e09-4e60-9619-1a2793d0c223",
      "stages": [
        {
          "id": "1",
          "stage_Name": "Architecture Design",
          "description": "Initial blueprints",
          "amount": 50000,
          "paid": 5000,
          "status": "In Progress",
          "customer_id": 1,
          "documentPath": null,
          "duration" : "2026-04-14T17:06"
        }
      ]
    }
  ],
  loading: false,
  // NEW: Specific loading state for document uploads
  documentLoading: false 
};

const projectProgressSlice = createSlice({
  name: 'projectProgress',
  initialState,
  reducers: {
    setStages: (state, action) => {
      state.stage = action.payload;
    },

    addStage: (state, action) => {
      const { projectId, stage } = action.payload;
      const projectProgress = state.stage.find(p => p.projectId === projectId);

      const newStage = {
        ...stage,
        id: stage.id || stage._id || `temp-${Date.now()}`,
        paid: Number(stage.paid) || 0,
        status: stage.status || "Pending"
      };

      if (projectProgress) {
        projectProgress.stages.push(newStage);
      } else {
        state.stage.push({ projectId, stages: [newStage] });
      }
    },

    recordStagePayment: (state, action) => {
      const { projectId, stageId, paid } = action.payload;
      const projectProgress = state.stage.find(p => p.projectId === projectId);

      if (projectProgress) {
        const stage = projectProgress.stages.find(s => (s.id === stageId || s._id === stageId));
        if (stage) {
          const incoming = Number(paid) || 0;
          const currentPaid = Number(stage.paid) || 0;
          const stageGoal = Number(stage.amount) || 0;

          stage.paid = Math.min(stageGoal, currentPaid + incoming);
          stage.status = stage.paid >= stageGoal ? "Completed" : "In Progress";
        }
      }
    },

    deleteDocumentSuccess: (state, action) => {
      const { projectId, stageId } = action.payload;
      const projectProgress = state.stage.find((p) => p.projectId === projectId);
      
      if (projectProgress) {
        const stage = projectProgress.stages.find((s) => s.id === stageId);
        if (stage) {
          // Clear the document path in the state
          stage.documentPath = null; 
          // If you store multiple documents in an array:
          // stage.documents = []; 
        }
      }
    },

    // --- UPDATED DOCUMENT ACTIONS ---

    // 1. Call this BEFORE the API request starts
    startDocumentUpload: (state) => {
      state.documentLoading = true;
    },

    // 2. Call this after the API request succeeds
    recordDocument: (state, action) => {
      const { projectId, stageId, data } = action.payload;
      state.documentLoading = false; // Reset loading

      const project = state.stage.find((p) => String(projectId) === String(p.projectId));
      if (project) {
        const stage = project.stages.find((s) => 
          String(s.id) === String(stageId) || String(s._id) === String(stageId)
        );
        if (stage) {
          stage.documentPath = data.file_path;
        }
      }
    },

    // 3. Call this if the upload fails
    uploadDocumentError: (state) => {
      state.documentLoading = false;
    }
  },
});

export const { 
  addStage, 
  recordStagePayment, 
  setStages, 
  recordDocument, 
  startDocumentUpload, 
  uploadDocumentError,
  deleteDocumentSuccess
} = projectProgressSlice.actions;

export default projectProgressSlice.reducer;