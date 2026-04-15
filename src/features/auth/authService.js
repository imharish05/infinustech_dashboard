import api from "../../api/axios";
import { loginStart, loginSuccess } from "./authSlice";

export const loginFunction = async(dispatch,navigate,{phone,password}) => {

    dispatch(loginStart())

try {
//    const res = await api.post("/login",{phone,password})

//    dispatch(loginSuccess(res.data))

const sampleData = {
  "success": true,
  "token": "sample Token", 
  "user": {
    "id": "1",
    "name": "Harish",
    "email": "sample@gmail.com",
    "role": "staff",
"permissions" :[
  "view-admin",
  "view-dashboard",
  "change-status",
  "view-staffs",
  "create-staff",
  "edit-staff",
  "delete-staff",
  "view-customers",
  "create-customer",
  "edit-customer",
  "delete-customer",
  "view-projects",
  "create-projects",
  "edit-projects",
  "delete-projects",
  "upload-docs",
  "manage-access",
  "manage-remainders",
  "view-reports"
]
  }
}

dispatch(loginSuccess(sampleData))

   navigate("/")
    
} catch (err) {
    
}
}