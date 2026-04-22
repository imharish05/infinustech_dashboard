import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { updateProjectFunction } from '../features/projects/projectService';
import Swal from 'sweetalert2'; // Added Swal import

const EditProjectLayer = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Project State
    const [projectName, setProjectName] = useState("");
    const [customerId, setCustomerId] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [location, setLocation] = useState("");
    const [projectType, setProjectType] = useState("");
    const [cost, setCost] = useState("");
    const [status, setStatus] = useState("");
    
    // Project Types State (Synced with AddProjectLayer logic)
    const [customProjectTypes, setCustomProjectTypes] = useState(["Residential", "Commercial", "Industrial"]);

    // Search/Dropdown States
    const [searchTerm, setSearchTerm] = useState("");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [staffSearchTerm, setStaffSearchTerm] = useState("");
    const [isStaffDropdownOpen, setIsStaffDropdownOpen] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState("");
    const [selectedStaffName, setSelectedStaffName] = useState("");

    // Selectors
    const projectList = useSelector((state) => state.projects.projects);
    const customersList = useSelector((state) => state.customers.customers) || [];
    const staffList = useSelector((state) => state.staffs.staffs) || [];

    const project = useMemo(() => projectList.find((p) => p.id === id), [projectList, id]);

    // Populate fields when project is found
    useEffect(() => {
        if (project) {
            setProjectName(project.projectName || "");
            setCustomerId(project.customerId || "");
            setCustomerName(project.customerName || "");
            setSearchTerm(project.customerName || "");
            setLocation(project.location || "");
            setProjectType(project.projectType || "");
            setCost(project.cost || "");
            setStatus(project.status || "Initialized");
            setSelectedStaffId(project.assignedStaffId || "");
            setSelectedStaffName(project.assignedStaffName || "");
            setStaffSearchTerm(project.assignedStaffName || "");

            // If the current project type isn't in our default list, add it to custom types
            if (project.projectType && !customProjectTypes.includes(project.projectType)) {
                setCustomProjectTypes(prev => [...prev, project.projectType]);
            }
        }
    }, [project]);

    // New Type Handler
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
            setProjectType(newType); 
        }
    };

    // Filtering Logic
    const filteredCustomers = useMemo(() => {
        return customersList.filter(c => 
            (c.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (c.location || "").toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [customersList, searchTerm]);

    const filteredStaff = useMemo(() => {
        return staffList.filter(s => 
            (s.name || "").toLowerCase().includes(staffSearchTerm.toLowerCase()) ||
            (s.role || s.designation || "").toLowerCase().includes(staffSearchTerm.toLowerCase())
        );
    }, [staffList, staffSearchTerm]);

    const handleProjectUpdate = async (e) => {
        e.preventDefault();
        const payload = {
            id,
            projectName,
            location,
            customerName,
            customerId,
            assignedStaffId: selectedStaffId || null,
            assignedStaffName: selectedStaffName || null,
            cost,
            projectType,
            status
        };

        const success = await updateProjectFunction(dispatch, id, payload);
        if (success) {
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
                                <h6 className="text-lg text-center text-primary-light mb-16">Edit Project</h6>
                                <form onSubmit={handleProjectUpdate}>

                                    {/* CUSTOMER SEARCH */}
                                    <div className="mb-20 position-relative">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Select Customer *</label>
                                        <input
                                            type="text"
                                            className="form-control radius-8"
                                            value={searchTerm}
                                            onFocus={() => setIsDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {isDropdownOpen && (
                                            <ul className="position-absolute w-100 mt-1 bg-white radius-8 shadow-lg z-3 overflow-auto" style={{ maxHeight: '200px', border: "1px solid #ddd", listStyle: 'none', padding: 0 }}>
                                                {filteredCustomers.map(customer => (
                                                    <li key={customer.id} className="p-10 border-bottom cursor-pointer hover-bg-primary-50"
                                                        onMouseDown={() => {
                                                            setCustomerId(customer.id);
                                                            setCustomerName(customer.name);
                                                            setSearchTerm(customer.name);
                                                        }}>
                                                        <div className="fw-medium">{customer.name}</div>
                                                        <small>{customer.address}</small>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    {/* STAFF SEARCH */}
                                    <div className="mb-20 position-relative">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Assign Staff *</label>
                                        <input
                                            type="text"
                                            className="form-control radius-8"
                                            value={staffSearchTerm}
                                            onFocus={() => setIsStaffDropdownOpen(true)}
                                            onBlur={() => setTimeout(() => setIsStaffDropdownOpen(false), 200)}
                                            onChange={(e) => setStaffSearchTerm(e.target.value)}
                                        />
                                        {isStaffDropdownOpen && (
                                            <ul className="position-absolute w-100 mt-1 bg-white radius-8 shadow-lg z-3 overflow-auto" style={{ maxHeight: '200px', border: "1px solid #ddd", listStyle: 'none', padding: 0 }}>
                                                {filteredStaff.map(staff => (
                                                    <li key={staff.id || staff._id} className="p-10 border-bottom cursor-pointer hover-bg-primary-50"
                                                        onMouseDown={() => {
                                                            setSelectedStaffId(staff.id || staff._id);
                                                            setSelectedStaffName(staff.name);
                                                            setStaffSearchTerm(staff.name);
                                                        }}>
                                                        <div className="fw-medium">{staff.name}</div>
                                                        <small>{staff?.location || staff?.address}</small>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>

                                    <div className="mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Project Name *</label>
                                        <input type="text" className="form-control radius-8" required value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                                    </div>

                                    <div className="mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Location</label>
                                        <input type="text" className="form-control radius-8" value={location} onChange={(e) => setLocation(e.target.value)} />
                                    </div>

                                    <div className="row mb-20">
                                        <div className="col-sm-6">
                                            {/* UPDATED PROJECT TYPE WITH PLUS BUTTON */}
                                            <div className="d-flex align-items-center justify-content-between mb-8">
                                                <label className="form-label fw-semibold text-primary-light text-sm mb-0">Type *</label>
                                                <button 
                                                    type="button"
                                                    onClick={handleAddNewType}
                                                    className="btn btn-sm btn-outline-primary-600 radius-4 p-0 d-flex align-items-center justify-content-center"
                                                    style={{ width: '24px', height: '24px' }}
                                                >
                                                    <Icon icon="ic:baseline-plus" width="16" height="16" />
                                                </button>
                                            </div>
                                            <select className="form-control radius-8 form-select" value={projectType} onChange={(e) => setProjectType(e.target.value)} required>
                                                <option value="" disabled>Select Type</option>
                                                {customProjectTypes.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label fw-semibold text-primary-light text-sm mb-8">Status *</label>
                                            <select className="form-control radius-8 form-select" value={status} onChange={(e) => setStatus(e.target.value)} required>
                                                <option value="Initialized">Initialized</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                                <option value="On Hold">On Hold</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="mb-20">
                                        <label className="form-label fw-semibold text-primary-light text-sm mb-8">Fees</label>
                                        <input type="text" className="form-control radius-8" value={cost} onChange={(e) => setCost(e.target.value)} />
                                    </div>

                                    <div className="d-flex align-items-center justify-content-center gap-3">
                                        <button type='button' onClick={() => navigate(-1)} className="border border-danger-600 bg-hover-danger-200 text-danger-600 text-md px-56 py-11 radius-8">Cancel</button>
                                        <button type="submit" className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8">Save Changes</button>
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

export default EditProjectLayer;