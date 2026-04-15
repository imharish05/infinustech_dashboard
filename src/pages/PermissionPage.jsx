import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import PermissionManagement from "../components/PermissionManagement";


const PermissionPage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Permissions" />

        {/* UsersListLayer */}
        <PermissionManagement />

      </MasterLayout>

    </>
  );
};

export default PermissionPage; 
