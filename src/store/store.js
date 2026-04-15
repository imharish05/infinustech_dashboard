import {configureStore} from "@reduxjs/toolkit"
import customerReducer from "../features/customers/customerSlice.js"
import projectReducer from "../features/projects/projectSlice.js"
import staffReducer from "../features/staff/staffSlice.js"
import stageReducer from "../features/stages/stageSlice.js"
import permissionReducer from "../features/permissions/permissionSlice.js"
import authSlice from "../features/auth/authSlice.js"

export const store = configureStore({
    reducer : {
        auth : authSlice,
        customers : customerReducer,
        projects : projectReducer,
        staffs : staffReducer,
        stages : stageReducer,
        permissions : permissionReducer
    }
})