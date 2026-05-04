import React, { useRef, useState } from 'react';
import { Icon } from "@iconify/react";

const DocumentUploadModal = ({ onUpload, onClose, isUploading }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // 1. We use the ref to talk directly to the HTML input
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(prev => [...prev, ...files]);
    
    const newPreviews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return null;
    });
    setPreviews(prev => [...prev, ...newPreviews]);

    // 2. IMPORTANT: Reset the input value immediately after state is updated.
    // This allows the user to re-select the same file if they delete it.
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (index) => {
    // Revoke the object URL to avoid memory leaks
    if (previews[index]) {
      URL.revokeObjectURL(previews[index]);
    }
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (selectedFiles.length === 0) return;
    onUpload(selectedFiles);
  };

  return (
    <div className="p-3">
      <div 
        className="border-dashed border-2 radius-12 p-24 text-center bg-neutral-50 mb-16"
        style={{ cursor: 'pointer' }}
        // 3. Use the ref to trigger the click instead of getElementById
        onClick={() => fileInputRef.current.click()}
      >
        <input 
          ref={fileInputRef} // 4. Attach the ref here
          id="fileInput" 
          type="file" 
          multiple 
          hidden 
          onChange={handleFileChange} 
          accept="image/*,.pdf"
        />
        <Icon icon="solar:cloud-upload-bold-duotone" width="48" className="text-primary-600 mb-8" />
        <p className="text-sm fw-bold mb-4">Click to select files</p>
        <p className="text-xs text-secondary-light">Images or PDFs or CAD (Max 10MB each)</p>
      </div>

      <div className="row g-3 max-h-300 overflow-y-auto mb-20 px-2">
        {selectedFiles.map((file, index) => (
          <div className="col-4" key={index}>
            <div className="position-relative border radius-8 bg-white shadow-sm h-100">
              <button 
                onClick={() => removeFile(index)}
                className="position-absolute btn btn-danger-600 p-0 d-flex align-items-center justify-content-center radius-circle"
                style={{ 
                  width: '20px', 
                  height: '20px', 
                  zIndex: 5,
                  top: '-8px',
                  right: '-8px'
                }}
              >
                <Icon icon="ic:round-close" width="14" />
              </button>

              <div className="overflow-hidden radius-8" style={{ height: '80px' }}>
                {previews[index] ? (
                  <img src={previews[index]} alt="preview" className="w-100 h-100 object-fit-cover" />
                ) : (
                  <div className="d-flex align-items-center justify-content-center bg-neutral-100 h-100">
                    <Icon icon="solar:document-bold-duotone" width="32" className="text-secondary-light" />
                  </div>
                )}
              </div>

              <div className="p-4 bg-white">
                <p className="text-xxs fw-bold text-truncate mb-0">{file.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="d-flex gap-2 justify-content-end">
        <button className="btn btn-neutral-200 text-neutral-600 btn-sm px-24" onClick={onClose}>Cancel</button>
        <button 
          className="btn btn-primary-600 btn-sm px-24 d-flex align-items-center gap-2" 
          disabled={selectedFiles.length === 0 || isUploading}
          onClick={handleSubmit}
        >
          {isUploading ? 'Uploading...' : 'Upload Now'}
        </button>
      </div>
    </div>
  );
};

export default DocumentUploadModal;