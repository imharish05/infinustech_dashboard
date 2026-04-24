import { Icon } from '@iconify/react';
import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { fetchTotalCollectedAmount } from '../../features/stages/stageService';

const UnitCountOne = () => {
    const dispatch = useDispatch();

    // 1. Pull data from Redux
    const { user } = useSelector((state) => state.auth); // Logged in User (ID: 30)
    const { staffs = [] } = useSelector((state) => state.staffs); // List of staff members
    const { customers = [] } = useSelector((state) => state.customers);
    const { projects = [] } = useSelector((state) => state.projects);
    const { totalCollected: paidAmount } = useSelector((state) => state.stages);

    useEffect(() => {
        fetchTotalCollectedAmount(dispatch);
    }, [dispatch]);

    const isAdmin = user?.role === 'admin';

    // 2. FIND THE STAFF ID FOR THE LOGGED-IN USER
    // The project stores 'assignedStaffId' (e.g., 12), not the 'userId' (e.g., 30).
    const currentStaffMember = useMemo(() => {
        if (isAdmin) return null;
        return staffs.find(s => String(s.userId) === String(user?.id));
    }, [staffs, user, isAdmin]);

    const myStaffId = currentStaffMember?.id; // This would be 12 in your example

    // 3. FILTER PROJECTS
    const filteredProjects = useMemo(() => {
        if (isAdmin) return projects;
        if (!myStaffId) return []; // If staff record not found yet, return empty
        
        return projects.filter(project => 
            String(project.assignedStaffId) === String(myStaffId)
        );
    }, [projects, myStaffId, isAdmin]);

    // 4. FILTER CUSTOMERS
    const filteredCustomersCount = useMemo(() => {
        if (isAdmin) return customers.length;
        
        // Count unique customers from the projects assigned to me
        const customerIds = new Set(filteredProjects.map(p => String(p.customerId)));

        return customerIds.size;
    }, [customers, filteredProjects, isAdmin]);

    // 5. CALCULATE STATS
    const completedProjectsCount = useMemo(() => {
        return filteredProjects.filter(p => p.status === "Completed").length;
    }, [filteredProjects]);

    const totalAmount = useMemo(() => {
        return filteredProjects.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    }, [filteredProjects]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="row row-cols-xxxl-5 row-cols-lg-3 row-cols-sm-2 row-cols-1 gy-4">
            <StatCard 
                title={isAdmin ? "Total Customers" : "My Customers"} 
                value={filteredCustomersCount} 
                icon="gridicons:multiple-users" 
                colorClass="bg-cyan" 
                bgClass="bg-gradient-start-1" 
            />

            <StatCard 
                title={isAdmin ? "Total Projects" : "Assigned Projects"} 
                value={filteredProjects.length} 
                icon="fa-solid:award" 
                colorClass="bg-purple" 
                bgClass="bg-gradient-start-2" 
            />

            <StatCard 
                title="Completed Projects" 
                value={completedProjectsCount} 
                icon="solar:check-read-linear" 
                colorClass="bg-success-main" 
                bgClass="bg-gradient-start-4" 
            />

            {(isAdmin || user?.permissions?.includes('view-admin')) && (
                <>
                    <StatCard 
                        title="Total Fees" 
                        value={formatCurrency(totalAmount)} 
                        icon="solar:wallet-bold" 
                        colorClass="bg-info-main" 
                        bgClass="bg-gradient-start-3" 
                    />
                    <StatCard 
                        title="Total Collected" 
                        value={formatCurrency(paidAmount)} 
                        icon="solar:cash-out-bold" 
                        colorClass="bg-success-main" 
                        bgClass="bg-gradient-start-4" 
                    />
                </>
            )}
        </div>
    );
};

const StatCard = ({ title, value, icon, colorClass, bgClass }) => (
    <div className="col">
        <div className={`card shadow-none border ${bgClass} h-100`}>
            <div className="card-body p-20">
                <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
                    <div>
                        <p className="fw-medium text-primary-light mb-1">{title}</p>
                        <h6 className="mb-0">{value}</h6>
                    </div>
                    <div className={`w-50-px h-50-px ${colorClass} rounded-circle d-flex justify-content-center align-items-center`}>
                        <Icon icon={icon} className="text-white text-2xl mb-0" />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default UnitCountOne;