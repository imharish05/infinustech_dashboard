import { Icon } from '@iconify/react/dist/iconify.js';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from "react-redux";
import { updateCustomerFunction } from '../features/customers/customerService';
import HasPermission from './HasPermission';

const EditUserLayer = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Form States
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [status, setStatus] = useState("");
    const [errors, setErrors] = useState({});

    // Fetch customer data from Redux store
    const customerList = useSelector((state) => state.customers.customers) || [];
    const customer = useMemo(() => 
        customerList.find((c) => c.id == id || c._id == id)
    , [customerList, id]);

    // Populate form when customer data is found
    useEffect(() => {
        if (customer) {
            setName(customer.name || "");
            setAddress(customer.address || "");
            setPhone(customer.phone || "");
            setStatus(customer.status || "active");
        }
    }, [customer]);

    const handleCancel = () => {
        navigate(-1);
    };

    const handlePhoneChange = (e) => {
        const value = e.target.value;
        if (/^\d*$/.test(value) && value.length <= 10) {
            setPhone(value);
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!name.trim()) {
            newErrors.name = "Name is required";
        }
        if (!phone.trim()) {
            newErrors.phone = "Phone number is required";
        } else if (phone.length < 10) {
            newErrors.phone = "Phone number must be 10 digits";
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const ErrorMsg = ({ field }) => {
        return errors[field] ? (
            <div className="text-danger mt-4 fw-medium" style={{ fontSize: "11px" }}>
                {errors[field]}
            </div>
        ) : null;
    };

    const handleCustomerEdit = async (e) => {
        e.preventDefault();
        
        if (!validate()) return;

        try {
            const payload = {
                id, name, address, phone, status
            };
            
            const success = await updateCustomerFunction(dispatch, id, payload);
            if (success) {
                navigate(-1);
            }
        } catch (err) {
            console.log(err.message);
        }
    };

    // Style object to force transparency
    const transparentStyle = {
        backgroundColor: "transparent",
        border: "none",
        boxShadow: "none",
        backdropFilter: "none"
    };

    return (
        <div className="card h-100 p-0 radius-12" style={transparentStyle}>
            <div className="card-body p-24">
                <div className="row justify-content-center">
                    <div className="col-xxl-6 col-xl-8 col-lg-10">
                        {/* We add the style here as well to kill the inner white box */}
                        <div className="card">
                            <div className="card-body">
                                <h6 className="text-lg text-center text-primary-light mb-16 py-3">Edit Customer</h6>
                                <form onSubmit={handleCustomerEdit} noValidate>
                                    
                                    {/* Name Field */}
                                    <div className="mb-20">
                                        <label htmlFor="name" className="form-label fw-semibold text-primary-light text-sm mb-8">
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
                                        <ErrorMsg field={"name"} />
                                    </div>

                                    {/* Address Field */}
                                    <div className="mb-20">
                                        <label htmlFor="address" className="form-label fw-semibold text-primary-light text-sm mb-8">
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

                                    {/* Phone Field */}
                                    <div className="mb-20">
                                        <label htmlFor="number" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Phone <span className="text-danger-600">*</span>
                                        </label>
                                        <input
                                            value={phone}
                                            onChange={handlePhoneChange}
                                            type="tel"
                                            className="form-control radius-8"
                                            id="number"
                                            placeholder="Enter phone number"
                                        />
                                        <ErrorMsg field={"phone"} />
                                    </div>

                                    {/* Status Field */}
                                    <div className="mb-20">
                                        <label htmlFor="status" className="form-label fw-semibold text-primary-light text-sm mb-8">
                                            Status <span className="text-danger-600">*</span>
                                        </label>
                                        <select
                                            className="form-control radius-8 form-select"
                                            id="status"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="d-flex align-items-center justify-content-center gap-3">

                                        <HasPermission permission={"edit-customer"}>
                                            <button
                                                type="submit"
                                                className="btn btn-primary border border-primary-600 text-md px-56 py-12 radius-8"
                                            >
                                                Save Details
                                            </button>
                                        </HasPermission>
                                        <button
                                            type='button'
                                            onClick={handleCancel}
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

export default EditUserLayer;