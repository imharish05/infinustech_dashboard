import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { allStaffFunction, deleteStaffFunction } from "../features/staff/staffService";
import Swal from "sweetalert2";
import HasPermission from "./HasPermission";

const StaffsListLayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Get data and pagination from Redux
  const staffList = useSelector((state) => state.staffs.staffs) || [];
  const serverTotalPages = useSelector((state) => state.staffs.totalPages) || 1;
  const projectList = useSelector((state) => state.projects.projects) || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const copyToClipboard = (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try { document.execCommand('copy'); } catch (err) { console.error('Unable to copy', err); }
      document.body.removeChild(textArea);
    }
  };

  // Trigger fetch when page or limit changes
  useEffect(() => {
    allStaffFunction(dispatch, currentPage, itemsPerPage);
  }, [dispatch, currentPage, itemsPerPage]);

const projectMap = useMemo(() => {
  const map = {};
  projectList.forEach((proj) => {
    const id = String(proj.id || proj._id); // Force to string
    map[id] = proj;
  });
  return map;
  
}, [projectList]);

// Update your detail fetcher to use string IDs
const getProjectDetails = (projectData) => {
  if (!projectData) return [];

  let ids = [];

  try {
    // If it's a string that starts with "[", it needs parsing
    if (typeof projectData === 'string' && projectData.startsWith('[')) {
      ids = JSON.parse(projectData);
    } 
    // If it's already an array, but the first element is a stringified array
    else if (Array.isArray(projectData) && typeof projectData[0] === 'string' && projectData[0].startsWith('[')) {
      ids = JSON.parse(projectData[0]);
    }
    // Standard array or single ID
    else {
      ids = Array.isArray(projectData) ? projectData : [projectData];
    }
  } catch (error) {
    console.error("Parsing error:", error);
    ids = Array.isArray(projectData) ? projectData : [projectData];
  }

  // Ensure 'ids' is an array before mapping
  const finalIds = Array.isArray(ids) ? ids : [ids];

  return finalIds
    .map(id => projectMap[String(id).trim()])
    .filter(Boolean);
};


  const filteredStaffs = useMemo(() => {
    return staffList.filter((staff) => {
      const name = staff?.name || "";
      const address = staff?.address || staff?.location || "";
      const role = staff?.role || "";
      const projects = getProjectDetails(staff.projects || staff.projectId);
      const projectNamesString = projects.map(p => p.projectName).join(" ").toLowerCase();

      const matchesSearch =
        name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        projectNamesString.includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === "" || role.toLowerCase() === roleFilter.toLowerCase();
      const matchesProject = projectFilter === "" || projects.some(p => (p.id || p._id) === projectFilter);

      return matchesSearch && matchesRole && matchesProject;
    });
  }, [staffList, searchTerm, roleFilter, projectFilter, projectMap]);

  const handleDelete = (id) => {
    Swal.fire({
      title: '<span style="font-size: 25px">Are You sure ?</span>',
      text: "Reverting this is not possible!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      confirmButtonColor: "#ea8b0c",
      reverseButtons: true,
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
            {[5, 10, 20, 50, 100].map((num) => <option key={num} value={num}>{num}</option>)}
          </select>

          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Roles</option>
            <option value="staff">Staff</option>
            <option value="designer">Designer</option>
            <option value="admin">Admin</option>
          </select>

          <div className="navbar-search position-relative">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
            <Icon icon="ion:search-outline" className="icon position-absolute end-0 me-12 top-50 translate-middle-y" />
          </div>
        </div>

        <HasPermission permission={"create-staff"}>
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
                <HasPermission permission={["edit-staff", "delete-staff"]} mode="any">
                  <th className="text-center">Action</th>
                </HasPermission>
              </tr>
            </thead>
            <tbody>
              {filteredStaffs.length > 0 ? (
                filteredStaffs.map((user, index) => {

                  const userProjects = getProjectDetails(user.projects || user.projectId);
          

                  return (
                    <tr key={user.id}>
                      <td className="text-capitalize">{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}</td>
                      <td className="text-capitalize">{user.name}</td>
                      <td className="text-capitalize">{user.phone}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {user.plainPassword || "******"}
                          <button
                            type="button"
                            className="border-0 bg-transparent p-0"
                            onClick={() => copyToClipboard(user.plainPassword)}
                          >
                            <Icon icon="lucide:copy" className="text-sm text-secondary-light hover-text-primary" />
                          </button>
                        </div>
                      </td>
                      <td className="text-capitalize">{user.role}</td>
                      <td className="text-capitalize">{user.location || user.address}</td>
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
          <h6 className="text-sm fw-bold mb-0 transition-all text-capitalize" style={{ color: '#0A1A33' }}>
            {p.projectName}
          </h6>
          {p.location && (
            <span className="text-xs transition-all text-capitalize" style={{ color: 'rgba(10,26,51,0.6)' }}>
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
                      <HasPermission permission={["edit-staff", "delete-staff"]} mode="any">
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
                <tr><td colSpan="9" className="text-center py-4">No Staffs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Buttons */}
        {serverTotalPages > 1 && (
          <div className="d-flex justify-content-end align-items-center gap-2 mt-4">
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>
            {[...Array(serverTotalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${currentPage === i + 1 ? "btn-primary" : "btn-light"}`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === serverTotalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffsListLayer;