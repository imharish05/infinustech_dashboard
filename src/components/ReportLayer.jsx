import React, { useState, useMemo, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { Icon } from "@iconify/react";
import * as XLSX from "xlsx";
import { Link } from "react-router-dom";

const ReportLayer = () => {
  const payments = useSelector((state) => state.payments.payments) || [];
  const projects = useSelector((state) => state.projects.projects) || [];

  // Filter States
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [projectSearchTerm, setProjectSearchTerm] = useState("");
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const startDateRef = useRef(null);
  const endDateRef = useRef(null);

const filteredProjectOptions = useMemo(() => {
    // Collect all unique project IDs from payments
    const projectIdsWithPayments = new Set(payments.map(p => p.projectId));

    console.log(projectIdsWithPayments,"Sample");
    
    
    return projects
        .filter(p => {
            const pId = p.id || p._id; // Normalize the ID
            return projectIdsWithPayments.has(pId);
        })
        .filter(p =>
            (p.projectName || "").toLowerCase().includes(projectSearchTerm.toLowerCase())
        );
}, [projects, payments, projectSearchTerm]);
  // Main filter logic
  const reportData = useMemo(() => {
    return payments
      .map((pay) => ({
        ...pay,
        formattedDate: pay.payment_date ? pay.payment_date.split("T")[0] : "",
      }))
      .filter((item) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          (item.customerName || "").toLowerCase().includes(search) ||
          (item.projectName || "").toLowerCase().includes(search);

        const matchesProject = !selectedProjectId || String(item.projectId) === String(selectedProjectId);

        const matchesStartDate = !startDate || item.formattedDate >= startDate;
        const matchesEndDate = !endDate || item.formattedDate <= endDate;

        return matchesSearch && matchesProject && matchesStartDate && matchesEndDate;
      });
  }, [payments, searchTerm, selectedProjectId, startDate, endDate]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProjectId, startDate, endDate, itemsPerPage]);

  const totalPages = Math.ceil(reportData.length / itemsPerPage);

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return reportData.slice(start, start + itemsPerPage);
  }, [reportData, currentPage, itemsPerPage]);

  // Summary totals for current filtered data
  const totals = useMemo(() => {
    return reportData.reduce(
      (acc, item) => ({
        totalAmount: acc.totalAmount + (Number(item.amount) || 0),
        totalBudget: acc.totalBudget + (Number(item.budget) || 0),
      }),
      { totalAmount: 0, totalBudget: 0 }
    );
  }, [reportData]);

  const formatCurrency = (val) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStartDate("");
    setEndDate("");
    setSelectedProjectId("");
    setProjectSearchTerm("");
    setCurrentPage(1);
    // Clear the actual input values
    if (startDateRef.current) startDateRef.current.value = "";
    if (endDateRef.current) endDateRef.current.value = "";
  };

  const handleExport = () => {
    const exportData = reportData.map((item) => ({
      "Customer Name": item.customerName,
      "Project Name": item.projectName,
      "Payment Mode": item.payment_mode,
      "Total Budget": item.budget,
      "Payment Amount": item.amount,
      "Stage Goal": item.stage_amount,
      Status: item.payment_status,
      Date: item.formattedDate,
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Payments");
    XLSX.writeFile(wb, "Payment_Collection_Report.xlsx");
  };

  const isFiltered = searchTerm || selectedProjectId || startDate || endDate;

  return (
    <div className="card h-100 p-0 radius-12 shadow-sm border">
      {/* Header */}
      <div className="card-header border-bottom bg-base py-16 px-24 d-flex align-items-center flex-wrap gap-3 justify-content-between">
        <div className="d-flex align-items-center flex-wrap gap-3">
          <select
            className="form-select form-select-sm w-auto ps-12 radius-12 h-40-px"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
          >
            {[5, 10, 20, 50, 100].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>

          <div className="navbar-search position-relative">
            <input
              type="text"
              className="bg-base h-40-px w-auto border radius-8"
              placeholder="Search customer or project..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Icon
              icon="ion:search-outline"
              className="icon position-absolute end-0 me-12 top-50 translate-middle-y text-secondary-light"
            />
          </div>
        </div>

        <div className="d-flex gap-2">
          {isFiltered && (
            <button
              onClick={handleClearFilters}
              className="btn btn-outline-danger text-sm btn-sm px-16 py-10 radius-8 d-flex align-items-center gap-2"
            >
              <Icon icon="lucide:x" className="text-xl" />
              Clear Filters
            </button>
          )}
          <button
            onClick={handleExport}
            className="btn btn-success-600 text-sm btn-sm px-16 py-10 radius-8 d-flex align-items-center gap-2"
          >
            <Icon icon="lucide:file-spreadsheet" className="text-xl" />
            Export Excel
          </button>
        </div>
      </div>

      <div className="card-body p-24">
        {/* Filters Row */}
        <div className="row gy-3 mb-24 pb-24 border-bottom">
          {/* Project Dropdown */}
          <div className="col-lg-4 position-relative">
            <label className="form-label text-sm fw-semibold">Filter by Project</label>
            <div className="position-relative">
              <input
                type="text"
                className="form-control radius-8 h-40-px"
                placeholder="Type to search project..."
                value={projectSearchTerm}
                onFocus={() => setIsProjectDropdownOpen(true)}
                onBlur={() => setTimeout(() => setIsProjectDropdownOpen(false), 200)}
                onChange={(e) => {
                  setProjectSearchTerm(e.target.value);
                  // If user clears the input, also clear the selected project filter
                  if (e.target.value === "") {
                    setSelectedProjectId("");
                  }
                }}
              />
              {selectedProjectId && (
                <button
                  className="position-absolute end-0 me-12 top-50 translate-middle-y border-0 bg-transparent p-0"
                  onClick={() => {
                    setSelectedProjectId("");
                    setProjectSearchTerm("");
                  }}
                >
                  <Icon icon="lucide:x" className="text-danger" />
                </button>
              )}
              {!selectedProjectId && (
                <Icon
                  icon="lucide:chevron-down"
                  className="position-absolute end-0 me-12 top-50 translate-middle-y text-muted"
                />
              )}
            </div>

            {isProjectDropdownOpen && (
              <ul
                className="position-absolute w-100 mt-1 bg-white radius-8 shadow-lg z-3 overflow-auto border"
                style={{ maxHeight: "200px", listStyle: "none", padding: 0 }}
              >
                <li
                  className="p-10 border-bottom cursor-pointer hover-bg-primary-50 text-primary-600 fw-bold"
                  onMouseDown={() => {
                    setSelectedProjectId("");
                    setProjectSearchTerm("");
                  }}
                >
                  All Projects
                </li>
                {filteredProjectOptions.length > 0 ? (
                  filteredProjectOptions.map((p) => (
                    <li
  key={p.id || p._id}
  className="p-10 border-bottom cursor-pointer hover-bg-primary-50"
  onMouseDown={() => {
    const pId = p.id || p._id;
    setSelectedProjectId(pId);
    setProjectSearchTerm(p.projectName); // This fills the input with the name
    setIsProjectDropdownOpen(false);
  }}
>
                      <div className="fw-medium text-sm">{p.projectName}</div>
                      <small className="text-muted">{p.customerName}</small>
                    </li>
                  ))
                ) : (
                  <li className="p-10 text-center text-secondary-light text-sm">
                    No projects found
                  </li>
                )}
              </ul>
            )}
          </div>

          {/* From Date */}
          <div className="col-lg-4">
            <label className="form-label text-sm fw-semibold">From Date</label>
            <input
              ref={startDateRef}
              type="date"
              className="form-control radius-8 h-40-px"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          {/* To Date */}
          <div className="col-lg-4">
            <label className="form-label text-sm fw-semibold">To Date</label>
            <input
              ref={endDateRef}
              type="date"
              className="form-control radius-8 h-40-px"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {/* Summary Cards */}
        {isFiltered && (
          <div className="row gy-3 mb-24">
            <div className="col-md-3">
              <div className="card shadow-none border bg-gradient-start-2 p-16">
                <p className="text-sm fw-medium text-primary-light mb-1">Filtered Records</p>
                <h6 className="mb-0 text-md">{reportData.length}</h6>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card shadow-none border bg-gradient-start-1 p-16">
                <p className="text-sm fw-medium text-primary-light mb-1">Total Collected</p>
                <h6 className="mb-0 text-md text-success-main">{formatCurrency(totals.totalAmount)}</h6>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive scroll-sm">
          <table className="table bordered-table sm-table mb-0">
            <thead>
              <tr>
                <th className="text-sm">S.No</th>
                <th className="text-sm">Customer Details</th>
                <th className="text-sm">Project & Mode</th>
                <th className="text-sm">Total Budget</th>
                <th className="text-sm">Payment Amount</th>
                <th className="text-sm">Status</th>
                <th className="text-sm text-center">Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((item, i) => (
                  <tr key={item.id || i}>
                    <td>{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="fw-bold text-secondary-light">{item.customerName}</span>
                        <span className="text-xs text-muted">Cust ID: {item.customerId}</span>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <h6 className="text-sm mb-0">{item.projectName}</h6>
                        <span className="text-xs text-uppercase fw-bold text-primary-600">
                          {item.payment_mode}
                        </span>
                      </div>
                    </td>
                    <td className="fw-semibold text-secondary-light">
                      {formatCurrency(item.budget)}
                    </td>
                    <td>
                      <div className="d-flex flex-column">
                        <span className="text-success-600 fw-bold">{formatCurrency(item.amount)}</span>
                        <small className="text-muted" style={{ fontSize: "10px" }}>
                          Stage Goal: {formatCurrency(item.stage_amount)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <Link to={`/projects/${item.projectId}?mode=view`}>
                        <span
                          className={`px-12 py-4 radius-4 fw-bold text-xxs text-uppercase border ${
                            item.payment_status === "Paid"
                              ? "bg-success-50 text-success-600 border-success-100"
                              : "bg-warning-50 text-warning-600 border-warning-100"
                          }`}
                        >
                          {item.payment_status}
                        </span>
                      </Link>
                    </td>
                    <td className="text-center">
                      <span className="badge bg-neutral-200 text-neutral-600 border border-neutral-400 px-12 py-6 radius-8">
                        {item.formattedDate || "N/A"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-40">
                    <Icon icon="solar:document-text-outline" className="display-4 text-neutral-300" />
                    <p className="text-secondary-light mt-2">No payment collection records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-24">
            <p className="text-sm text-secondary-light mb-0">
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, reportData.length)} to{" "}
              {Math.min(currentPage * itemsPerPage, reportData.length)} of {reportData.length} entries
            </p>
            <div className="d-flex align-items-center gap-2">
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(1)}
              >
                «
              </button>
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                Previous
              </button>

              {/* Page number buttons — show at most 5 pages around current */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (page) =>
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 2
                )
                .reduce((acc, page, idx, arr) => {
                  if (idx > 0 && page - arr[idx - 1] > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((page, idx) =>
                  page === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-8 text-secondary-light">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`btn btn-sm ${currentPage === page ? "btn-primary" : "btn-light"}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  )
                )}

              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
              </button>
              <button
                className="btn btn-sm btn-light"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(totalPages)}
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportLayer;