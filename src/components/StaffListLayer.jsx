import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { allCustomerFunction } from "../features/customers/customerService";
import Swal from "sweetalert2";
import { deleteStaffFunction } from "../features/staff/staffService";
import HasPermission from "./HasPermission"

const StaffsListLayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const staffList = useSelector((state) => state.staffs.staffs) || [];
  const projectList = useSelector((state) => state.projects.projects) || [];


  useEffect(() => {
    allCustomerFunction(dispatch);
  }, [dispatch]);

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // --- 🛠️ 1. CREATE A PROJECT LOOKUP MAP ---
  // This turns [{id: 1, projectName: 'A'}] into { "1": {projectName: 'A'} }
  // This makes looking up project details much faster.
  const projectMap = useMemo(() => {
    const map = {};
    projectList.forEach((proj) => {
      map[proj.id || proj._id] = proj;
    });
    return map;
  }, [projectList]);


  // --- 🛠️ 2. HELPER TO COLLECT PROJECT DETAILS ---
  const getProjectDetails = (projectData) => {
    if (!projectData) return [];
    
    let ids = [];
    if (Array.isArray(projectData)) {
      ids = projectData;
    } else if (typeof projectData === "string") {
      try {
        const parsed = JSON.parse(projectData);
        ids = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        ids = projectData.split(",").map(id => id.trim());
      }
    } else {
      ids = [projectData];
    }
    return ids.map(id => projectMap[id]).filter(Boolean);
  };

  // Status Badge Styling
  const getStatusClass = (status) => {
    return status === "Active" 
      ? "bg-success-focus text-success-600 border border-success-main" 
      : "bg-neutral-200 text-neutral-600 border border-neutral-400";
  };

  // 🔍 Search & Filter Logic
  const filteredStaffs = useMemo(() => {
    return staffList.filter((staff) => {
      const name = staff?.name || "";
      const address = staff?.address || "";
      
      // Get the actual project names for the search engine to work with
      const projects = getProjectDetails(staff.projects || staff.projectId);
      const projectNamesString = projects.map(p => p.projectName).join(" ").toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectNamesString.includes(searchTerm.toLowerCase());

      const matchesProject =
        projectFilter === "" || staff.projectType === projectFilter;

      return matchesSearch && matchesProject;
    });
  }, [staffList, searchTerm, projectFilter, projectMap]);

  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredStaffs.length / itemsPerPage);
  const paginatedUsers = filteredStaffs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "Reverting this is not possible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea8b0c",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) deleteStaffFunction(dispatch, id);
    });
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={itemsPerPage}
            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
          >
            {[5, 10, 15, 20].map((num) => <option key={num} value={num}>{num}</option>)}
          </select>

          <div className="navbar-search position-relative">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              placeholder="Search staff or project..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <Icon icon="ion:search-outline" className="icon position-absolute end-0 me-12 top-50 translate-middle-y" />
          </div>
        </div>

<HasPermission permission = {"create-staff"}>
        <Link to="/add-staff" className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2">
          <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
          Add New Staff
        </Link>
        </HasPermission>
      </div>

      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Password</th>
                <th>Role</th>
                <th>Location</th>
                <th>Project Details</th>
              
                {<HasPermission permission = {["edit-staff","delete-staff"]} mode = "any"><th className="text-center">Action</th></HasPermission>}
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => {
                  // Collect the projects for this specific user
                  const userProjects = getProjectDetails(user.projects || user.projectId);

                  return (
                    <tr key={user.id}>
                      <td>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}</td>
                      <td>{user.name}</td>
                      <td>{user.phone}</td>
                      <td>{user.email}</td>
                      <td>{user.password}</td>
                      <td className="text-capitalize">{user.role}</td>
                      <td>{user.location || user.address}</td>
                      <td>
<div className="d-flex flex-wrap gap-2">
  {userProjects.length > 0 ? (
    userProjects.map((p, idx) => (
      <Link 
        key={idx} 
        to={`/projects/${p.id || p._id}`} // Link by ID, not index
        className="d-flex align-items-center gap-2 px-12 py-6 radius-8 transition-all group border-start"
        style={{ 
          textDecoration: 'none',
          backgroundColor: '#FFFFFF', // Clean Base
          border: '1px solid rgba(0,0,0,0.05)',
          borderLeftColor: '#EA8B0C' // Your Orange Accent (Static)
        }}
        // Add pseudo-classes in your CSS or a Tailwind utility: 
        // e.g., bg-hover-navy-800 text-hover-white
        onMouseOver={(e) => {
          e.currentTarget.style.backgroundColor = '#EA8B0C'; // Your Navy
          e.currentTarget.querySelector('h6').style.color = '#FFFFFF';
          e.currentTarget.querySelector('span').style.color = 'rgba(255,255,255,0.7)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.backgroundColor = '#FFFFFF';
          e.currentTarget.style.borderLeftColor = '#EA8B0C';
          e.currentTarget.querySelector('h6').style.color = '#0A1A33';
          e.currentTarget.querySelector('span').style.color = 'rgba(10,26,51,0.6)';
        }}
      >
        <div className="d-flex flex-column">
          <h6 className="text-sm fw-bold mb-0 transition-all" style={{ color: '#0A1A33' }}>
            {p.projectName}
          </h6>
          {p.location && (
            <span className="text-xs transition-all" style={{ color: 'rgba(10,26,51,0.6)' }}>
              {p.location}
            </span>
          )}
        </div>
        <Icon icon="lucide:arrow-right-circle" className="text-sm text-secondary-light opacity-0 group-hover-opacity-100" style={{ color: '#EA8B0C' }} />
      </Link>
    ))
  ) : (
    <div className="text-center p-8 radius-8 border border-dashed border-2 text-muted text-xs">
      <Icon icon="carbon:warning" className="text-sm text-secondary-light me-1" />
      Unassigned
    </div>
  )}
</div>
                      </td>
                      <HasPermission permission = {["edit-staff","delete-staff"]} mode = "any">
                      <td className="text-center">
                        <div className="d-flex align-items-center gap-10 justify-content-center">
                          <HasPermission permission={"edit-staff"}>

                          <button onClick={() => navigate(`/edit-staff/${user.id}`)} className="bg-success-focus text-success-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0">
                            <Icon icon="lucide:edit" />
                          </button>
                          </HasPermission>
                          <HasPermission permission={"delete-staff"}>

                          <button onClick={() => handleDelete(user.id)} className="bg-danger-focus text-danger-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0">
                            <Icon icon="fluent:delete-24-regular" />
                          </button>
                          </HasPermission>
                        </div>
                      </td>
                      </HasPermission>
                    </tr>
                  );
                })
              ) : (
                <tr><td colSpan="6" className="text-center py-4">No Staffs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffsListLayer;