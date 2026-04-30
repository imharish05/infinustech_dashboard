import { Icon } from '@iconify/react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { addStaffFunction } from '../features/staff/staffService';

const AddStaffLayer = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const projectList = useSelector((state) => state.projects.projects) || [];

    // Form State
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [status, setStatus] = useState("Active");
    const [role, setRole] = useState(""); // Default to Staff
    const [showPassword, setShowPassword] = useState(false);

    // UI State
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [errors, setErrors] = useState({}); // Stores validation messages

const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Only allow digits and max 10 characters
    if (/^\d*$/.test(value) && value.length <= 10) {
        setPhone(value);
        
        // Optional: Clear error as they type once they hit 10
        if (value.length === 10) {
            setErrors(prev => {
                const { phone: _, ...rest } = prev;
                return rest;
            });
        }
    }
};

    const handleCancel = () => navigate(-1);




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

if (!phone.trim()) {
        newErrors.phone = "Phone number is required";
    } else if (phone.length !== 10) {
        newErrors.phone = "Phone number must be 10 digits";
    }
    // Add Role validation
    if (!role) newErrors.role = "Please select a user role"; 
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

    const handleAddStaff = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const payload = {
                name,
                email,
                password,
                phone,
                role,
                location,
                status,
            };

            addStaffFunction(dispatch, payload);
            navigate("/staff-list");
        } catch (err) {
            console.error("Error adding staff:", err.message);
        }
    };

    // Helper to render error message
    const ErrorMsg = ({ field }) => (
        errors[field] ? (
            <div className="text-danger mt-4 fw-medium" style={{ fontSize: '11px' }}>
                {errors[field]}
            </div>
        ) : null
    );

    return (
        <div className="card h-100 p-0 radius-12" style = {{backgroundColor: "transparent",            // Corrected from "none"
    backdropFilter: "none",                   // Set to none for pure transparency
}}>
            <div className="card-body p-24">
                <div className="row justify-content-center">
                    <div className="col-xxl-6 col-xl-8 col-lg-10">
                        <div className="card border">
                            <div className="card-body">
                                <h6 className="text-lg text-center text-primary-light mb-16">Add New Staff Member</h6>
                                <form onSubmit={handleAddStaff} noValidate>
                                    
                                    {/* Name Field */}
                                    <div className="mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Full Name <span className="text-danger-600">*</span></label>
                                        <input type="text" className={`form-control radius-8 ${errors.name ? 'border-danger' : ''}`} value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Full Name" />
                                        <ErrorMsg field="name" />
                                    </div>

                                    {/* Email Field */}
                                    <div className="mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Email Address <span className="text-danger-600">*</span></label>
                                        <input type="email" className={`form-control radius-8 ${errors.email ? 'border-danger' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" />
                                        <ErrorMsg field="email" />
                                    </div>

                            
                                   {/* Password Field */}
<div className="mb-20">
    <label className="form-label fw-semibold text-primary-light text-sm mb-8">Password <span className="text-danger-600">*</span></label>
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
            <Icon tabIndex = "0"
                icon={showPassword ? "lucide:eye-off" : "lucide:eye"} 
                className="text-primary-light text-xl" 
            />
        </button>
    </div>
    <ErrorMsg field="password" />
</div>

                                    <div className="row">
                                        {/* Phone Field */}
                                        <div className="col-md-6 mb-20">
                                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Phone Number <span className="text-danger-600">*</span></label>
                                            <input type="tel" className={`form-control radius-8 ${errors.phone ? 'border-danger' : ''}`} value={phone} onChange={(e) => handlePhoneChange(e)} placeholder="Phone number" />
                                            <ErrorMsg field="phone" />
                                        </div>
                                        {/* Location Field */}
                                        <div className="col-md-6 mb-20">
                                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Location</label>
                                            <input type="text" className="form-control radius-8" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Site Office" />
                                        </div>
                                    </div>

                                    {/* Role Selection */}
<div className="mb-20">
    <label className="form-label fw-semibold text-primary-light text-sm mb-8">
        User Role <span className="text-danger-600">*</span>
    </label>
    <div className="position-relative">
        <select 
            className={`form-control radius-8 form-select appearance-none ${errors.role ? 'border-danger' : ''}`} 
            value={role} 
            onChange={(e) => {
                setRole(e.target.value);
                // Clear error immediately when a valid option is selected
                if (errors.role) {
                    setErrors(prev => {
                        const { role: _, ...rest } = prev;
                        return rest;
                    });
                }
            }}
        >
            <option value="" disabled>Select a role</option> 
            <option value="staff">Staff</option>
            <option value="designer">Designer</option>
        </select>
        
        <div className="position-absolute end-0 top-50 translate-middle-y me-12 pt-8 pointer-events-none">
    {/* Only render the Icon if role has a value */}
    {role && (
        <Icon 
            icon={role === "designer" ? "lucide:palette" : "lucide:users"} 
            className={`${errors.role ? 'text-danger' : 'text-primary-light'} text-lg`} 
        />
    )}
</div>

    </div>
    
    {/* Error Message */}
    <ErrorMsg field="role" />

    {/* Helper text - hidden if there is an active error */}
{!errors.role && role && (
    <div className="text-secondary-light mt-4" style={{ fontSize: '11px' }}>
        {/* Match lowercase values here too */}
        {role === "designer" 
            ? "Designers can manage blueprints and technical specifications." 
            : "Staff can be assigned to site projects and track progress."}
    </div>
)}
</div>

                                    
                                    <div className="d-flex align-items-center justify-content-center gap-3 mt-32">
                                        <button type="submit" className="btn btn-primary text-md px-56 py-12 radius-8 btn-primary">Save Staff</button>
                                        <button type='button' onClick={handleCancel} className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8">Cancel</button>
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

export default AddStaffLayer;