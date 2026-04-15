import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePageOne from "./pages/HomePageOne";
import EmailPage from "./pages/EmailPage";
import AddUserPage from "./pages/AddUserPage";
import AssignRolePage from "./pages/AssignRolePage";
import CompanyPage from "./pages/CompanyPage";
import ErrorPage from "./pages/ErrorPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import NotificationPage from "./pages/NotificationPage";
import SignInPage from "./pages/SignInPage";
import UsersListPage from "./pages/UsersListPage";
import ViewDetailsPage from "./pages/ViewDetailsPage";
import ViewProfilePage from "./pages/ViewProfilePage";
import RouteScrollToTop from "./helper/RouteScrollToTop";
import DocumentUpload from "./pages/DocumentUpload";
import ReportPage from "./pages/ReportPage";
import ProjectListPage from "./pages/ProjectListPage";
import EditUserPageList from "./pages/EditUserListPage";
import SingleProjectPage from "./pages/SingleProjectPage";
import AddProjectPage from "./pages/AddProjectPage";
import AddStaffPage from "./pages/AddStaffPage";
import EditProjectPage from "./pages/EditProjectPage";
import StaffListPage from "./pages/StaffListPage";
import EditStaffListPage from "./pages/EditStaffListPage";
import PermissionPage from "./pages/PermissionPage";
import ProtectedRoute from "./components/ProtectedRoute";
import HasPermission from "./components/HasPermission";

function App() {
  return (
    <BrowserRouter>
      <RouteScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route exact path='/sign-in' element={<SignInPage />} />
        <Route exact path='/forgot-password' element={<ForgotPasswordPage />} />
        <Route exact path='*' element={<ErrorPage />} />

        {/* Protected Dashboard */}
        <Route exact path='/' element={
          <ProtectedRoute>
            <HasPermission permission="view-admin">
              <HomePageOne />
            </HasPermission>
          </ProtectedRoute>
        } />

        {/* Projects */}
        <Route path='/projects-list' element={<ProtectedRoute><HasPermission permission="view-projects"><ProjectListPage /></HasPermission></ProtectedRoute>} />
        <Route path='/add-projects' element={<ProtectedRoute><HasPermission permission="create-projects"><AddProjectPage /></HasPermission></ProtectedRoute>} />
        <Route path='/edit-project/:id' element={<ProtectedRoute><HasPermission permission="edit-projects"><EditProjectPage /></HasPermission></ProtectedRoute>} />
        <Route path='/projects/:id' element={<ProtectedRoute><HasPermission permission="view-projects"><SingleProjectPage /></HasPermission></ProtectedRoute>} />
        
        {/* Customers */}
        <Route path='/customers-list' element={<ProtectedRoute><HasPermission permission="view-customers"><UsersListPage /></HasPermission></ProtectedRoute>} />
        <Route path='/add-customer' element={<ProtectedRoute><HasPermission permission="create-customer"><AddUserPage /></HasPermission></ProtectedRoute>} />
        <Route path='/edit-customer/:id' element={<ProtectedRoute><HasPermission permission="edit-customer"><EditUserPageList /></HasPermission></ProtectedRoute>} />

        {/* Staff */}
        <Route path='/staff-list' element={<ProtectedRoute><HasPermission permission="view-staffs"><StaffListPage /></HasPermission></ProtectedRoute>} />
        <Route path='/add-staff' element={<ProtectedRoute><HasPermission permission="create-staff"><AddStaffPage /></HasPermission></ProtectedRoute>} />
        <Route path='/edit-staff/:id' element={<ProtectedRoute><HasPermission permission="edit-staff"><EditStaffListPage /></HasPermission></ProtectedRoute>} />

        {/* Role & Access */}
        <Route path='/role-access' element={<ProtectedRoute><HasPermission permission="manage-access"><PermissionPage /></HasPermission></ProtectedRoute>} />
        <Route path='/assign-role' element={<ProtectedRoute><HasPermission permission="manage-roles"><AssignRolePage /></HasPermission></ProtectedRoute>} />

        {/* Misc */}
        <Route path='/notification' element={<ProtectedRoute><HasPermission permission="manage-remainders"><NotificationPage /></HasPermission></ProtectedRoute>} />
        
        {/* FIXED LINE 69 BELOW */}
        <Route path='/reports' element={<ProtectedRoute><HasPermission permission="view-reports"><ReportPage /></HasPermission></ProtectedRoute>} />
        
        <Route path='/documents' element={<ProtectedRoute><HasPermission permission="view-documents"><DocumentUpload /></HasPermission></ProtectedRoute>} />
        <Route path='/view-details' element={<ProtectedRoute><ViewDetailsPage /></ProtectedRoute>} />
        <Route path='/view-profile' element={<ProtectedRoute><ViewProfilePage /></ProtectedRoute>} />
        <Route path='/company' element={<ProtectedRoute><CompanyPage /></ProtectedRoute>} />
        <Route path='/email' element={<ProtectedRoute><EmailPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;