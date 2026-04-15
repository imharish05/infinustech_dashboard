import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useDispatch} from "react-redux"
import { addCustomerFunction } from '../features/customers/customerService';
import HasPermission from './HasPermission';

const AddUserLayer = () => {
    
    // Hooks
    const dispatch = useDispatch()
    const navigate = useNavigate()

        
        const [name,setName] = useState("")
        const [address,setAddress] = useState("")
        const [phone,setPhone] = useState("")
        const [projectType,setProjectType] = useState("")
        const [budget,setBudget] = useState("")
        
        const handleCancel = () => {
            setName("")
            setBudget("")
            setAddress("")
            setPhone("")
            setProjectType("")
            navigate(-1)
        }
        
        const [sampleId,setSampleId] = useState(1)
        
        const handleCustomer = async(e) =>{
            e.preventDefault()
            
            try{

                console.log(sampleId,sampleId);
                

                const payload = {
                    // Change the id
                    id : crypto.randomUUID(),name,address,phone,budget,projectType,status : "Active",role : "customer"
                }
                setSampleId((prev) => prev +1)
                
            addCustomerFunction(dispatch,payload)

            setName("")
            setBudget("")
            setAddress("")
            setPhone("")
            setProjectType("")
            navigate(-1)
            }
            catch(err){
                console.log(err.message)
            }
        }

        return (
            <div className="card h-100 p-0 radius-12">
                <div className="card-body p-24">
                    <div className="row justify-content-center">
                        <div className="col-xxl-6 col-xl-8 col-lg-10">
                            <div className="card border">
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
                                                required
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="Enter Full Name"
                                            />
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
                                                onChange={(e) => setPhone(e.target.value)}
                                                type="tel"
                                                required
                                                className="form-control radius-8"
                                                id="number"
                                                placeholder="Enter phone number"
                                            />
                                        </div>
                                        <div className="mb-20">
                                            <label
                                                htmlFor="depart"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Project Type
                                                <span className="text-danger-600">*</span>{" "}
                                            </label>
                                            <select
    className="form-control radius-8 form-select"
    id="depart"
    value={projectType || "Select the project type"} 
    onChange={(e)=>setProjectType(e.target.value)}
    required
>
    <option value="Select the project type" disabled>Select the project type</option>
    <option value="Residential">Residential</option>
    <option value="Commercial">Commercial</option>
</select>
                                        </div>

                                        <div className="mb-20">
                                            <label
                                                htmlFor="name"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Budget
                                            </label>
                                            <input
                                            value={budget}
                                            onChange={(e)=>setBudget(e.target.value)}
                                                type="text"
                                                className="form-control radius-8"
                                                id="budget"
                                                placeholder="Enter the Budget"
                                            />
                                        </div>

                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <button
                                            type='button'
                                                onClick={()=>handleCancel()}
                                                className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8"
                                            >
                                                Cancel
                                            </button>
                                            

                                <HasPermission permission={"edit-customer"}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                                >
                                                Save
                                            </button>
                                            </HasPermission>
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