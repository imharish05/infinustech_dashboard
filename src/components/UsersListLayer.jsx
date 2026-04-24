import React, { useState, useMemo, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { allCustomerFunction, deleteCustomerFunction } from "../features/customers/customerService";
import Swal from "sweetalert2";
import HasPermission from "./HasPermission";

const UsersListLayer = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 1. Redux Selectors
  const { 
    customers: customerList, 
    totalPages: serverTotalPages 
  } = useSelector((state) => state.customers);
  const projectList = useSelector((state) => state.projects.projects);
  const staffList = useSelector((state) => state.staffs.staffs);
  const { user } = useSelector((state) => state.auth);

  // 2. Local State
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // 3. Fetch data on mount and pagination change
  useEffect(() => {
    allCustomerFunction(dispatch, currentPage, itemsPerPage);
  }, [dispatch, currentPage, itemsPerPage]);

  // --- ROLE AND ASSIGNMENT FILTER LOGIC ---
  const isAdmin = user?.role?.toLowerCase() === "admin" || user?.role?.toLowerCase() === "super admin";

  // Identify the internal staff record ID for the logged-in user
  const myStaffId = useMemo(() => {
    if (isAdmin) return null;
    const record = (staffList || []).find(s => String(s.userId) === String(user?.id));
    return record?.id;
  }, [staffList, user, isAdmin]);

  // 4. Optimized Filtering Logic using Hash Map
  const filteredUsers = useMemo(() => {
    let list = customerList || [];

    // STAFF/DESIGNER RESTRICTION: O(1) Lookup Strategy
    if (!isAdmin) {
      if (!myStaffId) return []; // Security: No staff record found

      const assignedMap = {};
      // Build map of customers assigned to this staff member
      (projectList || []).forEach(proj => {
        if (String(proj.assignedStaffId) === String(myStaffId)) {
          assignedMap[proj.customerId] = true;
        }
      });
      
      // Filter list using the map
      list = list.filter(customer => assignedMap[customer.id]);
    }

    // Apply Search Filter
    const lowerSearch = searchTerm.toLowerCase();
    return list.filter((u) => {
      const name = u?.name || "";
      const address = u?.address || "";
      const phone = u?.phone || "";
      return (
        name.toLowerCase().includes(lowerSearch) ||
        address.toLowerCase().includes(lowerSearch) ||
        phone.includes(searchTerm)
      );
    });
  }, [customerList, searchTerm, isAdmin, myStaffId, projectList]);

  // --- HELPERS & ACTIONS ---
  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-success-focus text-success-600 border border-success-main";
      case "inactive": return "bg-neutral-200 text-neutral-600 border border-neutral-400";
      default: return "bg-neutral-200 text-neutral-600 border border-neutral-400";
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: '<span style="font-size: 25px text-primary-900">Are you sure?</span>',
      text: "You won't be able to revert this! Deleting this customer will clear all associated reports, payments, stages, and document uploads.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ea8b0c",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, cancel",
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        deleteCustomerFunction(dispatch, id);
      }
    });
  };

  const handleEdit = (id) => navigate(`/edit-customer/${id}`);

  return (
    <div className="card h-100 p-0 radius-12 shadow-sm border-0">
      {/* Header Section */}
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <span className="text-md fw-medium text-secondary-light">Show</span>
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
              className="bg-base h-40-px w-auto ps-40-px radius-8 border"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
            <Icon icon="ion:search-outline" className="icon position-absolute start-0 ms-12 top-50 translate-middle-y text-secondary-light" />
          </div>
        </div>

        <HasPermission permission={"create-customer"}>
          <Link to="/add-customer" className="btn btn-primary text-sm btn-sm px-16 py-10 radius-8 d-flex align-items-center gap-2">
            <Icon icon="ic:baseline-plus" className="text-xl" />
            Add New Customer
          </Link>
        </HasPermission>
      </div>

      {/* Table Section */}
      <div className="card-body p-24">
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th scope="col">S.No</th>
                <th scope="col">Customer Name</th>
                <th scope="col">Contact Info</th>
                <th scope="col">Address</th>
                <th scope="col">Status</th>
                <HasPermission permission={["edit-customer", "delete-customer"]} mode="any">
                  <th scope="col" className="text-center">Action</th>
                </HasPermission>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((item, index) => (
                  <tr key={item.id}>
                    <td>{String((currentPage - 1) * itemsPerPage + index + 1).padStart(2, "0")}</td>
                    <td>
                      <h6 className="text-md mb-0 fw-medium text-primary-light text-capitalize">{item.name}</h6>
                    </td>
                    <td className="text-secondary-light">{item.phone}</td>
                    <td className="text-capitalize text-secondary-light text-truncate" style={{maxWidth: '250px'}}>{item.address}</td>
                    <td>
                      <span className={`${getStatusClass(item.status)} px-12 py-4 radius-4 fw-medium text-xs`}>
                        {item.status}
                      </span>
                    </td>
                    
                    <HasPermission permission={["edit-customer", "delete-customer"]} mode="any">
                      <td>
                        <div className="d-flex align-items-center gap-10 justify-content-center">
                          <HasPermission permission={"edit-customer"}>
                            <button 
                              onClick={() => handleEdit(item.id)} 
                              className="bg-success-focus text-success-600 bg-hover-success-200 w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle border-0 transition-all"
                            >
                              <Icon icon="lucide:edit" width="14" />
                            </button>
                          </HasPermission>
                          <HasPermission permission={"delete-customer"}>
                            <button 
                              onClick={() => handleDelete(item.id)} 
                              className="bg-danger-focus bg-hover-danger-200 text-danger-600 w-32-px h-32-px d-flex justify-content-center align-items-center rounded-circle border-0 transition-all"
                            >
                              <Icon icon="fluent:delete-24-regular" width="14" />
                            </button>
                          </HasPermission>
                        </div>
                      </td>
                    </HasPermission>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-80">
                    <div className="d-flex flex-column align-items-center">
                      <div className="bg-neutral-50 p-24 radius-circle mb-16">
                        <Icon icon="solar:users-group-two-rounded-bold-duotone" className="text-neutral-300" width="60" />
                      </div>
                      <h6 className="text-secondary-light">No Customers Assigned</h6>
                      <p className="text-sm text-neutral-400" style={{maxWidth: '300px'}}>
                        Your account currently has no customers linked to your assigned projects.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Section */}
        {serverTotalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-24">
            <span className="text-sm text-secondary-light">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length}
            </span>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-outline-neutral-300 radius-8 px-12"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                Previous
              </button>
              
              <div className="d-flex gap-1">
                {[...Array(serverTotalPages)].map((_, i) => (
                  <button
                    key={i}
                    className={`btn btn-sm w-32-px h-32-px p-0 radius-8 ${currentPage === i + 1 ? "btn-primary" : "btn-outline-neutral-200"}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                className="btn btn-sm btn-outline-neutral-300 radius-8 px-12"
                disabled={currentPage === serverTotalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersListLayer;