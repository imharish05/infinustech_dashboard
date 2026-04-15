import React, { useState, useMemo, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { allCustomerFunction, deleteCustomerFunction } from "../features/customers/customerService";
import Swal from "sweetalert2";
import HasPermission from "./HasPermission";

const UsersListLayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch()
  
  
  const customerList = useSelector((state) => state.customers.customers) || [];

  useEffect(() => {
    allCustomerFunction(dispatch)
  },[dispatch])
  
   // Initial Data with default status set to "Active"

  // State Management
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  // Format Budget as Indian Rupees
  const formatCurrency = (amount) => {
    if (amount == null) return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Status Badge Styling
  const getStatusClass = (status) => {
    switch (status) {
      case "Active":
        return "bg-success-focus text-success-600 border border-success-main";
      case "Inactive":
        return "bg-neutral-200 text-neutral-600 border border-neutral-400";
      default:
        return "bg-neutral-200 text-neutral-600 border border-neutral-400";
    }
  };

  // 🔍 Search & Filter Logic
// 🔍 Search & Filter Logic (SAFE VERSION)
const filteredUsers = useMemo(() => {
  return customerList.filter((user) => {
    // 1. Safe Property Extraction: Use optional chaining (?.) and fallback to empty string ("")
    const name = user?.name || "";
    const address = user?.address || "";
    const phone = user?.phone || "";
    const projectType = user?.projectType || "";

    // 2. Safe Search matching
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      phone.includes(searchTerm);

    // 3. Safe Project matching
    const matchesProject =
      projectFilter === "" || projectType === projectFilter;

    return matchesSearch && matchesProject;
  });
}, [customerList, searchTerm, projectFilter]);
  // 📄 Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // 🗑️ Delete Functionality
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
            // Only calls the service if user clicked 'Yes'
            deleteCustomerFunction(dispatch, id);
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

  // 👁️ View and ✏️ Edit Navigation
  // const handleView = (id) => navigate(`/customer/${id}`);
  const handleEdit = (id) => navigate(`/edit-customer/${id}`);

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
              placeholder="Search by name, address"
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

          {/* Project Type Filter */}
          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={projectFilter}
            onChange={(e) => {
              setProjectFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Project Types</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>

        {/* Add User */}
      <HasPermission permission={"create-customer"}>
        <Link
          to="/add-customer"
          className="btn btn-primary text-sm btn-sm px-12 py-12 radius-8 d-flex align-items-center gap-2"
          >
          <Icon
            icon="ic:baseline-plus"
            className="icon text-xl line-height-1"
            />
          Add New User
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
                <th>Name</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Type</th>
                <th>Budget</th>
                <th>Status</th>
                <HasPermission permission={["edit-customer","delete-customer"]} mode = "any">
                <th className="text-center">Action</th>
                </HasPermission>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.length > 0 ? (
                paginatedUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>
                      {String(
                        (currentPage - 1) * itemsPerPage + index + 1
                      ).padStart(2, "0")}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.phone}</td>
                    <td>{user.address}</td>
                    <td>{user.projectType}</td>
                    <td className="fw-medium text-primary">
                      {formatCurrency(user.budget)}
                    </td>
                    <td>
                      <span
                        className={`${getStatusClass(
                          user.status
                        )} px-12 py-4 radius-4 fw-medium text-sm`}
                      >
                        {user.status}
                      </span>
                    </td>
                       <HasPermission permission={["edit-customer","delete-customer"]} mode = "any">
                    <td className="text-center">

                      
                      <div className="d-flex align-items-center gap-10 justify-content-center">
                        {/* <button
                          type="button"
                          onClick={() => handleView(user.id)}
                          className="bg-info-focus bg-hover-info-200 text-info-600 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                        >
                          <Icon
                            icon="majesticons:eye-line"
                            className="icon text-xl"
                          />
                        </button> */}

                        <HasPermission permission={"edit-customer"}>

                        <button
                          type="button"
                          onClick={() => handleEdit(user.id)}
                          className="bg-success-focus text-success-600 bg-hover-success-200 fw-medium w-40-px h-40-px d-flex justify-content-center align-items-center rounded-circle"
                          >
                          <Icon icon="lucide:edit" className="menu-icon" />
                        </button>
                        </HasPermission>

              <HasPermission permission={"delete-customer"}>

                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
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
                     </HasPermission>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4">
                    No users found.
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

export default UsersListLayer;
