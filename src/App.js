import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Layout & Components
import ProtectedLayout from "./components/ProtectedLayout";
import HasPermission from "./components/HasPermission";
import RouteScrollToTop from "./helper/RouteScrollToTop";

// Pages
import HomePageOne from "./pages/HomePageOne";
import AddUserPage from "./pages/AddUserPage";
import ErrorPage from "./pages/ErrorPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import SignInPage from "./pages/SignInPage";
import UsersListPage from "./pages/UsersListPage";
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
import NotificationAlertPage from "./pages/NotificationAlertPage";
// Services
import { loadUserFunction } from "./features/auth/authService";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadUserFunction(dispatch);
    } else {
      dispatch({ type: 'auth/setInitialized' });
    }
  }, [dispatch]);

  return (
    <BrowserRouter basename="infinus">
      <Toaster position="top-center" reverseOrder={false} />
      <RouteScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path='/sign-in' element={<SignInPage />} />
        <Route path='/forgot-password' element={<ForgotPasswordPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedLayout />}>
        <Route path='*' element={<ErrorPage />} />
          <Route path='/' element={<HasPermission permission="view-admin"><HomePageOne /></HasPermission>} />
          <Route path='/projects-list' element={<HasPermission permission="view-projects"><ProjectListPage /></HasPermission>} />
          <Route path='/add-projects' element={<HasPermission permission="create-projects"><AddProjectPage /></HasPermission>} />
          <Route path='/edit-project/:id' element={<HasPermission permission="edit-projects"><EditProjectPage /></HasPermission>} />
          <Route path='/projects/:id' element={<HasPermission permission="view-projects"><SingleProjectPage /></HasPermission>} />
          <Route path='/customers-list' element={<HasPermission permission="view-customers"><UsersListPage /></HasPermission>} />
          <Route path='/add-customer' element={<HasPermission permission="create-customer"><AddUserPage /></HasPermission>} />
          <Route path='/edit-customer/:id' element={<HasPermission permission="edit-customer"><EditUserPageList /></HasPermission>} />
          <Route path='/staff-list' element={<HasPermission permission="view-staffs"><StaffListPage /></HasPermission>} />
          <Route path='/add-staff' element={<HasPermission permission="create-staff"><AddStaffPage /></HasPermission>} />
          <Route path='/edit-staff/:id' element={<HasPermission permission="edit-staff"><EditStaffListPage /></HasPermission>} />
          <Route path='/role-access' element={<HasPermission permission="manage-access"><PermissionPage /></HasPermission>} />
          <Route path='/remainders' element={<HasPermission permission="manage-remainders"><NotificationAlertPage /></HasPermission>} />
          <Route path='/reports' element={<HasPermission permission="view-reports"><ReportPage /></HasPermission>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;