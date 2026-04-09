import React from 'react'
import DocumentUploadLayer from '../components/DocumentUploadLayer'
import MasterLayout from '../masterLayout/MasterLayout'
import { Breadcrumb } from 'react-bootstrap'

const DocumentUpload = () => {

  return (
     <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Upload Documents" />
        {/* InvoiceListLayer */}
        <DocumentUploadLayer />

      </MasterLayout>
  )
}

export default DocumentUpload