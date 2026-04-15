import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    customers : [
      {
        id: 1,
        name: "Kathryn Murphy",
        address: "12, MG Road, T. Nagar, Chennai, Tamil Nadu - 600017",
        phone: "9876543210",
        projectType: "Residential",
        budget: 250000,
        status: "Active",
        role : "customers"
      },
    //   {
    //     id: 2,
    //     name: "Annette Black",
    //     address: "45, Brigade Road, Ashok Nagar, Bengaluru, Karnataka - 560025",
    //     phone: "9123456780",
    //     projectType: "Commercial",
    //     budget: 500000,
    //     status: "Active",
    //   },
    //   {
    //     id: 3,
    //     name: "Ronald Richards",
    //     address: "78, Banjara Hills, Road No. 12, Hyderabad, Telangana - 500034",
    //     phone: "9988776655",
    //     projectType: "Residential",
    //     budget: 150000,
    //     status: "Active",
    //   },
    //   {
    //     id: 4,
    //     name: "Eleanor Pena",
    //     address: "22, Park Street, Near Maidan Metro, Kolkata, West Bengal - 700016",
    //     phone: "9090909090",
    //     projectType: "Commercial",
    //     budget: 750000,
    //     status: "Active",
    //   },
    //   {
    //     id: 5,
    //     name: "Leslie Alexander",
    //     address: "9, FC Road, Shivajinagar, Pune, Maharashtra - 411005",
    //     phone: "9012345678",
    //     projectType: "Residential",
    //     budget: 300000,
    //     status: "Active",
    //   },
    //   {
    //     id: 6,
    //     name: "Albert Flores",
    //     address: "2/306, Blue Hills Avenue, Mettupalayam, Coimbatore, Tamil Nadu - 641104",
    //     phone: "9871234560",
    //     projectType: "Commercial",
    //     budget: 650000,
    //     status: "Active",
    //   },
    ]
}

const customerSlice = createSlice({
    name : "Customers",
    initialState,
    reducers : {
        allCustomers : (state,action) => {
            state.customers = action.payload;
        },
        addCustomer : (state,action) => {
            state.customers.push(action.payload)
        },
        updateCustomer : (state,action) => {
            const index = state.customers.findIndex(
                (c) => String(c.id)=== String(action.payload.id)
            );
            if(index !== -1){
                state.customers[index] = action.payload;
            }
        },
        deleteCustomer : (state,action) => {
            state.customers = state.customers.filter(
                (c) => String(c.id) !== String(action.payload)
            )
        }
    }
})


export const {addCustomer,updateCustomer,deleteCustomer,allCustomer} = customerSlice.actions;

export default customerSlice.reducer;