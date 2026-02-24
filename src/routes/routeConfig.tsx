import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { paths } from '../common/constants/routes';
import MainRoutes from './mainRoutes';
import PrivateRoute from './private-route';
import FleetDetails from '../pages/insurer/fleet-details';
import ErrorBoundary from '../common/components/ErrorBoundary';
import { ServiceWorkerProvider } from './serviceWorkerProvider';

const LoginPage = React.lazy(() => import('../pages/loginpage/login-page'));
const Profile = React.lazy(() => import('../pages/profile'));
const ForgotPassword = React.lazy(() => import('../pages/forgot-password'));
const ResetPassword = React.lazy(() => import('../pages/reset-password'));
const NotFoundPage = React.lazy(() => import('../pages/not-found'));

//Admin routes
const AdminHome = React.lazy(() => import('../pages/admin/user-management'));
const AdminHelpCenter = React.lazy(() => import('../pages/admin/help-center/landing'));
const AdminHelpCenterCreateContent = React.lazy(() => import('../pages/admin/help-center/create-draft'));
const AdminHelpCenterViewContent = React.lazy(() => import('../pages/admin/help-center/view-published-contents'));
const AdminHelpCenterAllDrafts = React.lazy(() => import('../pages/admin/help-center/all-drafts'));
const AdminHelpCenterPreviewDraft = React.lazy(() => import('../pages/admin/help-center/preview-draft'));
const SettingsHome = React.lazy(() => import('../pages/admin/settings'));
const InsuranceHome = React.lazy(() => import('../pages/admin/Insurance'));
const AdminFleets = React.lazy(() => import('../pages/admin/fleets'));
const AdminFLeetDetails = React.lazy(() => import('../pages/admin/fleet-details'));
const AdminDevices = React.lazy(() => import('../pages/admin/devices-list'));
const AdminDrivers = React.lazy(() => import('../pages/admin/drivers'));
const AdminVehicles = React.lazy(() => import('../pages/admin/vehicles'));
const AdMINTRIPLIST = React.lazy(() => import('../pages/admin/trip-list'));

// Fleet manager routes
const Dashboard = React.lazy(() => import('../pages/dashboard/dashboard'));
const FleetTracking = React.lazy(() => import('../pages/fleet-tracking'));
const Vehicles = React.lazy(() => import('../pages/vehicles-list'));
const VehicleDetails = React.lazy(() => import('../pages/vehicle-details'));
const TripDetails = React.lazy(() => import('../pages/trip-details'));
const DriversList = React.lazy(() => import('../pages/drivers-list'));
const DriversDetails = React.lazy(() => import('../pages/drivers-details'));
const DevicesList = React.lazy(() => import('../pages/devices-list'));
const TripList = React.lazy(() => import('../pages/trip-list'));
const EventsList = React.lazy(() => import('../pages/events-list'));
const EventsDetails = React.lazy(() => import('../pages/events-details'));
const DashboardSetting = React.lazy(() => import('../pages/settings'));
const SupportScreen = React.lazy(() => import('../pages/support'));
const NotificationsScreen = React.lazy(() => import('../pages/notifications'));
const FMReportsScreen = React.lazy(() => import('../pages/reports'));
const UserManagement = React.lazy(() => import('../pages/user-management'));
const FmCreateReport = React.lazy(() => import('../pages/create-report'));
const Ifta = React.lazy(() => import('../pages/ifta'));
const FMHELPCENTER = React.lazy(() => import('../pages/help-center'));
const FMHelpCenterViewContent = React.lazy(() => import('../pages/help-center'));
const DocumentCenter = React.lazy(() => import('../pages/documentcenter'));

