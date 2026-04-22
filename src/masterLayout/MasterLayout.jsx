import React, { useEffect, useRef, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import HasPermission from "../components/HasPermission";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../features/auth/authSlice";
import { getAllProjects } from "../features/projects/projectService";
import { allStaffFunction } from "../features/staff/staffService";
import { allCustomerFunction } from "../features/customers/customerService";
import { clearNotifications, updatePaymentReminders } from "../features/notification/notificationSlice";
import { fetchPaymentReminders } from "../features/notification/notificationService";
import { fetchAllPayments } from "../features/payment/paymentService";
import { fetchAllStagesForStats } from "../features/stages/stageService";

const MasterLayout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Redux Selectors
  const { user } = useSelector((state) => state.auth);
  const { paymentReminders, totalCount } = useSelector((state) => state.notification);
  const allStages = useSelector((state) => state.stages.allStages) || [];

  const overdue = paymentReminders?.overdue || [];
  const unpaidCompleted = paymentReminders?.unpaidCompleted || [];

  // Local State & Refs
  const [initialLoading, setInitialLoading] = useState(true);
  const [showAlert, setShowAlert] = useState(false);
  const [sidebarActive, seSidebarActive] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const prevCountRef = useRef(totalCount);

  const formatCurrency = (amount) => {
    const validAmount = isNaN(Number(amount)) ? 0 : Number(amount);
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(validAmount);
  };

  // Raminder fetcher

  const lastRunRef = useRef()

useEffect(() => {
  const checkTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    const currentTime = `${hours}:${minutes}`;
    
    // Tip: Use strings that match your hours:minutes exactly
    const targetTimes = ["6:30", "12:30", "18:30"];

    if (targetTimes.includes(currentTime)) {
      if (lastRunRef.current !== currentTime) {
        lastRunRef.current = currentTime;
        fetchPaymentReminders(dispatch);
      }
    }
  };

  
  const interval = setInterval(checkTime, 1000); 

  return () => clearInterval(interval);
}, [dispatch]);


  // Sync stages to payment reminders
