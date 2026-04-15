import { createSlice, current } from "@reduxjs/toolkit";

const initialState = {
    staffs : [
      {
        id: 1,
        name: "Harish",
        address: "12, MG Road, T. Nagar, Chennai, Tamil Nadu - 600017",
        phone: "9876543210",
        projects : [],
        email : "sample@gmail.com",
        password : "12345678",
        role : "staff",
        status: "Active",
      },
      {
        id: 2,
        name: "Sam",
        address: "12, MG Road, T. Nagar, Chennai, Tamil Nadu - 600017",
        phone: "9876543210",
        projects : [],
        email : "sample@gmail.com",
        password : "12345678",
        status: "Active",
        role : "designer"
      }
    ]
}

const staffSlice = createSlice({
    name : "Staffs",
    initialState,
    reducers : {
        allStaffs : (state,action) => {
            state.staffs = action.payload;
        },
        addStaff : (state,action) => {
            state.staffs.push(action.payload)
        },
        updateStaff : (state,action) => {
            const index = state.staffs.findIndex(
                (c) => String(c.id) === String(action.payload.id)
            );
            if(index !== -1){
                state.staffs[index] = action.payload;
            }
        },
        deleteStaff : (state,action) => {
            state.staffs = state.staffs.filter(
                (c) => String(c.id) !== String(action.payload)
            )
        },
        assignProjectToStaff: (state, action) => {
            const { staffId, projectId } = action.payload;

            const staff = state.staffs.find((s) => String(s.id) === String(staffId));

            if (staff) {
                if (!staff.projects) staff.projects = [];
                if (!staff.projects.includes(projectId)) staff.projects.push(projectId);
            }
        },
        unAssignProjectFromStaff : (state,action) => {
            const {staffId,projectId} = action.payload;

            const staff = state.staffs.find((s) =>String(s.id) === String(staffId))

            if(staff && staff.projects){
                staff.projects = staff.projects.filter((p) => String(p.id) !== String(projectId))
            }
        }
    }
})


export const {addStaff,updateStaff,deleteStaff,allStaffs,assignProjectToStaff,unAssignProjectFromStaff} = staffSlice.actions;

export default staffSlice.reducer;