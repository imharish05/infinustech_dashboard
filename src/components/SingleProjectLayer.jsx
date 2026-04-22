import React, { useEffect, useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useSearchParams } from "react-router-dom";
import { 
  addStageFunction, 
  deleteStageDocumentFunction, 
  individualStages, 
  recordDocumentFunction, 
  recordStagePaymentFunction, 
  updateStageStatusFunction
} from "../features/stages/stageService";
import { stagePaymentCollection } from "../features/payment/paymentService";
import HasPermission from "./HasPermission";
import api from "../api/axios";
import toast from "react-hot-toast";


const SingleProjectLayer = () => {
  const dispatch = useDispatch();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      individualStages(dispatch, id);
    }
  }, [id, dispatch]);


  const [searchParams] = useSearchParams();
  const isReadOnly = searchParams.get("mode") === "view";
  const projectList = useSelector((state) => state.projects.projects) || [];
  const stages = useSelector((state) => state.stages.stage) || [];

  console.log(stages);
  

  const [customerId, setCustomerId] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isDocumentUploaded, setIsDocumentUploaded] = useState(false);
  const [forceReupload, setForceReupload] = useState(false);

  const currentProject = useMemo(() => {
    return projectList.find((proj) => (proj.id || proj._id) === id);
  }, [projectList, id]);

  console.log(currentProject);
  

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

  // Date fromat

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

  // --- CORRECTED FILE UPLOAD LOGIC ---
  const fileUpload = (stageId) => {
    const mainInput = document.createElement("input");
    mainInput.type = "file";
    mainInput.multiple = true;

    mainInput.onchange = async (e) => {
      let files = Array.from(e.target.files);
      if (files.length === 0) return;

      const renderFileList = (currentFiles) => {
        if (currentFiles.length === 0) {
          return `<div class="text-center py-20"><p class="text-danger text-sm mb-2">No files selected.</p></div>`;
        }
        return `
          <div class="mb-10 d-flex justify-content-between align-items-center px-2">
            <span class="text-xs fw-bold text-uppercase text-secondary-light">Selected (${currentFiles.length})</span>
          </div>
          ${currentFiles.map((file, index) => `
            <div class="d-flex align-items-center justify-content-between p-8 border-bottom">
              <div class="d-flex align-items-center gap-2">
                <span class="badge bg-primary-100 text-primary-600">${index + 1}</span>
                <span class="text-xs fw-bold text-truncate" style="max-width: 180px;">${file.name}</span>
              </div>
              <button type="button" class="btn btn-outline-danger btn-xs p-1 remove-file-btn" data-index="${index}">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12z"/></svg>
              </button>
            </div>`).join('')}`;
      };

      const { value: finalFiles, isConfirmed } = await Swal.fire({
        title: '<span style="font-size: 25px">Review Uploads</span>',
        width: '450px',
        html: `<div id="swal-file-container" style="max-height: 300px; overflow-y: auto; border: 1px solid #eee; border-radius: 8px;">${renderFileList(files)}</div>`,
        showCancelButton: true,
        confirmButtonText: 'Upload Now',
        didRender: () => {
          const container = document.getElementById('swal-file-container');
          container.addEventListener('click', (event) => {
            const removeBtn = event.target.closest('.remove-file-btn');
            if (removeBtn) {
              const idx = parseInt(removeBtn.getAttribute('data-index'));
              files.splice(idx, 1);
              container.innerHTML = renderFileList(files);
              if (files.length === 0) Swal.getConfirmButton().disabled = true;
            }
          });
        },
        preConfirm: async () => {
          if (files.length === 0) return Swal.showValidationMessage('Select at least one file');
          
          Swal.showLoading();
          const formData = new FormData();
          // Append each file to the same key "documents" so backend receives an array
          files.forEach((file) => formData.append("documents", file));
          formData.append("projectId", id);
          formData.append("stageId", stageId);
          formData.append("customerId", customerId);

          try {
            // Note: Ensure your recordDocumentFunction handles FormData correctly
            const success = await recordDocumentFunction(dispatch, id, stageId, customerId, formData);
            if (!success) throw new Error("Server rejected the upload");
            return files;
          } catch (error) {
            Swal.showValidationMessage(`Upload failed: ${error.message}`);
          }
        }
      });

      if (isConfirmed && finalFiles) {
        setUploadedFile(finalFiles);
        setIsDocumentUploaded(true);
        setForceReupload(false);
        Swal.fire({ icon: "success", title: '<span style="font-size: 25px">Uploaded Successfully</span>', timer: 1500, showConfirmButton: false });
      }
    };
    mainInput.click();
  };

  // --- KEEPING OTHER ACTIONS UNCHANGED ---
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
            <label class="text-xs fw-bold mb-1">Stage Name</label>
            <input id="swal-input1" class="form-control text-sm" placeholder="e.g. Fabrication">
            <div id="error-name" class="text-danger d-none" style="font-size: 11px; margin-top: 4px;">Stage name is required.</div>
          </div>
          <div class="mb-3">
            <label class="text-xs fw-bold mb-1">Description</label>
            <textarea id="swal-input2" class="form-control text-sm" rows="2" placeholder="Details..."></textarea>
            <div id="error-desc" class="text-danger d-none" style="font-size: 11px; margin-top: 4px;">Description must be added.</div>
          </div>
          <div class="row g-2">
            <div class="col-6">
               <label class="text-xs fw-bold mb-1">Stage Amount (₹)</label>
               <input id="swal-input3" type="number" class="form-control text-sm" placeholder="Max: ${remainingBudgetToAllocate}">
               <div id="error-amount" class="text-danger d-none" style="font-size: 11px; margin-top: 4px;">Invalid amount.</div>
            </div>
            <div class="col-6">
               <label class="text-xs fw-bold mb-1">Duration (Optional)</label>
               <input id="swal-input4" type="datetime-local" class="form-control text-sm">
            </div>
          </div>
        </div>`,
      preConfirm: () => {
        const name = document.getElementById('swal-input1').value.trim();
        const desc = document.getElementById('swal-input2').value.trim();
        const amt = Number(document.getElementById('swal-input3').value);
        const duration = document.getElementById('swal-input4').value;
        if (!name || !desc || !amt || amt > remainingBudgetToAllocate) {
            Swal.showValidationMessage("Please check all required fields and budget limits");
            return false;
        }
        return [name, desc, amt, duration || null];
      }
    });

    if (formValues) {
  const success = await addStageFunction(dispatch, { 
    customer_id: customerId, 
    stage_Name: formValues[0], 
    description: formValues[1], 
    amount: formValues[2],
    duration: formValues[3] || null
  }, id);

  if (success) {
    setIsDocumentUploaded(false);
    // Refresh to get the real DB IDs for the new stage
    individualStages(dispatch, id); 
  }
}
  };

const recordPayment = async (stageId, stageAmount, stagePaid) => {
  const stageRemaining = Math.max(0, Number(stageAmount) - Number(stagePaid));
  
  const { value: formValues } = await Swal.fire({
  title: '<span style="font-size: 25px">Record Payment</span>',
    html: `
      <div style="text-align: left;">
        <p style="font-size: 12px;">Balance: ${formatCurrency(stageRemaining)}</p>
        <input id="swal-payment" type="number" class="form-control mb-3" value="${stageRemaining}">
        <select id="swal-mode" class="form-select">
          <option value="online">Online</option>
          <option value="offline">Offline</option>
        </select>
      </div>`,
    preConfirm: () => {
      const paymentAmount = Number(document.getElementById('swal-payment').value);
      if (!paymentAmount || paymentAmount <= 0 || paymentAmount > stageRemaining) 
        return Swal.showValidationMessage('Invalid amount');
      
      return { 
        paymentAmount, 
        paymentMode: document.getElementById('swal-mode').value, 
      };
    }
  });

  if (formValues) {
    const payload = { 
        amount: formValues.paymentAmount, 
        payment_mode: formValues.paymentMode, 
        payment_date: new Date().toISOString(),
        customerId: customerId,
        budget: totals.cost,
        customerName: currentProject?.customerName || "N/A",
        projectName: currentProject?.projectName || "N/A",
        payment_status: (formValues.paymentAmount >= stageRemaining) ? "Paid" : "Partially Paid",
        stage_amount: stageAmount 
    };

   await recordStagePaymentFunction(dispatch,payload,stageId,id)

    // Use stagePaymentCollection as the primary recorder
    const success = await stagePaymentCollection(dispatch, payload, stageId, id);

    if (success) { 
      setIsDocumentUploaded(false); 
      setUploadedFile(null); 
      individualStages(dispatch, id);
      Swal.fire("Success", "Payment recorded successfully", "success");
    }
  }
};

  const clearFileSelection = async (stageId) => {
    const result = await Swal.fire({ title: '<span style="font-size: 25px">Are You sure ?</span>' ,text: "This will delete files from the server.", icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, delete it!" });
    if (result.isConfirmed) {
      const success = await deleteStageDocumentFunction(dispatch, id, stageId);
      if (success) { setUploadedFile(null); setIsDocumentUploaded(false); setForceReupload(true); }
    }
  };

const handleFileDownload = async (path, fileName) => {
    try {
        const token = localStorage.getItem('token'); // match your storage key
        const cleanPath = '/' + path.replace(/\\/g, '/');
        
        const response = await api.get(`http://localhost:5000${cleanPath}`, {
            responseType: 'blob',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Download Error:", error.response);
        toast.error("Download failed.");
    }
};

