import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { ToastProvider } from './components/ui/Toast'
import { LoginPage } from './pages/LoginPage'
import { HomePage } from './pages/HomePage'
import { CustomersPage } from './pages/CustomersPage'
import { CustomerDetailPage } from './pages/CustomerDetailPage'
import { VisitCreatePage } from './pages/VisitCreatePage'
import { CalendarPage } from './pages/CalendarPage'
import { BroadcastPage } from './pages/BroadcastPage'
import { VisitsPage } from './pages/VisitsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
})

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/customers/:id" element={<CustomerDetailPage />} />
              <Route
                path="/customers/:id/visits/new"
                element={<VisitCreatePage />}
              />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/broadcast" element={<BroadcastPage />} />
              <Route path="/visits" element={<VisitsPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  )
}
