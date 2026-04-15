import {createSlice, current } from "@reduxjs/toolkit"

const initialState = {
    projects : [
        {cost
: 
"1268565",
customerId
: 
1,
customerName
: 
"Kathryn Murphy",
id
: 
"7a36e31a-0e09-4e60-9619-1a2793d0c223",
location
: 
"coimbatore",
projectName : "Sam homes",
projectType: "Residential",
status : "Initialized"},
{
  id: "1ba2906f-e70e-4520-b603-9c84ead1aa6f",
  projectName: "Sampel",
  location: "Coimbatore",
  customerName: "Kathryn Murphy",
  customerId: 1,
  cost: 1500000,
  projectType: "Residential",
  status: "Initialized"
}
    ]
}

const projectSlice = createSlice({
    name : "Projects",
    initialState,
    reducers : {
        allProjects : (state,action) => {
            state.projects = action.payload
        },
        addProjects : (state,action) => {
             state.projects.push(action.payload)
        },
        updateProject : (state,action) => {
            const index = state.projects.findIndex(
                (p) => String(p.id) === String(action.payload.id)
            )

            if(!index !== -1){
                state.projects[index] = action.payload
            }
        },
       deleteProject : (state,action) => {
             state.projects = state.projects.filter(
        (p) => String(p.id)!== String(action.payload) // Use action.payload directly
        )},

        assignStaffToProject : (state,action) => {
            const {projectId,staffId,staffName} = action.payload;

            const project  = state.projects.find((p)=> String(p.id) === String(projectId))
            
            if (project) {
                project.assignedStaffId = staffId;
                project.assignedStaffName = staffName;
            }
        },
        unAssignStaffFromProject : (state,action) => {
            const {projectId} = action.payload;

            const project = state.projects.find((p)=> String(p.id) === String(projectId))

            if(project){
                project.assignedStaffId = null;
                project.assignedStaffName = null;
            }
        }
    }
})


export const {allProjects,addProjects,updateProject,deleteProject,unAssignStaffFromProject,assignStaffToProject} = projectSlice.actions;
export default projectSlice.reducer