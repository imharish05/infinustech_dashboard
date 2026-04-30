import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useDispatch} from "react-redux"
import { addCustomerFunction } from '../features/customers/customerService';
import HasPermission from './HasPermission';
import { useId } from 'react';

const AddUserLayer = () => {

    const id =useId()
    
    // Hooks
    const dispatch = useDispatch()
    const navigate = useNavigate()

        
        const [name,setName] = useState("")
        const [address,setAddress] = useState("")
        const [phone,setPhone] = useState("")
       
        const [errors,setErrors] = useState({})
        
        const handleCancel = () => {
            setName("")
            setAddress("")
            setPhone("")
            
        
            navigate(-1)
        }

          const handlePhoneChange = (e) => {
    const value = e.target.value;

    if(/^\d*$/.test(value) && value.length<=10){
      setPhone(value)
    }

  }
        
       const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
        newErrors.name = "Name is required";
    }

    // Fix: Trigger error if phone is empty
    if (!phone.trim()) {
        newErrors.phone = "Phone number is required";
    } else if (phone.length < 10) {
        newErrors.phone = "Phone number must be 10 digits";
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

          const ErrorMsg = ({field}) => {
    return errors[field] ? (
      <div className="text-danger mt-4 fw-medium" style={{fontSize : "11px"}}>
        {errors[field]}
      </div>
    ): null
  }

        const [sampleId,setSampleId] = useState(1)
        
        const handleCustomer = async(e) =>{
            e.preventDefault()
            const isValid = validate({ field: "" }); 
    if (!isValid) return; // Stop if there are errors
            try{

                const payload = {
                    // Change the id
                    id : id,name,address,phone,status : "Active",role : "customer"
                }
                setSampleId((prev) => prev +1)
                
            addCustomerFunction(dispatch,payload)

            setName("")
            
            setAddress("")
            setPhone("")
            navigate(-1)
            }
            catch(err){
                console.log(err.message)
            }
        }

        return (
            <div className="card h-100 p-0 radius-12" style = {{backgroundColor: "transparent",            // Corrected from "none"
    backdropFilter: "none",                   // Set to none for pure transparency
}}>
                <div className="card-body p-24">
                    <div className="row justify-content-center">
                        <div className="col-xxl-6 col-xl-8 col-lg-10">
                            <div className="card">
                                <div className="card-body">
                                    <h6 className="text-lg text-center text-primary-light mb-16">Add New Customer</h6>
                                    <form action="#" onSubmit={(e)=>handleCustomer(e)}>
                                        <div className="mb-20">
                                            <label
                                                htmlFor="name"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Full Name <span className="text-danger-600">*</span>
                                            </label>
                                            
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="name"
                                                

                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter Full Name"
                                            />
                                            <ErrorMsg field={"name"}/>
                                        </div>
                                        <div className="mb-20">
                                            <label
                                                htmlFor="address"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                value={address}
                                                onChange={(e) => setAddress(e.target.value)}
                                                className="form-control radius-8"
                                                id="address"
                                                placeholder="Enter your address"
                                            />
                                        </div>
                                        <div className="mb-20">
                                            <label
                                                htmlFor="number"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Phone <span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                            value={phone}
                                                onChange={(e) =>handlePhoneChange(e)}
                                                type="tel"
                                                
                                                className="form-control radius-8"
                                                id="number"
                                                placeholder="Enter phone number"
                                            />
                                            <ErrorMsg field={"phone"}/>
                                        </div>
    
                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            

                                <HasPermission permission={"edit-customer"}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                                >
                                                Save Customer
                                            </button>
                                            </HasPermission>
                                            <button
                                            type='button'
                                                onClick={()=>handleCancel()}
                                                className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        );
    };

    export default AddUserLayer;