// Insurer routes
const InsurerDashboard = React.lazy(() => import('../pages/insurer/dashboard'));
const InsurerFleets = React.lazy(() => import('../pages/insurer/fleets'));
const InsurerDevices = React.lazy(() => import('../pages/insurer/devices-list'));
const INSURERTRIPLIST = React.lazy(() => import('../pages/insurer/trip-list'));
const INSURERTRIPDETAILS = React.lazy(() => import('../pages/insurer/trip-details'));
const INSURERSUPPORT = React.lazy(() => import('../pages/insurer/support'));
const INSURERREPORTDETAILS = React.lazy(() => import('../pages/insurer/reports-details'));
const InsurerReportsScreen = React.lazy(() => import('../pages/insurer/reports'));
const InsurerUserManagement = React.lazy(() => import('../pages/insurer/user-management'));
const InsurerCreateReport = React.lazy(() => import('../pages/insurer/create-report'));
const INUSRERFNOLLIST = React.lazy(() => import('../pages/insurer/fnol-list'));
const INSURERFNOLDETAILS = React.lazy(() => import('../pages/insurer/fnol-details'));
const INSURERDEVICEVIDEOMANAGEMENT = React.lazy(() => import('../pages/insurer/video-management'));
const INSURERDEVICEVIDEOMANAGEMENTFOOTAGE = React.lazy(
  () => import('../pages/insurer/video-management/dashcam-footage')
);
const INSURERHELPCENTER = React.lazy(() => import('../pages/insurer/help-center'));
const INSURERNOTIFICATIONS = React.lazy(() => import('../pages/insurer/notifications'));
const InsurerHelpCenterViewContent = React.lazy(() => import('../pages/insurer/help-center'));
const Setting = React.lazy(() => import('../pages/insurer/settings'));

