import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux"
import { addNewProject } from '../features/projects/projectService';
import { toggleAssignmentFunction } from '../features/staff/staffService';

const AddProjectLayer = () => {
    
    // Hooks
    const dispatch = useDispatch()
    const navigate = useNavigate()

        
        const [projectName,setProjectName] = useState("")
        const [customerId,setCustomerId] = useState("")
        const [location,setLocation] = useState("")
        const [customerName,setCustomerName] = useState("")
        const [projectType,setProjectType] = useState("")
        const [cost,setCost] = useState("")
        
        const handleCancel = () => {
            setProjectName("")
            setCustomerId("")
            setCost("")
            setLocation("")
            setCustomerName("")
            setProjectType("")
            navigate(-1)
        }
        

        const customersList = useSelector((state) => state.customers.customers)

        const staffList = useSelector((state) => state.staffs.staffs)


// Inside your AddProjectLayer component:
const [searchTerm, setSearchTerm] = useState("");
const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const [staffSearchTerm, setStaffSearchTerm] = useState("");
const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
const [selectedStaffId, setSelectedStaffId] = useState("");
const [selectedStaffName, setSelectedStaffName] = useState("");

// Filter list based on search term for dropdown
const filteredCustomers = customersList.filter(customer => {
    const name = customer?.name || ""; 
    const location = customer?.location || "";

    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           location.toLowerCase().includes(searchTerm.toLowerCase());
});

const filteredStaff = (staffList || []).filter(staff => {
    const name = staff?.name || "";
    const role = staff?.role || ""; // Or any other field like designation
    return name.toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
           role.toLowerCase().includes(staffSearchTerm.toLowerCase());
});

        const handleProject= async(e) =>{
            e.preventDefault()
            
            try{

                const payload = {
                    id : crypto.randomUUID(),projectName,location,customerName,customerId,staffName : selectedStaffName,staffId : selectedStaffId,cost,projectType,status : "Initialized"
                }
                
            const success = await addNewProject(dispatch,payload)
if (success) {
           await toggleAssignmentFunction(
                dispatch, 
                selectedStaffId, 
                payload.id, 
                selectedStaffName, 
                true
            );
        }

            setProjectName("")
            setCost("")
            setLocation("")
            setCustomerName("")
            setProjectType("")
            setCustomerId("")
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
                                    <h6 className="text-lg text-center text-primary-light mb-16">Add New Project</h6>
                                    <form action="#" onSubmit={(e)=>handleProject(e)}>

                        {/* For Customer */}
 {/* SEARCHABLE CUSTOMER DROPDOWN */}
<div className="mb-20 position-relative">
    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
        Select Customer <span className="text-danger-600">*</span>
    </label>
    
    <div className="input-group">
        <input
            type="text"
            className="form-control radius-8"
            placeholder="Type name or location..."
            value={searchTerm}
            onFocus={() => setIsDropdownOpen(true)}
            onBlur={() => setIsDropdownOpen(false)}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsDropdownOpen(true);
            }}
        />
    </div>

    {isDropdownOpen && (
        <ul className="position-absolute w-100 mt-1 bg-white radius-8 shadow-lg z-3 overflow-auto" 
            style={{ maxHeight: '200px', listStyle: 'none', padding: 0,border : "1px solid black" }}>
            {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                    <li 
                        key={customer.id}
                        className="p-10 border-bottom cursor-pointer hover-bg-primary-50"
                        onMouseDown={(e) => {
        e.preventDefault(); 
        setCustomerId(customer.id)
        setCustomerName(customer.name);
        setSearchTerm(customer.name);
        setIsDropdownOpen(false);
    }}
                    >
                        <div className="fw-medium text-primary-light">{customer.name}</div>
                        <small className="text-gray-500">{customer.address}</small>
                    </li>
                ))
            ) : (
                <li className="p-10 text-center text-gray-400">No customers found</li>
            )}
        </ul>
    )}
</div>


                                        {/* For Project Name */}
                                        <div className="mb-20">
                                            <label
                                                htmlFor="projectName"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Project Name <span className="text-danger-600">*</span>
                                            </label>
                                            
                                            <input
                                                type="text"
                                                className="form-control radius-8"
                                                id="projectName"
                                                required
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                placeholder="Enter Project Name"
                                                disabled = {customerName.length == "0" ? true : false}
                                            />
                                        </div>

                                        {/* For staff */}

                                        {/* SEARCHABLE STAFF DROPDOWN */}
<div className="mb-20 position-relative">
    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
        Assign Staff / Designer <span className="text-danger-600">*</span>
    </label>
    
    <div className="input-group">
        <input
            type="text"
            className="form-control radius-8"
            placeholder="Search staff by name or role..."
            value={staffSearchTerm}
            onFocus={() => setIsStaffDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsStaffDropdownOpen(false), 200)} // Small delay to allow click
            onChange={(e) => {
                setStaffSearchTerm(e.target.value);
                setIsStaffDropdownOpen(true);
            }}
            disabled={customerName.length === 0}
        />
    </div>

    {isStaffDropdownOpen && (
        <ul className="position-absolute w-100 mt-1 bg-white radius-8 shadow-lg z-3 overflow-auto" 
            style={{ maxHeight: '200px', listStyle: 'none', padding: 0, border: "1px solid #e5e7eb" }}>
            {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                    <li 
                        key={staff.id || staff._id}
                        className="p-10 border-bottom cursor-pointer hover-bg-primary-50"
                        onMouseDown={(e) => {
                            e.preventDefault(); 
                            setSelectedStaffId(staff.id);
                            setSelectedStaffName(staff.name);
                            setStaffSearchTerm(staff.name);
                            setIsStaffDropdownOpen(false);
                        }}
                    >
                        <div className="fw-medium text-primary-light">{staff.name}</div>
                        <small className="text-gray-500">{staff?.address || staff?.location}</small>
                    </li>
                ))
            ) : (
                <li className="p-10 text-center text-gray-400">No staff found</li>
            )}
        </ul>
    )}
</div>


                        {/* For location  */}
                                        <div className="mb-20">
                                            <label
                                                htmlFor="location"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Location
                                            </label>
                                            <input
                                                type="text"
                                                value={location}
                                                onChange={(e) => setLocation(e.target.value)}
                                                className="form-control radius-8"
                                                id="location"
                                                placeholder="Enter location"
                                                disabled = {customerName.length == "0" ? true : false}
                                            />
                                        </div>

                                        {/* For Project Type */}
                                        <div className="mb-20">
                                            <label
                                                htmlFor="depart"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Project Type
                                                <span className="text-danger-600">*</span>{" "}
                                            </label>
                                            <select
                                            disabled = {customerName.length == "0" ? true : false}                               
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



{/* For cost */}
                                        <div className="mb-20">
                                            <label
                                                htmlFor="cost"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Cost
                                            </label>
                                            <input
                                            value={cost}
                                            onChange={(e)=>setCost(e.target.value)}
                                                type="text"
                                                className="form-control radius-8"
                                                id="cost"
                                                placeholder="Enter the Cost"
                                                disabled = {customerName.length == "0" ? true : false}
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
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            >
                                                Save
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

    export default AddProjectLayer;