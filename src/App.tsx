import { Suspense, lazy } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { RouteFallback } from '@/components/RouteFallback'
import { Login } from '@/routes/Login'

const Dashboard = lazy(() => import('@/routes/Dashboard').then((m) => ({ default: m.Dashboard })))

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<RouteFallback />}>
            <Dashboard />
          </Suspense>
        ),
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
