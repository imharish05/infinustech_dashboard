import { Icon } from '@iconify/react';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { toggleAssignmentFunction, updateStaffFunction } from '../features/staff/staffService';

const EditStaffLayer = () => {
    const { id } = useParams(); // This is our staffId
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Redux Data
    const staffList = useSelector((state) => state.staffs.staffs);
    const projectList = useSelector((state) => state.projects.projects) || [];

    const staffMember = useMemo(() => 
        staffList.find((s) => String(s.id) === String(id)), 
    [staffList, id]);

    // Form State
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState(""); 
    const [email, setEmail] = useState(""); 
    const [password, setPassword] = useState("");
    const[role,setRole] = useState("")
    const [selectedProjectIds, setSelectedProjectIds] = useState([]); 
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Add these to your Form State section
const [status, setStatus] = useState("Active"); // Added status state
const [errors, setErrors] = useState({}); // To store individual field errors

useEffect(() => {
    if (staffMember) {
        setName(staffMember.name || "");
        setPhone(staffMember.phone || "");
        setLocation(staffMember.location || "");
        setEmail(staffMember.email || ""); // Set email
        setPassword(staffMember.password || ""); // Set password
        setRole(staffMember.role || ""); // Set role
        setStatus(staffMember.status || "Active");
        setSelectedProjectIds(staffMember.projects || []);
    }
}, [staffMember]);

const validate = () => {
    let newErrors = {};
    if (!name.trim()) newErrors.name = "Full name is required";
    if (!email.trim()) {
        newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
        newErrors.email = "Invalid email format";
    }
    if (!password) {
        newErrors.password = "Password is required";
    } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
    }
    if (!role) newErrors.role = "Please select a user role";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

// Helper component for displaying errors
const ErrorMsg = ({ field }) => (
    errors[field] ? (
        <div className="text-danger mt-4 fw-medium" style={{ fontSize: '11px' }}>
            {errors[field]}
        </div>
    ) : null
);



    const filteredProjects = projectList.filter(proj => 
        proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !selectedProjectIds.includes(proj.id)
    );



const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
        id, // from useParams
        name,
        phone,
        location,
        email,
        password,role,
        projects: selectedProjectIds 
    };


    // 1. Identify which projects were added or removed
    const originalProjects = staffMember?.projects || [];

    // Added: In selectedProjectIds but not in original
    const addedProjects = selectedProjectIds.filter(pid => !originalProjects.includes(pid));
    
    // Removed: In original but not in selectedProjectIds
    const removedProjects = originalProjects.filter(pid => !selectedProjectIds.includes(pid));

    console.log(addedProjects,removedProjects);
    
    // 2. Update the Staff Record
    const success = await updateStaffFunction(dispatch, id, payload);
    
    console.log(success);
    

    if (success) {
    // This will now update BOTH the staff member AND the projects themselves
    for (const projectId of addedProjects) {
        await toggleAssignmentFunction(dispatch, id, projectId, name, true);
    }

    for (const projectId of removedProjects) {
        await toggleAssignmentFunction(dispatch, id, projectId, null, false);
    }
    navigate(-1);
}

};

    return (
        <div className="card h-100 p-0 radius-12">
            <div className="card-body p-24">
                <div className="row justify-content-center">
                    <div className="col-xxl-6 col-xl-8 col-lg-10">
                        <div className="card border">
                            <div className="card-body">
                                <h6 className="text-lg text-center text-primary-light mb-16">Edit Staff Member</h6>
                                <form onSubmit={handleSubmit} noValidate>
    
    {/* Full Name */}
    <div className="mb-20">
        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Full Name *</label>
        <input 
            type="text" 
            className={`form-control radius-8 ${errors.name ? 'border-danger' : ''}`} 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
        />
        <ErrorMsg field="name" />
    </div>

    {/* Email Field */}
    <div className="mb-20">
        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Email Address *</label>
        <input 
            type="email" 
            className={`form-control radius-8 ${errors.email ? 'border-danger' : ''}`} 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="name@company.com" 
        />
        <ErrorMsg field="email" />
    </div>

                                   {/* Password Field */}
   <div className="mb-20">
       <label className="form-label fw-semibold text-primary-light text-sm mb-8">Password *</label>
       <div className="position-relative">
           <input 
               type={showPassword ? "text" : "password"} // Dynamic type
               className={`form-control radius-8 ${errors.password ? 'border-danger' : ''}`} 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               placeholder="Minimum 6 characters" 
           />
           
           {/* Toggle Button */}
           <button
               type="button"
               className="position-absolute end-0 top-50 translate-middle-y me-12 border-0 bg-transparent p-0 pt-4 d-flex align-items-center justify-content-center"
               onClick={() => setShowPassword(!showPassword)}
               style={{ cursor: 'pointer', zIndex: 10 }}
           >
               <Icon 
                   icon={showPassword ? "lucide:eye-off" : "lucide:eye"} 
                   className="text-primary-light text-xl" 
               />
           </button>
       </div>
       <ErrorMsg field="password" />
   </div>
    {/* Role Dropdown */}
    <div className="mb-20">
        <label className="form-label fw-semibold text-primary-light text-sm mb-8">User Role *</label>
        <div className="position-relative">
            <select 
                className={`form-control radius-8 form-select appearance-none ${errors.role ? 'border-danger' : ''}`} 
                value={role} 
                onChange={(e) => {
                    setRole(e.target.value);
                    if(errors.role) setErrors(prev => ({...prev, role: null}));
                }}
            >
                <option value="" disabled>Select a role</option> 
                <option value="Staff">Staff</option>
                <option value="Designer">Designer</option>
            </select>
            <div className="position-absolute end-0 top-50 translate-middle-y me-12 pt-8 pointer-events-none">
                <Icon 
                    icon={role === "Designer" ? "lucide:palette" : "lucide:users"} 
                    className={`${errors.role ? 'text-danger' : 'text-primary-light'} text-lg`} 
                />
            </div>
        </div>
        <ErrorMsg field="role" />
    </div>

    <div className="row">
        {/* Phone Field */}
        <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Phone Number</label>
            <input type="text" className="form-control radius-8" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        {/* Location Field */}
        <div className="col-md-6 mb-20">
            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Location</label>
            <input type="text" className="form-control radius-8" value={location} onChange={(e) => setLocation(e.target.value)} />
        </div>
    </div>

    {/* ... (Keep Project Selection logic same as before) ... */}

    <div className="d-flex align-items-center justify-content-center gap-3 mt-32">
        <button type='button' onClick={() => navigate(-1)} className="btn border-danger text-danger px-40">Cancel</button>
        <button type="submit" className="btn btn-primary px-40" style={{ backgroundColor: '#EA8B0C', border: 'none' }}>Save Details</button>
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

export default EditStaffLayer;