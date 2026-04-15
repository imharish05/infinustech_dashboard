import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import HasPermission from "../components/HasPermission";

const MasterLayout = ({ children }) => {
  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route

  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };


  // Customer Route Active list

const isCustomerRoute =
  location.pathname.startsWith("/users-list") ||
  location.pathname.startsWith("/add-user") ||
  location.pathname.startsWith("/edit-user");


  const isStaffRoute =
  location.pathname.startsWith("/staff-list") ||
  location.pathname.startsWith("/add-staff") ||
  location.pathname.startsWith("/edit-staff");
  
  return (
    <section className={mobileMenu ? "overlay active" : "overlay "}>
      {/* sidebar */}
      <aside
        className={
          sidebarActive
            ? "sidebar active "
            : mobileMenu
            ? "sidebar sidebar-open"
            : "sidebar"
        }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div className="d-flex align-items-center justify-content-center">
          <Link to='/' className='sidebar-logo'>
            <img
              src='/assets/images/logo.png'
              alt='site logo'
              className='light-logo'
            />
            <img
              src='/assets/images/logo.png'
              alt='site logo'
              className='dark-logo'
            />
            <img
              src='/assets/images/logo.png'
              alt='site logo'
              className='logo-icon'
            />
          </Link>
        </div>
        <div className='sidebar-menu-area'>
          <ul className='sidebar-menu' id='sidebar-menu'>

<HasPermission permission = {["view-dashboard","view-admin"]} mode = "any">
            <li>
              <NavLink to='/'
              className={(navData) => (navData.isActive ? "active-page" : "")}>
                <Icon
                  icon='solar:home-smile-angle-outline'
                  className='menu-icon'
                />
                <span>Dashboard</span>
              </NavLink>
            </li>
</HasPermission>

{/* Customers */}

<HasPermission permission={["view-customers","create-customer"]} mode = "any">

<li className={`dropdown mt-3 ${isCustomerRoute ? "open" : ""}`}>
  <NavLink to="/customers-list" className="d-flex align-items-center gap-2">
    <Icon
      icon="flowbite:users-group-outline"
      className="menu-icon"
    />
    <span>Customers</span>
  </NavLink>

  <ul
    className="sidebar-submenu"
    style={{
      maxHeight: isCustomerRoute ? "500px" : "0px",
      overflow: "hidden",
      transition: "max-height 0.3s ease",
    }}
  >

{/* Has permission for the customer add */}
    <HasPermission permission={"create-customer"}>

       <li>
      <NavLink
        to="/add-customer"
        className={({ isActive }) =>
          isActive ? "active-page" : ""
      }
      >
        <i className="ri-circle-fill circle-icon text-info-main w-auto" />
        Add Customer
      </NavLink>
    </li>
      </HasPermission>


<HasPermission permission={"view-customers"}>
    <li>
      <NavLink
        to="/customers-list"
        className={({ isActive }) =>
          isActive ? "active-page" : ""
      }
      >
        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
        Customer List
      </NavLink>
    </li>

</HasPermission>

  </ul>
</li>

</HasPermission>

{/* Stafffs or Users */}

<HasPermission permission={["view-staffs","create-staff"]} mode = "any">
  
<li className={`dropdown mt-3 ${isStaffRoute ? "open" : ""}`}>
  <NavLink to="/staff-list" className="d-flex align-items-center gap-2">
   <Icon icon="flowbite:user-circle-outline" className="menu-icon" />
    <span>Staffs</span>
  </NavLink>

  <ul
    className="sidebar-submenu"
    style={{
      maxHeight: isStaffRoute ? "500px" : "0px",
      overflow: "hidden",
      transition: "max-height 0.3s ease",
    }}
  >

    <HasPermission permission = {"create-staff"}>
        <li>
      <NavLink
        to="/add-staff"
        className={({ isActive }) =>
          isActive ? "active-page" : ""
        }
      >
        <i className="ri-circle-fill circle-icon text-info-main w-auto" />
        Add Staff
      </NavLink>


      
        </li>
      </HasPermission>
      <HasPermission permission = {"view-staffs"}>
    <li>
      <NavLink
        to="/staff-list"
        className={({ isActive }) =>
          isActive ? "active-page" : ""
        }
      >
        <i className="ri-circle-fill circle-icon text-primary-600 w-auto" />
        Staffs List
      </NavLink>
    </li>
</HasPermission>

  </ul>
</li>

</HasPermission>


<HasPermission permission = {["view-projects","create-projects"]} mode = "any">
            {/* Projects */}
            <li className='dropdown mt-3'>
              <Link to='#'>
                <Icon icon='solar:folder-with-files-outline' className='menu-icon' />
                <span>Projects</span>
              </Link>
              <ul className='sidebar-submenu'>
                <HasPermission permission = {"create-projects"}>
                <li>
                  <NavLink
                    to='/add-projects'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Add Project
                  </NavLink>
                </li>
  </HasPermission>

<HasPermission permission={"view-projects"}>
  <li>
    <NavLink
      to='/projects-list'
      className={(navData) => navData.isActive ? "active-page" : ""}
    >
      <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
      Project List
    </NavLink>
  </li>
</HasPermission>

              </ul>
            </li>

</HasPermission>

        {/* Payments */}
             {/* <li className="mt-3">
              <NavLink
                to='/invoice-list'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon='hugeicons:invoice-03' className='menu-icon' />
                <span>Payments</span>
              </NavLink>
            </li> */}

 

<HasPermission permission = {"manage-access"} mode = "any">
            <li>
              <NavLink to='/role-access'
              className={(navData) => (navData.isActive ? "active-page" : "")}>
                <Icon
                  icon='solar:home-smile-angle-outline'
                  className='menu-icon'
                />
                <span>Role &amp; Access</span>
              </NavLink>
            </li>
</HasPermission>


            {/* Documents */}
             {/* <li>
              <NavLink
                to='/documents'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon='solar:document-add-outline' className='menu-icon' />
                <span>Upload Documents</span>
              </NavLink>
            </li> */}

            {/* Remainders and notifications */}

            <HasPermission permission = {"manage-remainders"}>
              
             <li className="mt-3">
              <NavLink
                to='/notification'
                className={(navData) => (navData.isActive ? "active-page" : "")}
              >
                <Icon icon='solar:bell-bing-outline' className='menu-icon' />
                <span>Remainders & notifications</span>
              </NavLink>
            </li>
            
            </HasPermission>


            <HasPermission permission = {"view-reports"}>

             <li className="mt-3">
              <NavLink
                to='/reports'
                className={(navData) => (navData.isActive ? "active-page" : "")}
                >
                <Icon icon='solar:chart-square-outline' className='menu-icon' />
                <span>Reports</span>
              </NavLink>
            </li>
                </HasPermission>

            {/* Authentication Dropdown */}
            <li className='dropdown mt-3'>
              <Link to='#'>
                <Icon
                  icon='icon-park-outline:setting-two'
                  className='menu-icon'
                />
                <span>Setting</span>
              </Link>
              <ul className='sidebar-submenu'>
                <li>
                  <NavLink
                    to='/sign-in'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Sign In
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/sign-up'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-warning-main w-auto' />{" "}
                    Sign Up
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to='/forgot-password'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-info-main w-auto' />{" "}
                    Forgot Password
                  </NavLink>
                </li>
                                <li>
                  <NavLink
                    to='/company'
                    className={(navData) =>
                      navData.isActive ? "active-page" : ""
                    }
                  >
                    <i className='ri-circle-fill circle-icon text-primary-600 w-auto' />{" "}
                    Company
                  </NavLink>
                </li>
              </ul>
            </li>

          </ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                    <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
                <form className='navbar-search'>
                  <input type='text' name='search' placeholder='Search' />
                  <Icon icon='ion:search-outline' className='icon' />
                </form>
              </div>
            </div>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <ThemeToggleButton />
               

                {/* Message dropdown end */}
                <div className='dropdown'>
                  <button
                    className='has-indicator w-40-px h-40-px bg-neutral-200 rounded-circle d-flex justify-content-center align-items-center'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <Icon
                      icon='iconoir:bell'
                      className='text-primary-light text-xl'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-lg p-0'>
                    <div className='m-16 py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-0'>
                          Notifications
                        </h6>
                      </div>
                      <span className='text-primary-600 fw-semibold text-lg w-40-px h-40-px rounded-circle bg-base d-flex justify-content-center align-items-center'>
                        05
                      </span>
                    </div>
                    <div className='max-h-400-px overflow-y-auto scroll-sm pe-4'>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            <Icon
                              icon='bitcoin-icons:verify-outline'
                              className='icon text-xxl'
                            />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Congratulations
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Your profile has been Verified. Your profile has
                              been Verified
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            <img
                              src='/assets/images/notification/profile-1.png'
                              alt=''
                            />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Ronald Richards
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              You can stitch between artboards
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            AM
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Arlene McCoy
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between bg-neutral-50'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-success-subtle text-success-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            <img
                              src='assets/images/notification/profile-2.png'
                              alt=''
                            />
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Annette Black
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                      <Link
                        to='#'
                        className='px-24 py-12 d-flex align-items-start gap-3 mb-2 justify-content-between'
                      >
                        <div className='text-black hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'>
                          <span className='w-44-px h-44-px bg-info-subtle text-info-main rounded-circle d-flex justify-content-center align-items-center flex-shrink-0'>
                            DR
                          </span>
                          <div>
                            <h6 className='text-md fw-semibold mb-4'>
                              Darlene Robertson
                            </h6>
                            <p className='mb-0 text-sm text-secondary-light text-w-200-px'>
                              Invite you to prototyping
                            </p>
                          </div>
                        </div>
                        <span className='text-sm text-secondary-light flex-shrink-0'>
                          23 Mins ago
                        </span>
                      </Link>
                    </div>
                    <div className='text-center py-12 px-16'>
                      <Link
                        to='#'
                        className='text-primary-600 fw-semibold text-md'
                      >
                        See All Notification
                      </Link>
                    </div>
                  </div>
                </div>
                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    <img
                      src='/assets/images/user.png'
                      alt='image_user'
                      className='w-40-px h-40-px object-fit-cover rounded-circle'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <div>
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          Shaidul Islam
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                          Admin
                        </span>
                      </div>
                      <button type='button' className='hover-text-danger'>
                        <Icon
                          icon='radix-icons:cross-1'
                          className='icon text-xl'
                        />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/view-profile'
                        >
                          <Icon
                            icon='solar:user-linear'
                            className='icon text-xl'
                          />{" "}
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/email'
                        >
                          <Icon
                            icon='tabler:message-check'
                            className='icon text-xl'
                          />{" "}
                          Inbox
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-primary d-flex align-items-center gap-3'
                          to='/company'
                        >
                          <Icon
                            icon='icon-park-outline:setting-two'
                            className='icon text-xl'
                          />
                          Setting
                        </Link>
                      </li>
                      <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3'
                          to='#'
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>{children}</div>

        {/* Footer section */}
        <footer className='d-footer'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <p className='mb-0'>© 2026 Infinus Tech. All Rights Reserved.</p>
            </div>
            <div className='col-auto'>
              <p className='mb-0'>
                Made by <a href="https://saitechnosolutions.com/" rel="noreferrer" target="_blanck" className='text-primary-600'>Sai Techno Solutions</a>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </section>
  );
};

export default MasterLayout;
