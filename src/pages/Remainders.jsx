import MasterLayout from '../masterLayout/MasterLayout'
import { Breadcrumb } from 'react-bootstrap'
import NotificationLayers from './NotificationLayers'

const Remainders = () => {

  return (
     <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Remainders & Notifications" />
        {/* InvoiceListLayer */}
        <NotificationLayers />

      </MasterLayout>
  )
}

export default Remainders;