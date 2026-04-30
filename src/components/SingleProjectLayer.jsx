import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams, Link } from "react-router-dom";
import withReactContent from 'sweetalert2-react-content';
import { 
  addStageFunction, 
  deleteStageDocumentFunction, 
  fetchAllStagesForStats, 
  individualStages, 
  recordDocumentFunction, 
  updateStageStatusFunction
} from "../features/stages/stageService";
import { stagePaymentCollection } from "../features/payment/paymentService";
import HasPermission from "./HasPermission";
import api from "../api/axios";
import toast from "react-hot-toast";
import DocumentUploadModal from "./DocumentUploadModal";

const SingleProjectLayer = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

useEffect(() => {
  if (id) {
         individualStages(dispatch, id);
      fetchAllStagesForStats(dispatch);
  }
}, [id, dispatch]);

  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get("mode") === "view";
  const projectList = useSelector((state) => state.projects.projects) || [];
  const stages = useSelector((state) => state.stages.stage) || [];

  const [customerId, setCustomerId] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);

  // ✅ Per-stage maps instead of single booleans
  const [isDocumentUploaded, setIsDocumentUploaded] = useState({});
  const [forceReupload, setForceReupload] = useState({});

  const MySwal = withReactContent(Swal);

  const currentProject = useMemo(() => {
    return projectList.find((proj) => (proj.id || proj._id) === id);
  }, [projectList, id]);

  useEffect(() => {
    if (currentProject?.customerId) {
      setCustomerId(currentProject.customerId);
    }
  }, [currentProject]);

  const activeProjectProgress = useMemo(() => {
    return stages.find(item => item.projectId === id);
  }, [stages, id]);

  const stagesList = activeProjectProgress?.stages || [];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const totals = useMemo(() => {
    const projectBudget = Number(currentProject?.project_Budget || currentProject?.cost || 0);
    const totalCollected = stagesList.reduce((acc, stage) => acc + (Number(stage?.paid) || 0), 0);
    const totalPending = stagesList.reduce((acc, stage) => {
      const goal = Number(stage?.amount) || 0;
      const paid = Number(stage?.paid) || 0;
      return acc + Math.max(0, goal - paid);
    }, 0);
    return { cost: projectBudget, paid: totalCollected, balance: totalPending };
  }, [stagesList, currentProject]);

  const activeStageIndex = useMemo(() => {
    return stagesList.findIndex(s => {
      const goal = Number(s?.amount) || 0;
      const paid = Number(s?.paid) || 0;
      return paid < goal;
    });
  }, [stagesList]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const fileUpload = async (stageId) => {
    MySwal.fire({
      title: '<span style="font-size: 25px">Upload Stage Documents</span>',
      width: '500px',
      showConfirmButton: false,
      html: (
        <DocumentUploadModal
          isUploading={false}
          onClose={() => MySwal.close()}
          onUpload={async (files) => {
            MySwal.showLoading();
            const formData = new FormData();
            formData.append("projectId", id);
            formData.append("stageId", stageId);
            formData.append("customerId", customerId);
            files.forEach(file => formData.append("documents", file));
            try {
              const success = await recordDocumentFunction(dispatch, id, stageId, customerId, formData);
              if (success) {
                // ✅ Per-stage update
                setIsDocumentUploaded(prev => ({ ...prev, [stageId]: true }));
                setForceReupload(prev => ({ ...prev, [stageId]: false }));
                await individualStages(dispatch, id);
                MySwal.fire({ icon: 'success', title: 'Success', text: 'Documents uploaded!', timer: 1500 });
              }
            } catch (error) {
              toast.error("Upload failed");
              MySwal.close();
            }
          }}
        />
      )
    });
  };

  const addNewStage = async () => {
    const totalAllocated = stagesList.reduce((acc, s) => acc + (Number(s.amount) || 0), 0);
    const remainingBudgetToAllocate = Number(totals.cost) - totalAllocated;

    if (remainingBudgetToAllocate <= 0) {
      Swal.fire("Full", "Total budget has already been allocated to stages.", "info");
      return;
    }

    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 25px">Add New Stage</span>',
      width: window.innerWidth < 500 ? '95%' : '450px',
      html: `
        <div class="text-start">
          <p class="text-primary-600 fw-bold mb-10" style="font-size: 12px;">Available to Allocate: ${formatCurrency(remainingBudgetToAllocate)}</p>
          <div class="mb-3">
            <label class="text-xs fw-bold mb-1">Stage Name *</label>
            <input id="swal-input1" class="form-control text-sm" placeholder="e.g. Architecture Design ">
            <div id="error-name" class="text-danger d-none" style="font-size: 11px; margin-top: 4px; font-weight: 500;">Stage name is required.</div>
          </div>
          <div class="mb-3">
            <label class="text-xs fw-bold mb-1">Description *</label>
            <textarea id="swal-input2" class="form-control text-sm" rows="2" placeholder="Details..."></textarea>
            <div id="error-desc" class="text-danger d-none" style="font-size: 11px; margin-top: 4px; font-weight: 500;">Description must be added.</div>
          </div>
          <div class="row g-2">
            <div class="col-6">
               <label class="text-xs fw-bold mb-1">Stage Amount (₹) *</label>
               <input id="swal-input3" type="number" class="form-control text-sm" placeholder="Max: ${remainingBudgetToAllocate}">
               <div id="error-amount" class="text-danger d-none" style="font-size: 11px; margin-top: 4px; font-weight: 500;">Invalid amount or exceeds budget.</div>
            </div>
            <div class="col-6">
               <label class="text-xs fw-bold mb-1">Duration (Optional)</label>
               <input id="swal-input4" type="datetime-local" class="form-control text-sm">
            </div>
          </div>
        </div>`,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value.trim();
        const desc = document.getElementById('swal-input2').value.trim();
        const amt = Number(document.getElementById('swal-input3').value);
        const duration = document.getElementById('swal-input4').value;

        document.getElementById('error-name').classList.add('d-none');
        document.getElementById('error-desc').classList.add('d-none');
        document.getElementById('error-amount').classList.add('d-none');

        let hasError = false;
        if (!name) { document.getElementById('error-name').classList.remove('d-none'); hasError = true; }
        if (!desc) { document.getElementById('error-desc').classList.remove('d-none'); hasError = true; }
        if (!amt || amt <= 0 || amt > remainingBudgetToAllocate) { document.getElementById('error-amount').classList.remove('d-none'); hasError = true; }

        if (hasError) return false;
        return [name, desc, amt, duration || null];
      }
    });

    if (formValues) {
      const success = await addStageFunction(dispatch, {
        customer_id: customerId,
        stage_Name: formValues[0],
        payment_status: "Pending",
        description: formValues[1],
        amount: formValues[2],
        duration: formValues[3]
      }, id);

      if (success) {
        // ✅ Reset all stage upload states on new stage add
        setIsDocumentUploaded({});
        await individualStages(dispatch, id);
      }
    }
  };

  const updateStatus = async (stageId, currentStatus, skipModal = false) => {
    let newStatus = "";

    if (skipModal) {
      newStatus = currentStatus;
    } else {
      const { value: selectedStatus } = await Swal.fire({
        title: '<span style="font-size: 25px">Update Status</span>',
        input: 'select',
        inputOptions: {
          'Initialized': 'Initialized',
          'In Progress': 'In Progress',
          'Completed': 'Completed'
        },
        inputValue: currentStatus,
        inputAttributes: { style: "border: 1px solid #d1d5db; border-radius: 8px; padding: 8px;" },
        customClass: { input: 'form-control shadow-none' },
        showCancelButton: true,
        didOpen: () => {
          const input = Swal.getInput();
          input.style.border = "1px solid #4e73df";
          input.style.display = "block";
          input.style.width = "90%";
          input.style.margin = "10px auto";
        }
      });
      newStatus = selectedStatus;
    }

    if (newStatus && newStatus !== currentStatus) {
      await updateStageStatusFunction(dispatch, { status: newStatus }, stageId, id);
      await fetchAllStagesForStats(dispatch);
      await individualStages(dispatch, id);
      return true;
    }
    return false;
  };

  const recordPayment = async (stageId, stageAmount, stagePaid) => {
    const stageRemaining = Math.max(0, Number(stageAmount) - Number(stagePaid));

    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 25px">Record Payment</span>',
      html: `
        <div style="text-align: left;">
          <p style="font-size: 12px;" class="fw-bold text-secondary-light">Balance: ${formatCurrency(stageRemaining)}</p>
          <div class="mb-3">
            <label class="text-xs fw-bold mb-1">Amount to Pay</label>
            <input id="swal-payment" type="number" class="form-control" value="${stageRemaining}">
            <div id="error-payment" class="text-danger d-none" style="font-size: 11px; margin-top: 4px; font-weight: 500;">Please enter a valid amount within the balance.</div>
          </div>
          <label class="text-xs fw-bold mb-1">Payment Mode</label>
          <select id="swal-mode" class="form-select">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>`,
      showCancelButton: true,
      focusConfirm: false,
      preConfirm: () => {
        const paymentAmount = Number(document.getElementById('swal-payment').value);
        const paymentMode = document.getElementById('swal-mode').value;
        document.getElementById('error-payment').classList.add('d-none');
        if (!paymentAmount || paymentAmount <= 0 || paymentAmount > stageRemaining) {
          document.getElementById('error-payment').classList.remove('d-none');
          return false;
        }
        return { paymentAmount, paymentMode };
      }
    });

    if (formValues) {
      Swal.showLoading();

      const isFullPayment = formValues.paymentAmount >= stageRemaining;

      const payload = {
        amount: formValues.paymentAmount,
        payment_mode: formValues.paymentMode,
        payment_date: new Date().toISOString(),
        customerId: customerId,
        budget: totals.cost,
        customerName: currentProject?.customerName || "N/A",
        projectName: currentProject?.projectName || "N/A",
        payment_status: isFullPayment ? "Paid" : "Partially Paid",
        stage_amount: stageAmount
      };

      const success = await stagePaymentCollection(dispatch, payload, stageId, id);

      if (success) {
        if (isFullPayment) {
          await updateStageStatusFunction(dispatch, { status: "Completed" }, stageId, id, true);
        }

        // ✅ Per-stage reset on payment
        setIsDocumentUploaded(prev => ({ ...prev, [stageId]: false }));
        setUploadedFile(null);
        await individualStages(dispatch, id);
        await fetchAllStagesForStats(dispatch);

        Swal.fire({
          icon: "success",
          title: isFullPayment
            ? '<span style="font-size:20px">✅ Stage Completed!</span>'
            : '<span style="font-size:20px">Payment Recorded</span>',
          text: isFullPayment
            ? "Payment complete. Stage has been marked as Completed."
            : "Partial payment recorded successfully.",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    }
  };

  const clearFileSelection = async (stageId) => {
    const result = await Swal.fire({
      title: '<span style="font-size: 25px">Are You sure ?</span>',
      text: "This will delete files from the server.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    });
    if (result.isConfirmed) {
      const success = await deleteStageDocumentFunction(dispatch, id, stageId);
      if (success) {
        setUploadedFile(null);
        // ✅ Per-stage reset on delete
        setIsDocumentUploaded(prev => ({ ...prev, [stageId]: false }));
        setForceReupload(prev => ({ ...prev, [stageId]: true }));
      }
    }
  };

  const openPreviewModal = (stage) => {
    const dbPaths = stage?.documentPath
      ? stage.documentPath.split(',').filter(path => path.trim() !== '' && path.includes('.'))
      : [];

    if (dbPaths.length === 0) return Swal.fire("No Files", "No documents uploaded.", "info");

    const baseUrl = process.env.REACT_APP_IMG_URL;
    const token = localStorage.getItem('token');

    const filesHtml = dbPaths.map((pathStr, index) => {
      const cleanPath = pathStr.trim().replace(/\\/g, '/').replace(/^\//, '');
      const fullPath = cleanPath.includes('/') ? cleanPath : `uploads/stages/${cleanPath}`;
      const fileName = cleanPath.split('/').pop();
      const fileExt = fileName.split('.').pop().toLowerCase();
      return `
        <div class="preview-item" style="display:flex;align-items:center;justify-content:space-between;padding:12px;border-bottom:1px solid #f0f0f0;gap:10px;">
          <div style="display:flex;align-items:center;gap:10px;min-width:0;flex:1;">
            <span style="font-size:20px;">${['pdf'].includes(fileExt) ? '📄' : '🖼️'}</span>
            <div style="min-width:0;">
              <p style="margin:0;font-size:13px;font-weight:600;color:#1a1a2e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${fileName}</p>
            </div>
          </div>
          <div style="display:flex;gap:6px;">
            <button class="btn-preview-trigger" data-path="${fullPath}" data-ext="${fileExt}"
              style="background:#e8f4ff;color:#185FA5;border:none;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;">
              Preview
            </button>
            <button class="btn-download-trigger" data-path="${fullPath}" data-name="${fileName}"
              style="background:#f0fdf4;color:#16a34a;border:none;border-radius:6px;padding:6px 12px;font-size:11px;font-weight:600;cursor:pointer;">
              Download
            </button>
          </div>
        </div>`;
    }).join('');

    MySwal.fire({
      title: '<span style="font-size: 25px">Stage Documents</span>',
      html: `<div id="swal-files-container">${filesHtml}</div>`,
      showConfirmButton: false,
      showCloseButton: true,
      didRender: () => {
        const content = MySwal.getHtmlContainer();
        content.querySelectorAll('.btn-preview-trigger').forEach(btn => {
          btn.onclick = () => {
            executePreview(btn.getAttribute('data-path'), btn.getAttribute('data-ext'), baseUrl, token);
          };
        });
        content.querySelectorAll('.btn-download-trigger').forEach(btn => {
          btn.onclick = () => {
            handleFileDownload(btn.getAttribute('data-path'), btn.getAttribute('data-name'), baseUrl, token);
          };
        });
      }
    });
  };

  const executePreview = async (cleanPath, ext, baseUrl, token) => {
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const fullUrl = `${baseUrl}/${encodedPath}`;
    const isImage = ['jpg', 'jpeg', 'png', 'webp'].includes(ext);

    const tid = toast.loading("Loading...");
    try {
      const res = await fetch(fullUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      toast.dismiss(tid);
      MySwal.fire({
        html: isImage
          ? `<img src="${blobUrl}" style="max-width:100%; max-height:70vh; object-fit:contain; border-radius:8px; display:block; margin:auto;" />`
          : `<iframe src="${blobUrl}#toolbar=0" width="100%" height="500px" style="border:none; border-radius:8px;"></iframe>`,
        width: isImage ? '600px' : '850px',
        padding: '16px',
        showConfirmButton: false,
        showCloseButton: true,
        customClass: { popup: 'swal-preview-popup', closeButton: 'swal-preview-close' },
        didClose: () => URL.revokeObjectURL(blobUrl)
      });
    } catch (err) {
      toast.dismiss(tid);
      toast.error("Preview failed.");
    }
  };

  const handleFileDownload = async (cleanPath, fileName, baseUrl, token) => {
    const encodedPath = cleanPath.split('/').map(segment => encodeURIComponent(segment)).join('/');
    const tid = toast.loading("Downloading...");
    try {
      const res = await fetch(`${baseUrl}/${encodedPath}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.dismiss(tid);
    } catch (error) {
      toast.dismiss(tid);
      toast.error("Download failed.");
    }
  };

  if (!currentProject && projectList.length > 0) {
    return (
      <div className="d-flex align-items-center justify-content-center flex-grow-1 w-100" style={{ minHeight: '70vh' }}>
        <div className="text-center p-48 bg-base radius-12 shadow-sm border w-100 max-w-600">
          <div className="d-flex justify-content-center mb-24">
            <div className="bg-danger-50 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '120px', height: '120px' }}>
              <Icon icon="solar:shield-warning-bold-duotone" className="text-danger-main" width="80" />
            </div>
          </div>
          <h3 className="text-primary-900 mb-12 fw-bold">Project Unavailable</h3>
          <p className="text-secondary-light text-lg mb-32 mx-auto" style={{ maxWidth: '400px' }}>
            We couldn't find the project details. It may have been moved, deleted.
          </p>
          <div className="d-flex justify-content-center">
            <Link to="/projects-list" className="btn btn-primary-600 btn-lg d-flex align-items-center gap-3 px-32 radius-8">
              <Icon icon="lucide:arrow-left" width="20" />
              <span>Return to Project Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-12 p-md-24 bg-base radius-12 shadow-sm border">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-24">
        <div>
          <h5 className="mb-4 text-primary-900 text-capitalize">{currentProject?.projectName || "Project Progress"}</h5>
          <p className="text-secondary-light text-sm mb-0">Project tracking for {currentProject?.projectName}</p>
        </div>
  <div className="d-flex align-items-center gap-2">
  <HasPermission permission={"manage-payment"}>
    {!isReadOnly && (
      <button onClick={addNewStage} className="btn btn-primary-600 btn-sm d-flex align-items-center gap-2 radius-8">
        <Icon icon="ic:baseline-plus" /> Add Stage
      </button>
    )}
  </HasPermission>
    <button
    onClick={() => { individualStages(dispatch, id); fetchAllStagesForStats(dispatch); }}
    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2 radius-8"
    title="Refresh"
  >
    <Icon icon="lucide:refresh-cw" width="15" />
  </button>
</div>
      </div>

      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 gy-4 mb-32">
        {[
          { label: "Total Fees", val: totals.cost, color: "bg-gradient-start-1" },
          { label: "Total Collected", val: totals.paid, color: "bg-gradient-start-2", text: "text-success-main" },
          { label: "Stage Outstanding", val: totals.balance, color: "bg-gradient-start-5", text: "text-danger-main" },
          { label: "Remaining Balance", val: totals.cost - totals.paid, color: "bg-gradient-start-4", text: "text-warning" }
        ].map((item, i) => (
          <div className="col" key={i}>
            <div className={`card shadow-none border ${item.color} p-16 h-100`}>
              <p className="fw-medium text-primary-light mb-1 text-sm text-uppercase">{item.label}</p>
              <h6 className={`mb-0 text-md ${item.text || ''}`}>{formatCurrency(item.val)}</h6>
            </div>
          </div>
        ))}
      </div>

      <div className="position-relative ms-4 ms-sm-12">
        {stagesList.length > 0 ? (
          <>
            <div className="position-absolute h-100 border-start border-2 border-neutral-200" style={{ left: "6px", top: "0" }}></div>
            {stagesList.map((stage, index) => {
              const goal = Number(stage.amount) || 0;
              const paid = Number(stage.paid) || 0;
              const pending = Math.max(0, goal - paid);
              const isCompleted = paid >= goal;

              // ✅ Per-stage doc/reupload state lookups
              const stageDocUploaded = isDocumentUploaded[stage.id] || false;
              const stageForceReupload = forceReupload[stage.id] || false;
              const hasDocument = stageDocUploaded || (stage.documentPath && !stageForceReupload);

              return (
                <div key={stage.id} className={`position-relative ps-24 ps-sm-32 ${index !== stagesList.length - 1 ? 'mb-32' : ''}`}>
                  <div
                    className={`position-absolute rounded-circle ${isCompleted ? 'bg-success-main shadow-lg' : 'bg-neutral-400'}`}
                    style={{ left: "0", top: "6px", width: "14px", height: "14px", zIndex: 1, border: "3px solid white" }}
                  ></div>

                  <div className="row align-items-start gy-3">
                    <div className="col-xl-6 col-lg-7">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className={`mb-0 text-md fw-bold ${isCompleted ? 'text-success-main' : ''}`}>{stage.stage_Name}</h6>
                        <div className={`d-flex align-items-center gap-2 px-12 py-4 radius-4 border ${
                          stage.status === 'Completed' ? 'bg-success-50 text-success-600' :
                          stage.status === 'In Progress' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600'
                        }`} style={{ width: "max-content" }}>
                          <span className="text-xxs fw-bold text-uppercase">{stage.status || 'Initialized'}</span>
                        </div>
                        <HasPermission permission={"change-status"}>
  {!isReadOnly && (
    <button
      onClick={() => !isCompleted && updateStatus(stage.id, stage.status || 'Initialized')}
      className={`btn p-0 border-0 ${isCompleted ? 'text-neutral-300' : 'text-primary-light'}`}
      disabled={isCompleted}
      title={isCompleted ? "Stage completed" : "Edit status"}
    >
      <Icon icon="lucide:edit-3" width="14" />
    </button>
  )}
</HasPermission>
                      </div>
                      <p className="text-secondary-light text-sm mb-12">{stage.description}</p>
                      {stage.duration && <p className="text-secondary-light text-sm mb-12">Due : {formatDate(stage.duration)}</p>}

                      {!isReadOnly && (
                        <div className="d-flex flex-wrap gap-2">
                          {isCompleted ? (
                            // ✅ Stage fully paid — show only View Docs if document exists
                            <>
                                  {hasDocument ? (
      <HasPermission permission={"upload-docs"}>
        <button
          onClick={() => openPreviewModal(stage)}
          className="btn btn-success-100 text-success-600 btn-sm text-xs px-12 py-4 d-flex align-items-center gap-2"
        >
          <Icon icon="solar:documents-bold" /> View Docs
        </button>
      </HasPermission>
    ) : (
      <HasPermission permission={"upload-docs"}>
        <button
          onClick={() => fileUpload(stage.id)}
          className="btn btn-primary-600 btn-md py-4 px-12 text-xs radius-4 d-flex align-items-center gap-2"
        >
          <Icon icon="solar:upload-bold" /> Upload
        </button>
      </HasPermission>
    )}
                            </>
                          ) : (
                            // ✅ Stage not yet fully paid — show upload + record payment
                            <>
                              {hasDocument ? (
                                <>
                                  <HasPermission permission={"upload-docs"}>
                                    <button
                                      onClick={() => openPreviewModal(stage)}
                                      className="btn btn-success-100 text-success-600 btn-sm text-xs px-12 py-4 d-flex align-items-center gap-2"
                                    >
                                      <Icon icon="solar:documents-bold" /> View Docs
                                    </button>
                                  </HasPermission>
                                  <HasPermission permission={"upload-docs"}>
                                    <button
                                      onClick={() => clearFileSelection(stage.id)}
                                      className="d-flex align-items-center justify-content-center btn btn-danger-100 text-danger-600 btn-sm p-4"
                                    >
                                      <Icon icon="ic:round-close" />
                                    </button>
                                  </HasPermission>
                                </>
                              ) : (
                                <HasPermission permission={"upload-docs"}>
                                  <button
                                    onClick={() => fileUpload(stage.id)}
                                    className="btn btn-primary-600 btn-md py-4 px-12 text-xs radius-4 d-flex align-items-center gap-2"
                                  >
                                    <Icon icon="solar:upload-bold" /> Upload
                                  </button>
                                </HasPermission>
                              )}
                              <HasPermission permission={"manage-payment"}>
                                <button
                                  onClick={() => recordPayment(stage.id, goal, paid)}
                                  className="btn btn-success-600 btn-sm py-4 px-12 text-xs radius-4"
                            
                                >
                                  Record Payment
                                </button>
                              </HasPermission>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <HasPermission permission={"view-stages"}>
                      <div className="col-xl-6 col-lg-5">
                        <div className="d-flex bg-neutral-50 p-12 radius-8 border">
                          <div className="text-center flex-fill border-end">
                            <p className="text-sm text-neutral-500 fw-bold mb-1">GOAL</p>
                            <p className="text-md fw-bold mb-0">{formatCurrency(goal)}</p>
                          </div>
                          <div className="text-center flex-fill border-end px-1">
                            <p className="text-sm text-neutral-500 fw-bold mb-1">PAID</p>
                            <p className="text-md fw-bold mb-0 text-success-main">{formatCurrency(paid)}</p>
                          </div>
                          <div className="text-center flex-fill ps-1">
                            <p className="text-sm text-neutral-500 fw-bold mb-1">PENDING</p>
                            <p className={`text-md fw-bold mb-0 ${pending > 0 ? 'text-danger-main' : 'text-success-main'}`}>{formatCurrency(pending)}</p>
                          </div>
                        </div>
                      </div>
                    </HasPermission>
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <div className="text-center py-40 bg-neutral-50 radius-12 border border-dashed">
            <p className="text-secondary-light mb-0">No stages created.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SingleProjectLayer;