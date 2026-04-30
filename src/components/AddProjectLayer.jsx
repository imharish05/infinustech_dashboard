import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useId, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {useDispatch, useSelector} from "react-redux"
import { addNewProject } from '../features/projects/projectService';
import Swal from 'sweetalert2';
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
        const [errors,setErrors] = useState({})
        // Add this near your other useState hooks
        const [customProjectTypes, setCustomProjectTypes] = useState(["Residential", "Commercial","Industrial"]);


const handleAddNewType = async () => {
    const { value: newType } = await Swal.fire({
        title: '<span style="font-size: 25px">Add New stage</span>',
        input: 'text',
        inputLabel: 'Type Name',
        inputPlaceholder: 'e.g. Industrial, Renovation...',
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value) return 'You need to write something!';
            if (customProjectTypes.includes(value)) return 'This type already exists!';
        }
    });

    if (newType) {
        setCustomProjectTypes(prev => [...prev, newType]);
        setProjectType(newType); // Automatically select the newly created type
    }
};
        
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
const [selectedStaffRole, setSelectedStaffRole] = useState("");

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



const validate = () => {
    const newErrors = {};

    // 1. Project Name check
    if (!projectName.trim()) {
        newErrors.projectName = "Project Name is Required";
    }
    
    // 2. Customer Check (Ensures ID is present from selection)
    if (!customerId) {
        newErrors.customerName = "Please select a customer from the list";
    }

    // 3. Staff Check
    if (!selectedStaffId) {
        newErrors.selectStaff = "Please select a staff / designer";
    }
    
    // 4. Project Type Check
    if (!projectType || projectType === "Select Type" || projectType === "Select the project type") {
        newErrors.projectType = "Please select the project type";
    }

    // 5. Location Check
    if (!location || !location.trim()) {
        newErrors.location = "Please enter the location";
    }

    // 6. Fees (Cost) Check
    if (!cost) {
        newErrors.fees = "Please enter the fees";
    } else if (isNaN(cost) || Number(cost) <= 0) {
        newErrors.fees = "Please enter a valid amount greater than 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

            const ErrorMsg = ({ field }) => (
        errors[field] ? (
            <div className="text-danger mt-4 fw-medium" style={{ fontSize: '11px' }}>
                {errors[field]}
            </div>
        ) : null
    );

 const handleProject = async (e) => {
    e.preventDefault();


    if (!validate()) return;

    try {
        const payload = {
            projectName,
            location,
            customerName,
            customerId,
            assignedStaffName: selectedStaffName, 
            assignedStaffId: selectedStaffId,
            cost,
            projectType,
            status: "Initialized"
        };


        // 1. Change addNewProject to return the project data instead of just 'true'
        const newProject = await addNewProject(dispatch, payload,navigate);

        if (newProject) {
            // Clear states
            setProjectName("");
            setCost("");
            setLocation("");
            setCustomerName("");
            setProjectType("");
            setCustomerId("");
            navigate("/projects-list");
        }
    } catch (err) {
        console.log("Component Error:", err.message);
    }
};

        return (
            <div className="card h-100 p-0 radius-12" style = {{backgroundColor: "transparent",            // Corrected from "none"
    backdropFilter: "none",                   // Set to none for pure transparency
}}>
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

    <ErrorMsg field={"customerName"}/>

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
                <>
                    <li className="p-10 text-center text-gray-400">No customers found</li>
                    <li 
    className="p-10 text-center text-primary-400 cursor-pointer"
    onMouseDown={(e) => {
        e.preventDefault(); // Prevents onBlur from firing
        navigate("/add-customer");
    }}
>
    + Add New Customer
</li>
                </>
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
                                                
                                                value={projectName}
                                                onChange={(e) => setProjectName(e.target.value)}
                                                placeholder="Enter Project Name"
                                                disabled = {customerName.length == "0" ? true : false}
                                            />
                                              <ErrorMsg field={"projectName"}/>
                                        </div>

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
            onBlur={() => setTimeout(() => setIsStaffDropdownOpen(false), 200)}
            onChange={(e) => {
                setStaffSearchTerm(e.target.value);
                setIsStaffDropdownOpen(true);
            }}
            disabled={customerName.length === 0}
        />
    </div>
    <ErrorMsg field={"selectStaff"}></ErrorMsg>

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
                            // 1. Store only the data your backend needs
                            setSelectedStaffId(staff.id || staff._id);
                            setSelectedStaffName(staff.name);
                            
                            // 2. Display Name + Role in the input for user clarity
                            setStaffSearchTerm(`${staff.name}`);
                            
                            setIsStaffDropdownOpen(false);
                        }}
                    >
                        {/* 3. Show the role in the list so users pick the right person */}
                        <div >
                            <div className="d-flex justify-content-between align-items-center">
                            <span className="fw-medium text-primary-light">{staff.name}</span>
                            <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>
                                {staff.role}
                            </span>
                             </div>

                            <small>{staff?.location || staff?.address}</small>
                        </div>
                    </li>
                ))
            ) : (
                <>
                <li className="p-10 text-center text-gray-400">No staff found</li>
                                    <li 
    className="p-10 text-center text-primary-400 cursor-pointer"
    onMouseDown={(e) => {
        e.preventDefault(); // Prevents onBlur from firing
        navigate("/add-staff");
    }}
>
    + Add Staff
</li>
    </>
            )}
        </ul>
    )}
</div>
{/* For Project Type */}
<div className="mb-20">
    <div className="d-flex align-items-center justify-content-between mb-8">
        <label htmlFor="depart" className="form-label fw-semibold text-primary-light text-sm mb-0">
            Project Type <span className="text-danger-600">*</span>
        </label>
        
        {/* PLUS ICON BUTTON */}
        <button 
            type="button"
            onClick={handleAddNewType}
            className="btn btn-sm btn-outline-primary-600 radius-4 p-0 d-flex align-items-center justify-content-center"
            style={{ width: '24px', height: '24px' }}
            title="Add custom type"
            disabled={customerName.length === 0}
        >
            <Icon icon="ic:baseline-plus" width="16" height="16" />
        </button>
    </div>

    <select
        disabled={customerName.length === 0}
        className="form-control radius-8 form-select"
        id="depart"
        value={projectType || "Select the project type"}
        onChange={(e) => setProjectType(e.target.value)}
        
    >
        <option value="Select the project type" disabled>Select the project type</option>
        {customProjectTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
        ))}
    </select>
    <ErrorMsg field={"projectType"} />
</div>



                                        {/* For staff */}


                        {/* For location  */}
                        
                                        <div className="mb-20">
                                            <label
                                                htmlFor="location"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Location<span className="text-danger-600">*</span>
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

                                             <ErrorMsg field={"location"}/>
                                        </div>


{/* For cost */}
                                        <div className="mb-20">
                                            <label
                                                htmlFor="cost"
                                                className="form-label fw-semibold text-primary-light text-sm mb-8"
                                            >
                                                Fees<span className="text-danger-600">*</span>
                                            </label>
                                            <input
                                            value={cost}
                                            onChange={(e)=>setCost(e.target.value)}
                                                type="text"
                                                className="form-control radius-8"
                                                id="cost"
                                                placeholder="Enter the Fees"
                                                disabled = {customerName.length == "0" ? true : false}
                                            />


                                            <ErrorMsg field={"fees"}/>
                                        </div>


                                        <div className="d-flex align-items-center justify-content-center gap-3">
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            >
                                                Save Project
                                            </button>
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

    export default AddProjectLayer;