export default function routeConfig() {
  return (
    <BrowserRouter>
      <ServiceWorkerProvider>
        <ErrorBoundary>
          <Suspense fallback={<MainRoutes />}>
            <Routes>
              {/* Public Routes */}
              <Route path={paths.LOGIN} element={<LoginPage />} />
              <Route path={paths.FORGOTPASSWORD} element={<ForgotPassword />} />
              <Route path={paths.RESETPASSWORD} element={<ResetPassword />} />

              {/* Admin Routes */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route element={<MainRoutes />}>
                  <Route path={paths.ADMIN} element={<AdminHome />} />
                  <Route path={paths.SETTINGS} element={<SettingsHome />} />
                  <Route path={paths.HELPCENTER} element={<AdminHelpCenter />} />
                  <Route path={paths.HELPCENTER} element={<AdminHelpCenter />} />
                  <Route path={paths.HELPCENTERCREATECONTENT} element={<AdminHelpCenterCreateContent />} />
                  <Route
                    path={`${paths.HELPCENTERVIEWCONTENT}/:publishedId`}
                    element={<AdminHelpCenterViewContent />}
                  />
                  <Route path={paths.HELPCENTERALLDRAFTS} element={<AdminHelpCenterAllDrafts />} />
                  <Route path={`${paths.HELPCENTERPREVIEW}/:draftId`} element={<AdminHelpCenterPreviewDraft />} />
                  <Route path={paths.INSURANCE} element={<InsuranceHome />} />
                  <Route path={paths.ADMINFLEETS} element={<AdminFleets />} />
                  <Route path={`${paths.ADMINFLEETDETAILS}/:fleetId`} element={<AdminFLeetDetails />} />
                  <Route path={paths.ADMINVEHICLES} element={<AdminVehicles />} />
                  <Route path={`${paths.AdMINVEHICLEDETAILS}/:vin`} element={<VehicleDetails />} />
                  <Route path={paths.ADMINDEVICES} element={<AdminDevices />} />
                  <Route path={`${paths.ADMINVIDEOMANAGEMENT}/:deviceId`} element={<INSURERDEVICEVIDEOMANAGEMENT />} />
                  <Route
                    path={`${paths.ADMINVIDEOMANAGEMENT}/:deviceId/dashcam-footage/:requestId`}
                    element={<INSURERDEVICEVIDEOMANAGEMENTFOOTAGE />}
                  />
                  <Route path={paths.ADMINDRIVERS} element={<AdminDrivers />} />
                  <Route path={paths.ADMINTRIPLIST} element={<AdMINTRIPLIST />} />
                  <Route path={`${paths.ADMINDRIVERSDETAILS}/:driverId`} element={<DriversDetails />} />
                  <Route path={`${paths.ADMINTRIPDETAILS}/:tripId`} element={<INSURERTRIPDETAILS />} />
                </Route>
              </Route>

              {/* FM Routes */}
              <Route element={<PrivateRoute allowedRoles={['fleetManager', 'fleetManagerSuperUser']} />}>
                <Route element={<MainRoutes />}>
                  <Route path={paths.DASHBOARD} element={<Dashboard />} />
                  <Route path={paths.TRIPLIST} element={<TripList />} />
                  <Route path={paths.FLEETTRACKING} element={<FleetTracking />} />
                  <Route path={paths.VEHICLES} element={<Vehicles />} />
                  <Route path={`${paths.VEHICLEDETAILS}/:vin`} element={<VehicleDetails />} />
                  <Route path={paths.EVENTSLIST} element={<EventsList />} />
                  <Route path={`${paths.EVENTSDETAILS}/:eventId`} element={<EventsDetails />} />
                  <Route path={paths.DRIVERSLIST} element={<DriversList />} />
                  <Route path={`${paths.DRIVERSDETAILS}/:driverId`} element={<DriversDetails />} />
                  <Route path={paths.DEVICESLSIT} element={<DevicesList />} />
                  <Route path={`${paths.FMVIDEOMANAGEMENT}/:deviceId`} element={<INSURERDEVICEVIDEOMANAGEMENT />} />
                  <Route
                    path={`${paths.FMVIDEOMANAGEMENT}/:deviceId/dashcam-footage/:requestId`}
                    element={<INSURERDEVICEVIDEOMANAGEMENTFOOTAGE />}
                  />
                  <Route path={paths.DASHBOARDSETTINGS} element={<DashboardSetting />} />
                  <Route path={paths.SUPPORTSCREEN} element={<SupportScreen />} />
                  <Route path={paths.FMREPORTSSCREEN} element={<FMReportsScreen />} />
                  <Route path={paths.FMCREATEREPORT} element={<FmCreateReport />} />
                  <Route path={paths.USERMANAGEMENT} element={<UserManagement />} />
                  <Route path={paths.IFTA} element={<Ifta />} />
                  <Route path={paths.FMHELPCENTER} element={<FMHELPCENTER />} />
                  <Route path={`${paths.FMHELPCENTERVIEWCONTENT}/:publishedId`} element={<FMHelpCenterViewContent />} />
                  <Route path={paths.DOCUMENTCENTER} element={<DocumentCenter />} />
                </Route>
              </Route>

              {/* Insurer Routes */}
              <Route element={<PrivateRoute allowedRoles={['insurer', 'insurerSuperUser']} />}>
                <Route element={<MainRoutes />}>
                  <Route path={paths.INSURERDASHBOARD} element={<InsurerDashboard />} />
                  <Route path={paths.FLEETS} element={<InsurerFleets />} />
                  <Route path={`${paths.FLEETDETAILS}/:fleetId`} element={<FleetDetails />} />
                  <Route path={paths.INSURERSUPPORT} element={<INSURERSUPPORT />} />
                  <Route path={paths.INSURERDEVICES} element={<InsurerDevices />} />
                  <Route path={paths.INSURERTRIPLIST} element={<INSURERTRIPLIST />} />
                  <Route path={`${paths.INSURERREPORTDETAILS}/:reportId`} element={<INSURERREPORTDETAILS />} />
                  <Route path={paths.INSURERREPORTSSCREEN} element={<InsurerReportsScreen />} />
                  <Route path={`${paths.INSURERTRIPDETAILS}/:tripId`} element={<INSURERTRIPDETAILS />} />
                  <Route path={paths.INSURERUSERMANAGEMENT} element={<InsurerUserManagement />} />
                  <Route path={paths.INSURERCREATEREPORT} element={<InsurerCreateReport />} />
                  <Route path={paths.INSURERFNOLLIST} element={<INUSRERFNOLLIST />} />
                  <Route path={`${paths.INSURERFNOLDETAILS}/:eventId`} element={<INSURERFNOLDETAILS />} />
                  <Route
                    path={`${paths.INSURERVIDEOMANAGEMENT}/:deviceId`}
                    element={<INSURERDEVICEVIDEOMANAGEMENT />}
                  />
                  <Route path={paths.INSURERSETTINGS} element={<Setting />} />
                  <Route
                    path={`${paths.INSURERVIDEOMANAGEMENT}/:deviceId/dashcam-footage/:requestId`}
                    element={<INSURERDEVICEVIDEOMANAGEMENTFOOTAGE />}
                  />
                  <Route path={paths.INSURERHELPCENTER} element={<INSURERHELPCENTER />} />
                  <Route path={paths.INSURERNOTIFICATIONS} element={<INSURERNOTIFICATIONS />} />
                  <Route
                    path={`${paths.INSURERHELPCENTERVIEWCONTENT}/:publishedId`}
                    element={<InsurerHelpCenterViewContent />}
                  />
                </Route>
              </Route>

              <Route element={<PrivateRoute />}>
                <Route element={<MainRoutes />}>
                  <Route path={paths.PROFILE} element={<Profile />} />
                  <Route path={`${paths.TRIPDETAILS}/:tripId`} element={<TripDetails />} />
                  <Route path={paths.NOTIFICATIONSCREEN} element={<NotificationsScreen />} />
                </Route>
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </ServiceWorkerProvider>
    </BrowserRouter>
  );
}