// CHANGE this useEffect in MasterLayout:
useEffect(() => {
    if (allStages.length > 0) {
      const today = new Date();
      const currentOverdue = allStages.filter(stage =>
        Number(stage.paid) < Number(stage.amount) &&
        stage.duration && new Date(stage.duration) < today
      );
      const currentUnpaidCompleted = allStages.filter(stage =>
        stage.status === "Completed" &&
        Number(stage.paid) < Number(stage.amount)
      );
      dispatch(updatePaymentReminders({
        overdue: currentOverdue,
        unpaidCompleted: currentUnpaidCompleted
      }));
    }
}, [allStages, dispatch]);


  // Show alert when totalCount increases
  useEffect(() => {
    if (totalCount > prevCountRef.current) {
      setShowAlert(true);
      const timer = setTimeout(() => setShowAlert(false), 5000);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalCount;
  }, [totalCount]);

  // Fetch all data once on mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setInitialLoading(true);
        await Promise.all([
          getAllProjects(dispatch),
          allStaffFunction(dispatch),
          allCustomerFunction(dispatch),
          fetchPaymentReminders(dispatch),
          fetchAllPayments(dispatch),
          fetchAllStagesForStats(dispatch)
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Sidebar dropdown logic
  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");
      if (!clickedDropdown) return;
      const isActive = clickedDropdown.classList.contains("open");

      document.querySelectorAll(".sidebar-menu .dropdown").forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = "0px";
      });

      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) submenu.style.maxHeight = `${submenu.scrollHeight}px`;
      }
    };

    const dropdownTriggers = document.querySelectorAll(".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link");
    dropdownTriggers.forEach((trigger) => trigger.addEventListener("click", handleDropdownClick));
    return () => {
      dropdownTriggers.forEach((trigger) => trigger.removeEventListener("click", handleDropdownClick));
    };
  }, [location.pathname]);

  const sidebarControl = () => seSidebarActive(!sidebarActive);
  const mobileMenuControl = () => setMobileMenu(!mobileMenu);

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearNotifications());
    navigate("/sign-in");
  };

  // Route active checks
  const isCustomerRoute = location.pathname.startsWith("/customers-list") || location.pathname.startsWith("/add-customer") || location.pathname.startsWith("/edit-customer");
  const isStaffRoute = location.pathname.startsWith("/staff-list") || location.pathname.startsWith("/add-staff") || location.pathname.startsWith("/edit-staff");
  const isProjectRoute = location.pathname.startsWith("/projects-list") || location.pathname.startsWith("/add-projects") || location.pathname.startsWith("/projects/");

  return (
    <section className={mobileMenu ? "overlay active" : "overlay"}>
      {/* Sidebar */}
      <aside className={sidebarActive ? "sidebar active" : mobileMenu ? "sidebar sidebar-open" : "sidebar"}>
        <button onClick={mobileMenuControl} type="button" className="sidebar-close-btn">
          <Icon icon="radix-icons:cross-2" />
        </button>
        <div className="d-flex align-items-center justify-content-center">
          <Link to="/" className="sidebar-logo">
            <img src="/assets/images/logo.png" alt="site logo" className="light-logo" />
            <img src="/assets/images/logo.png" alt="site logo" className="dark-logo" />
            <img src="/assets/images/logo.png" alt="site logo" className="logo-icon" />
          </Link>
        </div>
        <div className="sidebar-menu-area">
          <ul className="sidebar-menu" id="sidebar-menu">

            <HasPermission permission={["view-dashboard", "view-admin"]} mode="any">
              <li>
                <NavLink to="/" className={({ isActive }) => `${isActive ? "active-page" : ""} d-flex align-items-center gap-2`}>
                  <Icon icon="solar:home-smile-angle-outline" className="menu-icon" />
                  <span>Dashboard</span>
                </NavLink>
              </li>
            </HasPermission>

            <HasPermission permission={["view-customers", "create-customer"]} mode="any">
              <li className={`dropdown ${isCustomerRoute ? "open" : ""} mt-3`}>
                <NavLink to="/customers-list" className={`d-flex align-items-center ${isCustomerRoute ? "active" : ""}`}>
                  <Icon icon="flowbite:users-group-outline" className="menu-icon" />
                  <span>Customers</span>
                </NavLink>
                <ul className="sidebar-submenu" style={{ maxHeight: isCustomerRoute ? "500px" : "0px", overflow: "hidden", transition: "max-height 0.3s ease" }}>
                  <HasPermission permission={"create-customer"}>
                    <li><NavLink to="/add-customer" className={({ isActive }) => (isActive ? "active-page" : "")}><i className="ri-circle-fill circle-icon text-info-main w-auto" /> Add Customer</NavLink></li>
                  </HasPermission>
                  <HasPermission permission={"view-customers"}>
                    <li><NavLink to="/customers-list" className={({ isActive }) => (isActive ? "active-page" : "")}><i className="ri-circle-fill circle-icon text-primary-600 w-auto" /> Customer List</NavLink></li>
                  </HasPermission>
                </ul>
              </li>
            </HasPermission>

            <HasPermission permission={["view-staffs", "create-staff"]} mode="any">
              <li className={`dropdown ${isStaffRoute ? "open" : ""}`}>
                <NavLink to="/staff-list" className="d-flex align-items-center">
                  <Icon icon="flowbite:user-circle-outline" className="menu-icon" />
                  <span>Staffs</span>
                </NavLink>
                <ul className="sidebar-submenu" style={{ maxHeight: isStaffRoute ? "500px" : "0px", overflow: "hidden", transition: "max-height 0.3s ease" }}>
                  <HasPermission permission={"create-staff"}>
                    <li><NavLink to="/add-staff" className={({ isActive }) => (isActive ? "active-page" : "")}><i className="ri-circle-fill circle-icon text-info-main w-auto" /> Add Staff</NavLink></li>
                  </HasPermission>
                  <HasPermission permission={"view-staffs"}>
                    <li><NavLink to="/staff-list" className={({ isActive }) => (isActive ? "active-page" : "")}><i className="ri-circle-fill circle-icon text-primary-600 w-auto" /> Staffs List</NavLink></li>
                  </HasPermission>
                </ul>
              </li>
            </HasPermission>

            <HasPermission permission={["view-projects", "create-projects"]} mode="any">
              <li className={`dropdown ${isProjectRoute ? "open" : ""}`}>
                <NavLink to="/projects-list" className={`d-flex align-items-center ${isProjectRoute ? "active" : ""}`}>
                  <Icon icon="solar:folder-with-files-outline" className="menu-icon" />
                  <span>Projects</span>
                </NavLink>
                <ul className="sidebar-submenu" style={{ maxHeight: isProjectRoute ? "500px" : "0px", overflow: "hidden", transition: "max-height 0.3s ease" }}>
                  <HasPermission permission={"create-projects"}>
                    <li><NavLink to="/add-projects" className={({ isActive }) => (isActive ? "active-page" : "")}><i className="ri-circle-fill circle-icon text-info-main w-auto" /> Add Project</NavLink></li>
                  </HasPermission>
                  <HasPermission permission={"view-projects"}>
                    <li><NavLink to="/projects-list" className={({ isActive }) => (isActive ? "active-page" : "")}><i className="ri-circle-fill circle-icon text-primary-600 w-auto" /> Project List</NavLink></li>
                  </HasPermission>
                </ul>
              </li>
            </HasPermission>

            <HasPermission permission={"manage-access"}>
              <li>
                <NavLink to="/role-access" className={({ isActive }) => (isActive ? "active-page" : "")}>
                  <Icon icon="solar:home-smile-angle-outline" className="menu-icon" />
                  <span>Role &amp; Access</span>
                </NavLink>
              </li>
            </HasPermission>

            <HasPermission permission={"manage-remainders"}>
              <li className="mt-3">
                <NavLink to="/remainders" className={({ isActive }) => (isActive ? "active-page" : "")}>
                  <Icon icon="solar:bell-bing-outline" className="menu-icon" />
                  <span>Notifications</span>
                </NavLink>
              </li>
            </HasPermission>

            <HasPermission permission={"view-reports"}>
              <li className="mt-3">
                <NavLink to="/reports" className={({ isActive }) => (isActive ? "active-page" : "")}>
                  <Icon icon="solar:chart-square-outline" className="menu-icon" />
                  <span>Reports</span>
                </NavLink>
              </li>
            </HasPermission>

          </ul>
        </div>
      </aside>

      {/* Main */}
      <main className={sidebarActive ? "dashboard-main active" : "dashboard-main"}>
        <div className="navbar-header">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-4">
                <button type="button" className="sidebar-toggle" onClick={sidebarControl}>
                  <Icon icon={sidebarActive ? "iconoir:arrow-right" : "heroicons:bars-3-solid"} className="icon text-2xl" />
                </button>
                <button onClick={mobileMenuControl} type="button" className="sidebar-mobile-toggle">
                  <Icon icon="heroicons:bars-3-solid" className="icon" />
                </button>
              </div>
            </div>

            <div className="col-auto">
              <div className="d-flex flex-wrap align-items-center gap-3">

                {/* NOTIFICATION DROPDOWN */}
                <div className="dropdown">
                  <button className="has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center" type="button" data-bs-toggle="dropdown">
                    <Icon icon="iconoir:bell" className="text-primary-light text-xl" />
                    {totalCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: "10px" }}>
                        {totalCount}
                      </span>
                    )}
                  </button>

                  <div className="dropdown-menu to-top dropdown-menu-lg p-0">
                    <div className="m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <h6 className="text-lg text-primary-light fw-semibold mb-0">Notifications</h6>
                      <span className="text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center">
                        {totalCount.toString().padStart(2, "0")}
                      </span>
                    </div>

                    <div className="max-h-400-px overflow-y-auto scroll-sm pe-4">

                      {/* OVERDUE REMINDERS */}
                      {overdue.map((item, index) => (
                        <Link key={`overdue-${index}`} to={`/projects/${item.projectId}`} className="px-24 py-12 d-flex align-items-start gap-3 hover-bg-neutral-50 border-bottom">
                          <span className="w-44-px h-44-px bg-danger-subtle text-danger-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <Icon icon="solar:danger-bold" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-0 text-danger-main">Overdue: {item.stage_Name}</h6>
                            <p className="mb-0 text-sm text-secondary-light">{item.projectName}</p>
                            <p className="mb-0 text-xs fw-bold text-danger-600">Balance: {formatCurrency(item.balance || (Number(item.amount) - Number(item.paid)))}</p>
                          </div>
                        </Link>
                      ))}

                      {/* UNPAID COMPLETED REMINDERS */}
                      {unpaidCompleted.map((item, index) => (
                        <Link key={`unpaid-${index}`} to={`/projects/${item.projectId}`} className="px-24 py-12 d-flex align-items-start gap-3 hover-bg-neutral-50 border-bottom">
                          <span className="w-44-px h-44-px bg-warning-subtle text-warning-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0">
                            <Icon icon="solar:check-read-bold" />
                          </span>
                          <div>
                            <h6 className="text-md fw-semibold mb-0 text-warning-main">Payment Pending</h6>
                            <p className="mb-0 text-sm text-secondary-light">{item.stage_Name} - {item.projectName}</p>
                            <p className="mb-0 text-xs fw-bold text-warning-600">Due: {formatCurrency(item.balance || (Number(item.amount) - Number(item.paid)))}</p>
                          </div>
                        </Link>
                      ))}

                      {totalCount === 0 && (
                        <div className="p-24 text-center text-secondary-light">All caught up!</div>
                      )}
                    </div>

                    <div className="text-center py-12 px-16">
                      <Link to="/remainders" className="text-primary-600 fw-semibold text-md">View All</Link>
                    </div>
                  </div>
                </div>

                {/* PROFILE DROPDOWN */}
                <div className="dropdown">
                  <button className="d-flex justify-content-center align-items-center rounded-circle" type="button" data-bs-toggle="dropdown">
                    <Icon icon="solar:user-circle-bold" className="w-40-px h-40-px object-fit-cover rounded-circle text-primary-light" />
                  </button>
                  <div className="dropdown-menu to-top dropdown-menu-sm">
                    <div className="py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2">
                      <div>
                        <h6 className="text-lg text-primary-light fw-semibold mb-2">{user?.name}</h6>
                        <span className="text-secondary-light fw-medium text-sm">{user?.role}</span>
                      </div>
                    </div>
                    <ul className="to-top-list">
                      <li>
                        <button onClick={handleLogout} className="dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3">
                          <Icon icon="lucide:power" className="icon text-xl" /> Log Out
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="dashboard-main-body" style={{ backgroundAttachment: "fixed", backgroundImage: "url('/assets/images/bg/bg_2.webp')", backgroundSize: "cover", minHeight: "100vh" }}>
          {initialLoading ? (
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <h6 className="mt-3 text-secondary-light">Initializing Dashboard...</h6>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </div>

        {/* Footer */}
        <footer className="d-footer">
          <div className="row align-items-center justify-content-between">
            <div className="col-auto"><p className="mb-0">© 2026 Infinus Tech. All Rights Reserved.</p></div>
            <div className="col-auto">
              <p className="mb-0">Made by <a href="https://saitechnosolutions.com/" rel="noreferrer" target="_blank" className="text-primary-600">Sai Techno Solutions</a></p>
            </div>
          </div>
        </footer>

        {/* Floating Alert */}
        {showAlert && (
          <div className="position-fixed bottom-0 end-0 m-24 z-3 animate__animated animate__slideInRight">
            <div className="bg-white radius-12 shadow-lg border-start border-4 border-danger-main p-16 d-flex align-items-center gap-3">
              <div className="bg-danger-100 w-40-px h-40-px rounded-circle d-flex justify-content-center align-items-center">
                <Icon icon="solar:bell-bing-bold" className="text-danger-main text-xl" />
              </div>
              <div>
                <h6 className="text-sm mb-0 fw-bold">Action Required!</h6>
                <p className="text-xs text-secondary-light mb-0">New payment reminders received.</p>
              </div>
              <button onClick={() => setShowAlert(false)} className="ms-2">
                <Icon icon="line-md:close" />
              </button>
            </div>
          </div>
        )}
      </main>
    </section>
  );
};

export default MasterLayout;