import MasterLayout from '../masterLayout/MasterLayout'
import { Breadcrumb } from 'react-bootstrap'
import ReportLayer from '../components/ReportLayer'

const ReportPage = () => {

  return (
     <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Reports" />
        {/* InvoiceListLayer */}
        <ReportLayer />

      </MasterLayout>
  )
}

export default ReportPage;