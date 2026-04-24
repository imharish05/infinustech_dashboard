import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { deleteProjectFunction, getAllProjects } from "../features/projects/projectService";
import HasPermission from "./HasPermission";

const ProjectListLayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Redux Selectors
  const customers = useSelector((state) => state.customers.customers);
  const projectList = useSelector((state) => state.projects.projects);
  const serverTotalPages = useSelector((state) => state.projects.totalPages);
  const staffList = useSelector((state) => state.staffs.staffs);
  const { user } = useSelector((state) => state.auth);
  const hasPermission = user?.permissions || [];

  // 2. Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Fetch Data Effect
  useEffect(() => {
    getAllProjects(dispatch, currentPage, itemsPerPage);
  }, [dispatch, currentPage, itemsPerPage]);

  // --- HELPER FUNCTIONS MOVED UP TO PREVENT INITIALIZATION ERROR ---
  const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCustomerName = (customerId) => {
    if (!customers || customers.length === 0) return "Loading...";
    const customer = customers.find((c) => String(c.id) === String(customerId));
    return customer ? customer.name : "Unassigned";
  };

  const getStaffName = (staffId) => {
    const staff = staffList.find((s) => String(s.id) === String(staffId));
    return staff ? staff.name : "Unassigned";
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Initialized": return "bg-info-focus text-info-600 border border-info-main";
      case "In Progress": return "bg-warning-focus text-warning-600 border border-warning-main";
      case "Completed": return "bg-success-focus text-success-600 border border-success-main";
      case "On Hold": return "bg-neutral-200 text-neutral-600 border border-neutral-400";
      default: return "bg-neutral-200 text-neutral-600 border border-neutral-400";
    }
  };

  // --- ROLE AND STAFF FILTER LOGIC ---
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role === "Super Admin";
  
  const myStaffRecord = useMemo(() => {
    if (isAdmin) return null;
    return (staffList || []).find(s => String(s.userId) === String(user?.id));
  }, [staffList, user, isAdmin]);

  const myStaffId = myStaffRecord?.id;

  // --- FILTERED PROJECTS (Now helper functions exist before this is called) ---
  const filteredProjects = useMemo(() => {
    let list = projectList || [];

    if (!isAdmin) {
      list = list.filter(project => String(project.assignedStaffId) === String(myStaffId));
    }

    return list.filter((project) => {
      const name = project?.projectName || "";
      const location = project?.location || "";
      const customerName = getCustomerName(project?.customerId) || "";
      const staffName = getStaffName(project?.assignedStaffId) || "";

      const search = searchTerm.toLowerCase();
      const matchesSearch =
        name.toLowerCase().includes(search) ||
        location.toLowerCase().includes(search) ||
        customerName.toLowerCase().includes(search) ||
        staffName.toLowerCase().includes(search);

      const matchesStatus = statusFilter === "" || project?.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projectList, searchTerm, statusFilter, customers, staffList, isAdmin, myStaffId]);

  const handleView = (id) => navigate(`/projects/${id}`);
  const handleEdit = (id) => navigate(`/edit-project/${id}`);

  const handleDelete = (id) => {
    Swal.fire({
      title: '<span style="font-size: 25px">Are You sure ?</span>',
      text: "Deleting this project will permanently remove all related reports, payments, stages, and uploads. This action is irreversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea8b0c",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteProjectFunction(dispatch, id);
      }
    });
  };

  return (
    <div className="card h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <span className="text-md fw-medium text-secondary-light mb-0">Show</span>
          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[5, 10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
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

          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          >
            <option value="">All Status</option>
            <option value="Initialized">Initialized</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
        </div>

        <HasPermission permission={"create-projects"}>
          <Link to="/add-projects" className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2">
            <Icon icon="ic:baseline-plus" className="icon text-xl line-height-1" />
            Add New Project
          </Link>
        </HasPermission>
      </div>

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
                <th>Project Type</th>
                <th>Total Fees</th>
                <th>Status</th>
                <HasPermission permission={["edit-projects", "delete-projects","view-projects"]} mode="any">
                  <th className="text-center">Action</th>
                </HasPermission>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <tr key={project.id}>
                    <td>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}</td>
                    <td>
                      <HasPermission permission={"upload-docs"}>
                        <Link to={`/projects/${project.id}`} className="text-primary-600 text-hover-underline text-capitalize">
                          {project.projectName}
                        </Link>
                      </HasPermission>
                      {!hasPermission.includes("upload-docs") && project.projectName}
                    </td>
                    <td className="text-capitalize">{getStaffName(project.assignedStaffId)}</td>
                    <td className="text-capitalize">{getCustomerName(project.customerId)}</td>
                    <td className="text-capitalize ">{project.location}</td>
                    <td className="fw-medium text-primary text-capitalize">{project.projectType}</td>
                    <td className="fw-medium text-primary">{formatCurrency(project.cost)}</td>
                    <td>
                      <span className={`${getStatusClass(project.status)} px-12 py-4 radius-4 fw-medium text-sm text-capitalize`}>
                        {project.status}
                      </span>
                    </td>
                    <HasPermission permission={["edit-projects", "delete-projects", "upload-docs"]} mode="any">
                      <td className="text-center">
                        <div className="d-flex align-items-center gap-10 justify-content-center">
                          <HasPermission permission={"upload-docs"}>
                            <button onClick={() => handleView(project.id)} className="bg-info-focus text-info-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0">
                              <Icon icon="majesticons:eye-line" className="text-xl" />
                            </button>
                          </HasPermission>
                          <HasPermission permission={"edit-projects"}>
                            <button onClick={() => handleEdit(project.id)} className="bg-success-focus text-success-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0">
                              <Icon icon="lucide:edit" />
                            </button>
                          </HasPermission>
                          <HasPermission permission={"delete-projects"}>
                            <button onClick={() => handleDelete(project.id)} className="bg-danger-focus text-danger-600 w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle border-0">
                              <Icon icon="fluent:delete-24-regular" />
                            </button>
                          </HasPermission>
                        </div>
                      </td>
                    </HasPermission>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="9" className="text-center py-4">No projects found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Buttons */}
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

export default ProjectListLayer;