const openPreviewModal = (stage) => {
//     const dbPaths = stage?.documentPath ? stage.documentPath.split(',') : [];
//     if (dbPaths.length === 0) return Swal.fire("No Files", "No documents uploaded.", "info");

     const dbPaths = stage?.documentPath ? stage.documentPath.split(',') : [];
    console.log("DB Paths:", dbPaths); 

    const filesHtml = dbPaths.map((path, index) => {
        const fileName = path.split(/[\\/]/).pop();
        // Use a button instead of a direct link
        return `
            <div class="d-flex align-items-center justify-content-between p-2 border-bottom">
                <span class="text-xs text-truncate" style="max-width: 200px;">${index + 1}. ${fileName}</span>
                <button onclick="downloadFile('${path}', '${fileName}')" class="btn btn-xs btn-outline-primary">
                    Download
                </button>
            </div>`;
    }).join('');

    // Attach function to window so the Swal HTML can find it
    window.downloadFile = (path, fileName) => handleFileDownload(path, fileName);

    Swal.fire({ 
        title: '<span style="font-size: 25px">Project Documents</span>',
        html: `<div class="text-start">${filesHtml}</div>`, 
        showConfirmButton: false 
    });
};



const updateStatus = async (stageId, currentStatus) => {
  const { value: newStatus } = await Swal.fire({
    title: '<span style="font-size: 25px">Update Status</span>',
    input: 'select',
    inputOptions: { 
      'Initialized': 'Initialized', 
      'In Progress': 'In Progress', 
      'Completed': 'Completed' 
    },
    inputValue: currentStatus,
    showCancelButton: true,
    // Add these properties to style the input
    inputAttributes: {
      style: "border: 1px solid #d1d5db; border-radius: 8px; padding: 8px;"
    },
    customClass: {
      input: 'form-control shadow-none' // This uses your existing Bootstrap/CSS classes
    },
    // Optional: Ensure the border stands out on focus
    didOpen: () => {
      const input = Swal.getInput();
      input.style.border = "1px solid #4e73df"; // A nice primary blue border
      input.style.display = "block";
      input.style.width = "90%";
      input.style.margin = "10px auto";
    }
  });

  if (newStatus && newStatus !== currentStatus) {
    await updateStageStatusFunction(dispatch, { status: newStatus }, stageId, id);
  }
};

  return (
    <div className="p-12 p-md-24 bg-base radius-12 shadow-sm border">
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center gap-3 mb-24">
        <div>
          <h5 className="mb-4 text-primary-900">{currentProject?.projectName || "Project Progress"}</h5>
          <p className="text-secondary-light text-sm mb-0">Project tracking for {currentProject?.projectName}</p>
        </div>
        <HasPermission permission={"manage-payment"}>
          {!isReadOnly && (
            <button onClick={addNewStage} className="btn btn-primary-600 btn-sm d-flex align-items-center gap-2 radius-8">
              <Icon icon="ic:baseline-plus" /> Add Stage
            </button>
          )}
        </HasPermission>
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
              const status = stage.payment_status || "pending";
              const isDanger = ["pending", "partially paid"].includes(status);

              return (
                <div key={stage.id} className={`position-relative ps-24 ps-sm-32 ${index !== stagesList.length - 1 ? 'mb-32' : ''}`}>
                  <div className={`position-absolute rounded-circle ${isCompleted ? 'bg-success-main shadow-lg' : 'bg-neutral-400'}`}
                    style={{ left: "0", top: "6px", width: "14px", height: "14px", zIndex: 1, border: "3px solid white" }}></div>

                  <div className="row align-items-start gy-3">
                    <div className="col-xl-6 col-lg-7">
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <h6 className={`mb-0 text-md fw-bold ${isCompleted ? 'text-success-main' : ''}`}>{stage.stage_Name}</h6>
                        <div className={`d-flex align-items-center gap-2 px-12 py-4 radius-4 border ${
                          stage.status === 'Completed' ? 'bg-success-50 text-success-600' :
                          stage.status === 'In Progress' ? 'bg-warning-50 text-warning-600' : 'bg-info-50 text-info-600'
                        }`} style={{width: "max-content"}}>
                          <span className="text-xxs fw-bold text-uppercase">{stage.status || 'Initialized'}</span>
                        </div>
                        <HasPermission permission={"upload-docs"}>
                          {index === activeStageIndex && !isReadOnly && (
                            <button onClick={() => updateStatus(stage.id, stage.status || 'Initialized')} className="btn p-0 border-0 text-primary-light">
                              <Icon icon="lucide:edit-3" width="14" />
                            </button>
                          )}
                        </HasPermission>
                      </div>
                      <p className="text-secondary-light text-sm mb-12">{stage.description}</p>
                      {
                        stage.duration ? 
                        <p className="text-secondary-light text-sm mb-12">Due : {formatDate(stage.duration)}</p>
                        : null
                      }

                      
                      <div className="d-flex flex-column flex-md-row gap-4">
                        {index === activeStageIndex && (
                          <div className="d-flex flex-wrap gap-2">
                            {(isDocumentUploaded || (stage.documentPath && !forceReupload)) ? (
                              <>
                                <HasPermission permission={"upload-docs"}>
                                  {!isReadOnly && (
                                    <button onClick={() => openPreviewModal(stage)} className="btn btn-success-100 text-success-600 btn-sm text-xs px-12 py-4  d-flex align-items-center gap-2">
                                      <Icon icon="solar:documents-bold" /> View Docs
                                    </button>
                                  )}
                                </HasPermission>
                                <HasPermission permission={"upload-docs"}>
                                  {!isReadOnly && (
                                    <button onClick={() => clearFileSelection(stage.id)} className="btn btn-danger-100 text-danger-600 btn-sm p-4">
                                      <Icon icon="ic:round-close" />
                                    </button>
                                  )}
                                </HasPermission>
                              </>
                            ) : (
                              <HasPermission permission={"upload-docs"}>
                                {!isReadOnly && (
                                  <button onClick={() => fileUpload(stage.id)} className="btn btn-primary-600 btn-md py-4 px-12 text-xs radius-4 d-flex align-items-center gap-2">
                                    <Icon icon="solar:upload-bold" /> Upload
                                  </button>
                                )}
                              </HasPermission>
                            )}
                            <HasPermission permission={"manage-payment"}>
                              {!isReadOnly && (
                                <button onClick={() => recordPayment(stage.id, goal, paid)} className="btn btn-success-600 btn-sm py-4 px-12 text-xs radius-4" disabled={!isDocumentUploaded && (!stage.documentPath || forceReupload)}>
                                  Record Payment
                                </button>
                              )}
                            </HasPermission>
                          </div>
                        )}
                      </div>
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