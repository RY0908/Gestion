import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import './components/print/print.css'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore.js'
import { canDo } from '@/lib/permissions.js'
import LoginPage from '@/pages/auth/LoginPage.jsx'
import { Sidebar } from '@/components/organisms/Sidebar.jsx'
import { TopBar } from '@/components/organisms/TopBar.jsx'
const DashboardPage = lazy(() => import('@/pages/dashboard/DashboardPage.jsx'))
const AssetListPage = lazy(() => import('@/pages/assets/AssetListPage.jsx'))
const AssetDetailPage = lazy(() => import('@/pages/assets/AssetDetailPage.jsx'))
const AssetFormPage = lazy(() => import('@/pages/assets/AssetFormPage.jsx'))
const AssignmentListPage = lazy(() => import('@/pages/assignments/AssignmentListPage.jsx'))
const AssignmentDetailPage = lazy(() => import('@/pages/assignments/AssignmentDetailPage.jsx'))
const LicenseListPage = lazy(() => import('@/pages/licenses/LicenseListPage.jsx'))
const MaintenanceListPage = lazy(() => import('@/pages/maintenance/MaintenanceListPage.jsx'))
const RequestListPage = lazy(() => import('@/pages/requests/RequestListPage.jsx'))
const MyRequestsPage = lazy(() => import('@/pages/requests/MyRequestsPage.jsx'))
const RequestDetailPage = lazy(() => import('@/pages/requests/RequestDetailPage.jsx'))
const ReportsPage = lazy(() => import('@/pages/reports/ReportsPage.jsx'))
const AuditLogPage = lazy(() => import('@/pages/audit/AuditLogPage.jsx'))
const NotificationsPage = lazy(() => import('@/pages/notifications/NotificationsPage.jsx'))
const RoomsPage = lazy(() => import('@/pages/rooms/RoomsPage.jsx'))
const UsersPage = lazy(() => import('@/pages/settings/UsersPage.jsx'))
const DocsHubPage = lazy(() => import('@/pages/documents/DocsHubPage.jsx'))
const FormBonSortie = lazy(() => import('@/pages/documents/forms/FormBonSortie.jsx'))
const FormDemandeIntervention = lazy(() => import('@/pages/documents/forms/FormDemandeIntervention.jsx'))
const FormFicheIntervention = lazy(() => import('@/pages/documents/forms/FormFicheIntervention.jsx'))
const FormBonCommande = lazy(() => import('@/pages/documents/forms/FormBonCommande.jsx'))
const FormBonReception = lazy(() => import('@/pages/documents/forms/FormBonReception.jsx'))
const FormDecharge = lazy(() => import('@/pages/documents/forms/FormDecharge.jsx'))
const FormDemandeMateriel = lazy(() => import('@/pages/documents/forms/FormDemandeMateriel.jsx'))
const FormFicheInventaire = lazy(() => import('@/pages/documents/forms/FormFicheInventaire.jsx'))
const FormRapportIntervention = lazy(() => import('@/pages/documents/forms/FormRapportIntervention.jsx'))
const FormFicheBesoin = lazy(() => import('@/pages/documents/forms/FormFicheBesoin.jsx'))
const FormDemandeGarantie = lazy(() => import('@/pages/documents/forms/FormDemandeGarantie.jsx'))
import { AnimatedRoutes } from '@/components/atoms/PageTransition.jsx'
const ProfilePage = lazy(() => import('@/pages/profile/ProfilePage.jsx'))
const PreferencesPage = lazy(() => import('@/pages/settings/PreferencesPage.jsx'))

const NotFoundPage = () => <div className="p-6 h-full flex items-center justify-center text-gray-400">404 - Page Introuvable</div>
const RouteLoader = () => <div className="p-6 h-full flex items-center justify-center text-[var(--color-muted)]">Chargement...</div>

const MainLayout = ({ children }) => (
  <div className="flex h-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">
    <Sidebar />
    <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
      <TopBar />
      <main className="flex-1 overflow-y-auto w-full h-full pb-10">
        {children}
      </main>
    </div>
  </div>
)

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated)
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

const AuthorizedRoute = ({ children, roles = [], action = null }) => {
  const user = useAuthStore(s => s.user)
  const isAllowedRole = roles.length === 0 || roles.includes(user?.role)
  const isAllowedAction = !action || canDo(user?.role, action)
  if (!isAllowedRole || !isAllowedAction) return <Navigate to="/dashboard" replace />
  return children
}

