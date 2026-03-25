import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import ProtectedRoute from "@/components/ui/ProtectedRoute";
import DashboardLayout from "@/layouts/DashboardLayout";
import AuthLayout from "@/layouts/AuthLayout";

// Auth pages
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import AcceptInvitePage from "@/pages/auth/AcceptInvitePage";

// Dashboard pages
import DashboardPage from "@/pages/dashboard/DashboardPage";
import GroupsPage from "@/pages/groups/GroupsPage";
import GroupDetailPage from "@/pages/groups/GroupDetailPage";
import ExpensesPage from "@/pages/expenses/ExpensesPage";
import AddExpensePage from "@/pages/expenses/AddExpensePage";
import BalancesPage from "@/pages/balances/BalancesPage";
import PaymentsPage from "@/pages/payments/PaymentsPage";
import ReportsPage from "@/pages/reports/ReportsPage";
import RemindersPage from "@/pages/reminders/RemindersPage";
import ProfilePage from "@/pages/settings/ProfilePage";
import LandingPage from "@/pages/LandingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/invite/accept",
    element: <AcceptInvitePage />,
  },
  {
    element: <AuthLayout />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: "dashboard", element: <DashboardPage /> },
          { path: "groups", element: <GroupsPage /> },
          { path: "groups/:groupId", element: <GroupDetailPage /> },
          { path: "groups/:groupId/expenses/add", element: <AddExpensePage /> },
          { path: "expenses", element: <ExpensesPage /> },
          { path: "balances", element: <BalancesPage /> },
          { path: "payments", element: <PaymentsPage /> },
          { path: "reports", element: <ReportsPage /> },
          { path: "reminders", element: <RemindersPage /> },
          { path: "settings/profile", element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
}
