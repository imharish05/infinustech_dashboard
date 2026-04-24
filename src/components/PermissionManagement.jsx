import React, { useEffect } from 'react';
import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
// Import your slice actions and service
import { toggleRolePermission, setAllPermissions } from '../features/permissions/permissionSlice';
import { savePermissionsFunction, fetchPermissionsFunction } from '../features/permissions/permissionService';

const PermissionManagement = () => {
    const dispatch = useDispatch();
    
    // 1. Get permissions from Redux instead of local state
    const rolePermissions = useSelector((state) => state.permissions.rolePermissions);
    const isLoading = useSelector((state) => state.permissions.loading);

    // 2. Roles and available permissions (keep these as constants)
    const roles = [
        { id: 'admin', name: 'Administrator', icon: 'lucide:shield-check', color: 'bg-danger-focus text-danger-main' },
        { id: 'designer', name: 'Designer', icon: 'lucide:pen-tool', color: 'bg-info-focus text-info-main' },
        { id: 'customer', name: 'Customer', icon: 'lucide:user', color: 'bg-success-focus text-success-main' },
        { id: 'staff', name: 'Operations Staff', icon: 'lucide:settings', color: 'bg-warning-focus text-warning-main' }
    ];

const availablePermissions = [
    { id: 'view-admin', label: 'View Admin Dashboard' },
    { id: 'view-dashboard', label: 'View Employee Dashboard' },
    { id: 'change-status', label: 'Change Status' },
    { id: 'view-staffs', label: 'View Staff' },
    { id: 'create-staff', label: 'Create Staff' },
    { id: 'edit-staff', label: 'Edit Staff' },
    { id: 'delete-staff', label: 'Delete Staff' },
    { id: 'view-customers', label: 'View Customers' },
    { id: 'create-customer', label: 'Create Customer' },
    { id: 'edit-customer', label: 'Edit Customer' },
    { id: 'delete-customer', label: 'Delete Customer' },
    { id: 'view-projects', label: 'View Projects' },
    { id: 'create-projects', label: 'Create Projects' },
    { id: 'edit-projects', label: 'Edit Projects' },
    { id: 'delete-projects', label: 'Delete Projects' },
    { id: 'view-stages', label: 'View Stages' },
    { id: 'upload-docs', label: 'Upload Documents' },
    { id: 'manage-permissions', label: 'Manage permissions' }, // Changed label from 'Manage Roles'
    { id: 'manage-remainders', label: 'Manage Reminders' }, // Changed label from 'Manage Roles'
    { id: 'view-reports', label: 'View Reports' },
    { id: 'manage-payment', label: 'Manage Payment' },
];
    // 3. Load initial data on mount
    useEffect(() => {
        fetchPermissionsFunction(dispatch);
    }, [dispatch]);

    // 4. Handle Toggles via Redux Dispatch
    const handleToggle = (roleId, permId) => {
        dispatch(toggleRolePermission({ roleId, permId }));
    };

    // 5. Handle Save (The awaited service call)
const handleSave = async () => {
    // Create a copy of permissions to ensure Admin is truly "Full Access"
    const updatedPermissions = {
        ...rolePermissions,
        admin: availablePermissions.map(p => p.id) // Force admin to have everything
    };
    
    const success = await savePermissionsFunction(updatedPermissions);
};

    return (
        <div className="container-fluid p-24">
            <div className="d-flex justify-content-between align-items-center mb-24">
                <div>
                    <h4 className="mb-4">Role Permissions</h4>
                    <p className="text-secondary-light">Configure what each user type can see and do.</p>
                </div>
                {/* Save Button with loading state check */}
                <button 
                    className="btn btn-primary-600 radius-8 px-24 d-flex align-items-center gap-2"
                    onClick={handleSave}
                    disabled={isLoading}
                >
                    {isLoading ? 'Saving...' : 'Save Permissions'}
                </button>
            </div>

            <div className="row g-4">
                {roles.map((role) => (
                    <div className="col-xxl-3 col-lg-4 col-sm-6" key={role.id}>
                        <div className="card h-100 radius-12 border">
                            <div className="card-header border-bottom bg-base py-16 px-20 d-flex align-items-center gap-3">
                                <div className={`p-10 radius-8 ${role.color}`}>
                                    <Icon icon={role.icon} width="20" />
                                </div>
                                <h6 className="mb-0 text-md">{role.name}</h6>
                            </div>
                            
                            <div className="card-body p-20">
                                <div className="d-flex flex-column gap-3">
                                    {availablePermissions.map((perm) => (
                                        <label 
                                            key={`${role.id}-${perm.id}`} 
                                            className="d-flex align-items-center justify-content-between p-12 radius-8 border bg-hover-neutral-50 cursor-pointer transition-all"
                                        >
                                            <div className="d-flex align-items-center gap-2">
                                                <span className="text-sm fw-medium text-secondary-light">{perm.label}</span>
                                            </div>
                                           <input
    type="checkbox"
    className="form-check-input border-2"
    style={{ width: '18px', height: '18px' }}
    // Ensure admin is always checked, otherwise check the Redux state
    checked={role.id === 'admin' ? true : (rolePermissions[role.id]?.includes(perm.id) || false)}
    // Prevent the toggle function from firing if the role is admin
    onChange={() => {
        if (role.id !== 'admin') {
            handleToggle(role.id, perm.id);
        }
    }}
    // Visually and functionally disable the checkbox for the admin role
    disabled={role.id === 'admin'}
/>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="card-footer bg-base-2 border-top p-12 text-center">
                                <span className="text-xs fw-bold text-secondary-light uppercase">
                                    {rolePermissions[role.id]?.length || 0} Permissions Active
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PermissionManagement;