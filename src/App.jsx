import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './components/print/print.css'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore.js'
import LoginPage from '@/pages/auth/LoginPage.jsx'
import { Sidebar } from '@/components/organisms/Sidebar.jsx'
import { TopBar } from '@/components/organisms/TopBar.jsx'
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx'
import AssetListPage from '@/pages/assets/AssetListPage.jsx'
import AssetDetailPage from '@/pages/assets/AssetDetailPage.jsx'
import AssetFormPage from '@/pages/assets/AssetFormPage.jsx'
import AssignmentListPage from '@/pages/assignments/AssignmentListPage.jsx'
import LicenseListPage from '@/pages/licenses/LicenseListPage.jsx'
import MaintenanceListPage from '@/pages/maintenance/MaintenanceListPage.jsx'
import RequestListPage from '@/pages/requests/RequestListPage.jsx'
import ReportsPage from '@/pages/reports/ReportsPage.jsx'
import AuditLogPage from '@/pages/audit/AuditLogPage.jsx'
import NotificationsPage from '@/pages/notifications/NotificationsPage.jsx'
import RoomsPage from '@/pages/rooms/RoomsPage.jsx'
import UsersPage from '@/pages/settings/UsersPage.jsx'
import DocsHubPage from '@/pages/documents/DocsHubPage.jsx'
import FormBonSortie from '@/pages/documents/forms/FormBonSortie.jsx'
import FormDemandeIntervention from '@/pages/documents/forms/FormDemandeIntervention.jsx'
import FormFicheIntervention from '@/pages/documents/forms/FormFicheIntervention.jsx'
import FormBonCommande from '@/pages/documents/forms/FormBonCommande.jsx'
import FormBonReception from '@/pages/documents/forms/FormBonReception.jsx'
import FormDecharge from '@/pages/documents/forms/FormDecharge.jsx'
import FormDemandeMateriel from '@/pages/documents/forms/FormDemandeMateriel.jsx'
import FormFicheInventaire from '@/pages/documents/forms/FormFicheInventaire.jsx'
import FormRapportIntervention from '@/pages/documents/forms/FormRapportIntervention.jsx'
import FormFicheBesoin from '@/pages/documents/forms/FormFicheBesoin.jsx'
import FormDemandeGarantie from '@/pages/documents/forms/FormDemandeGarantie.jsx'
import { AnimatedRoutes } from '@/components/atoms/PageTransition.jsx'

const NotFoundPage = () => <div className="p-6 h-full flex items-center justify-center text-gray-400">404 - Page Introuvable</div>

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

// Helper to wrap routes in shared layout
const P = ({ children }) => (
  <ProtectedRoute>
    <MainLayout>
      <AnimatedRoutes>{children}</AnimatedRoutes>
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
        <Route path="/assets/new" element={<P><AssetFormPage /></P>} />
        <Route path="/assets/:id" element={<P><AssetDetailPage /></P>} />
        <Route path="/assets/:id/edit" element={<P><AssetFormPage /></P>} />
        <Route path="/assignments" element={<P><AssignmentListPage /></P>} />
        <Route path="/licenses" element={<P><LicenseListPage /></P>} />
        <Route path="/maintenance" element={<P><MaintenanceListPage /></P>} />
        <Route path="/requests" element={<P><RequestListPage /></P>} />
        <Route path="/documents" element={<P><DocsHubPage /></P>} />
        <Route path="/documents/bon-sortie/nouveau" element={<P><FormBonSortie /></P>} />
        <Route path="/documents/demande-intervention/nouveau" element={<P><FormDemandeIntervention /></P>} />
        <Route path="/documents/fiche-intervention/nouveau" element={<P><FormFicheIntervention /></P>} />
        <Route path="/documents/bon-commande/nouveau" element={<P><FormBonCommande /></P>} />
        <Route path="/documents/bon-reception/nouveau" element={<P><FormBonReception /></P>} />
        <Route path="/documents/decharge/nouveau" element={<P><FormDecharge /></P>} />
        <Route path="/documents/demande-materiel/nouveau" element={<P><FormDemandeMateriel /></P>} />
        <Route path="/documents/inventaire/nouveau" element={<P><FormFicheInventaire /></P>} />
        <Route path="/documents/rapport-intervention/nouveau" element={<P><FormRapportIntervention /></P>} />
        <Route path="/documents/fiche-besoin/nouveau" element={<P><FormFicheBesoin /></P>} />
        <Route path="/documents/demande-garantie/nouveau" element={<P><FormDemandeGarantie /></P>} />
        <Route path="/reports" element={<P><ReportsPage /></P>} />
        <Route path="/rooms" element={<P><RoomsPage /></P>} />
        <Route path="/audit-log" element={<P><AuditLogPage /></P>} />
        <Route path="/notifications" element={<P><NotificationsPage /></P>} />
        <Route path="/settings/users" element={<P><UsersPage /></P>} />
        <Route path="/settings" element={<Navigate to="/settings/users" replace />} />

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}