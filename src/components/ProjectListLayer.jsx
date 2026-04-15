import React, { useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { deleteProjectFunction } from "../features/projects/projectService";
import HasPermission from "./HasPermission";

const ProjectListLayer = () => {
  const navigate = useNavigate();
  
  const dispatch = useDispatch()


  // Initial Project  and customer Data
  const customers = useSelector((state) => state.customers.customers)
  const projectList = useSelector((state) =>  state.projects.projects)
  const staffList = useSelector((state) => state.staffs.staffs)
  const {user} = useSelector((state) => state.auth)

  const hasPermission = user?.permissions || []


  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Format Currency (INR)
  const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Get Customer Name by ID
  const getCustomerName = (customerId) => {
    const customer = customers.find((c) => c.id === customerId);
    return customer ? customer.name : "Unassigned";
  };

  const getStaffName = (staffId) => {
    const staff = staffList.find((s) => s.id == staffId)
    return staff ? staff.name : "Unassigned"
  }

  // Status Badge Styling
  const getStatusClass = (status) => {
    switch (status) {
      case "Initialized":
        return "bg-info-focus text-info-600 border border-info-main";
      case "In Progress":
        return "bg-warning-focus text-warning-600 border border-warning-main";
      case "Completed":
        return "bg-success-focus text-success-600 border border-success-main";
      case "On Hold":
        return "bg-neutral-200 text-neutral-600 border border-neutral-400";
      default:
        return "bg-neutral-200 text-neutral-600 border border-neutral-400";
    }
  };

  // 🔍 Search & Filter Logic
const filteredProjects = useMemo(() => {
    // 1. Use projectList (the Redux source) directly to ensure UI updates after delete
    return (projectList || []).filter((project) => {
        
        // 2. Safe Property Extraction: Fallback to "" if data is missing
        const name = project?.projectName || ""; 
        const location = project?.location || "";
        
        // 3. Safe Customer Name Extraction
        const customerResult = getCustomerName(project?.customerId);
        const customerName = customerResult || ""; 
        const staffResult = getStaffName(project?.staffId)
        const staffName = staffResult || ""

        // 4. Safe Search matching (Pre-calculate search for performance)
        const search = (searchTerm || "").toLowerCase();
        
        const matchesSearch =
            name.toLowerCase().includes(search) ||
            location.toLowerCase().includes(search) ||
            customerName.toLowerCase().includes(search) || 
            staffName.toLowerCase().includes(search);

        // 5. Safe Status matching
        const status = project?.status || "";
        const matchesStatus = statusFilter === "" || status === statusFilter;

        return matchesSearch && matchesStatus;
    });
    
    // 6. Ensure projectList is in dependencies so deletion triggers a refresh
}, [projectList, searchTerm, statusFilter, customers,staffList]);


  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage

  );

  // 👁️ View and ✏️ Edit Navigation
  const handleView = (id) => navigate(`/projects/${id}`);
  const handleEdit = (id) => navigate(`/edit-project/${id}`);

    const handleDelete = (id) => {
    Swal.fire({
      title : "Are you sure ?",
      text: "You won't be able to revert this!",
      icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ea8b0c", // Matching your theme
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel",
        reverseButtons: true // Places 'Confirm' on the right
    }).then((result) => {
        if (result.isConfirmed) {
            deleteProjectFunction(dispatch, id);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: "Cancelled",
                text: "The customer record is safe :)",
                icon: "info",
                confirmButtonColor: "#ea8b0c",
                timer: 1500
            });
        }
    });
};



  return (
    <div className="card h-100 p-0 radius-12">
      {/* Header */}
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <span className="text-md fw-medium text-secondary-light mb-0">
            Show
          </span>

          {/* Items Per Page */}
          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 15, 20].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>

          {/* Search */}
          <div className="navbar-search position-relative">
            <input
              type="text"
              className="bg-base h-40-px w-auto"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Icon
              icon="ion:search-outline"
              className="icon position-absolute end-0 me-12 top-50 translate-middle-y"
            />
          </div>

          {/* Status Filter */}
          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Status</option>
            <option value="Initialized">Initialized</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        {/* Add Project */}

        <HasPermission permission={"create-projects"}>

        <Link
          to="/add-projects"
          className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
          <Icon
            icon="ic:baseline-plus"
            className="icon text-xl line-height-1"
            />
          Add New Project
        </Link>
        </HasPermission>
      </div>

      {/* Table */}
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Project Name</th>
                <th>Assigned To</th>
                <th>Customer</th>
                <th>Location</th>
                <th>Total Cost</th>
                <th>Status</th>
                
                {<HasPermission permission={["edit-projects","delete-projects"]} mode="any">
                <th className="text-center">Action</th>
                  </HasPermission>}
              </tr>
            </thead>
            <tbody>
              {paginatedProjects.length > 0 ? (
                paginatedProjects.map((project, index) => (
                  <tr key={project.id}>
                    <td>
                      {String(
                        (currentPage - 1) * itemsPerPage + index + 1
                      ).padStart(2, "0")}
                    </td>
                   <td>

                  <HasPermission permission={"upload-docs"}>
                    {console.log(HasPermission)}
                    
    <Link 
      to={`/projects/${project.id}`} 
      className="text-primary-600 text-hover-underline"
      style={{ cursor: 'pointer' }}
      id="projectLink"
    >
      {project.projectName}
    </Link>
                     </HasPermission>
                     {
                      !hasPermission.includes("upload-docs") && (
                        <td>{project.projectName}</td>
                      )
                     }
                     
  </td>
                    <td>{getStaffName(project.assignedStaffId)}</td>
                    <td>{getCustomerName(project.customerId)}</td>
                    <td>{project.location}</td>
                    <td className="fw-medium text-primary">
                      {formatCurrency(project.cost)}
                    </td>
                    <td>
                      <span
                        className={`${getStatusClass(
                          project.status
                        )} px-12 py-4 radius-4 fw-medium text-sm`}
                      >
                        {project.status}
                      </span>
                    </td>

 {<HasPermission permission={["edit-projects","delete-projects","upload-docs"]} mode="any">
                    <td className="text-center">
                      <div className="d-flex align-items-center gap-10 justify-content-center">
                        <HasPermission permission={"upload-docs"}>
                        <button
                          type="button"
                          onClick={() => handleView(project.id)}
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                          <Icon
                            icon="majesticons:eye-line"
                            className="icon text-xl"
                            />
                        </button>
                            
                        </HasPermission>

<HasPermission permission={"edit-projects"}>

                        <button
                          type="button"
                          onClick={() => handleEdit(project.id)}
                          className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                          <Icon icon="lucide:edit" className="menu-icon" />
                        </button>
                          </HasPermission>

                          <HasPermission permission={"delete-projects"}>


                        <button
                          type="button"
                          onClick={() => handleDelete(project.id)}
                          className="remove-item-btn bg-danger-focus bg-hover-danger-200 text-danger-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                          <Icon
                            icon="fluent:delete-24-regular"
                            className="menu-icon"
                            />
                        </button>
                            </HasPermission>
                      </div>
                    </td>
                    </HasPermission>}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    No projects found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-end align-items-center gap-2 mt-4">
            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
            >
              Previous
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`btn btn-sm ${
                  currentPage === i + 1 ? "btn-primary" : "btn-light"
                }`}
                onClick={() => setCurrentPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}

            <button
              className="btn btn-sm btn-light"
              disabled={currentPage === totalPages}
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

export default ProjectListLayer;