// Helper to wrap routes in shared layout
const P = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>
      <Suspense fallback={<RouteLoader />}>
        <AnimatedRoutes>{children}</AnimatedRoutes>
      </Suspense>
    </MainLayout>
  </ProtectedRoute>
)

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-dark-elevated dark:text-white dark:border-dark-border border',
        success: { iconTheme: { primary: '#1B6B3A', secondary: 'white' } }
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route path="/dashboard" element={<P><DashboardPage /></P>} />
        <Route path="/assets" element={<P><AssetListPage /></P>} />
        <Route path="/assets/new" element={<P><AuthorizedRoute action="asset:create"><AssetFormPage /></AuthorizedRoute></P>} />
        <Route path="/assets/:id" element={<P><AssetDetailPage /></P>} />
        <Route path="/assets/:id/edit" element={<P><AuthorizedRoute action="asset:edit"><AssetFormPage /></AuthorizedRoute></P>} />
        <Route path="/assignments" element={<P><AuthorizedRoute action="asset:assign"><AssignmentListPage /></AuthorizedRoute></P>} />
        <Route path="/assignments/:id" element={<P><AuthorizedRoute action="asset:assign"><AssignmentDetailPage /></AuthorizedRoute></P>} />
        <Route path="/licenses" element={<P><AuthorizedRoute action="license:manage"><LicenseListPage /></AuthorizedRoute></P>} />
        <Route path="/maintenance" element={<P><AuthorizedRoute action="maintenance:manage"><MaintenanceListPage /></AuthorizedRoute></P>} />
        <Route path="/requests" element={<P><AuthorizedRoute action="request:manage"><RequestListPage /></AuthorizedRoute></P>} />
        <Route path="/requests/:id" element={<P><RequestDetailPage /></P>} />
        <Route path="/my-requests" element={<P><MyRequestsPage /></P>} />
        <Route path="/documents" element={<P><DocsHubPage /></P>} />
        <Route path="/documents/bon-sortie/nouveau" element={<P><AuthorizedRoute action="document:create"><FormBonSortie /></AuthorizedRoute></P>} />
        <Route path="/documents/demande-intervention/nouveau" element={<P><AuthorizedRoute action="document:create"><FormDemandeIntervention /></AuthorizedRoute></P>} />
        <Route path="/documents/fiche-intervention/nouveau" element={<P><AuthorizedRoute action="document:create"><FormFicheIntervention /></AuthorizedRoute></P>} />
        <Route path="/documents/bon-commande/nouveau" element={<P><AuthorizedRoute action="document:create"><FormBonCommande /></AuthorizedRoute></P>} />
        <Route path="/documents/bon-reception/nouveau" element={<P><AuthorizedRoute action="document:create"><FormBonReception /></AuthorizedRoute></P>} />
        <Route path="/documents/decharge/nouveau" element={<P><AuthorizedRoute action="document:create"><FormDecharge /></AuthorizedRoute></P>} />
        <Route path="/documents/demande-materiel/nouveau" element={<P><AuthorizedRoute action="document:create"><FormDemandeMateriel /></AuthorizedRoute></P>} />
        <Route path="/documents/inventaire/nouveau" element={<P><AuthorizedRoute action="document:create"><FormFicheInventaire /></AuthorizedRoute></P>} />
        <Route path="/documents/rapport-intervention/nouveau" element={<P><AuthorizedRoute action="document:create"><FormRapportIntervention /></AuthorizedRoute></P>} />
        <Route path="/documents/fiche-besoin/nouveau" element={<P><AuthorizedRoute action="document:create"><FormFicheBesoin /></AuthorizedRoute></P>} />
        <Route path="/documents/demande-garantie/nouveau" element={<P><AuthorizedRoute action="document:create"><FormDemandeGarantie /></AuthorizedRoute></P>} />
        <Route path="/reports" element={<P><AuthorizedRoute roles={['ADMIN']}><ReportsPage /></AuthorizedRoute></P>} />
        <Route path="/rooms" element={<P><RoomsPage /></P>} />
        <Route path="/audit-log" element={<P><AuthorizedRoute roles={['ADMIN']}><AuditLogPage /></AuthorizedRoute></P>} />
        <Route path="/notifications" element={<P><NotificationsPage /></P>} />
        <Route path="/settings/users" element={<P><AuthorizedRoute roles={['ADMIN']}><UsersPage /></AuthorizedRoute></P>} />
        <Route path="/profile" element={<P><ProfilePage /></P>} />
        <Route path="/settings/preferences" element={<P><PreferencesPage /></P>} />
        <Route path="/settings" element={<Navigate to="/settings/users" replace />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
