import type { JSX } from "react";
import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { useSessionStore } from "./store/session";
import ConnectPage from "./pages/ConnectPage";
import AuthPage from "./pages/AuthPage";
import WorkspacePage from "./pages/WorkspacePage";

function RequireServer({ children }: { children: JSX.Element }) {
  const serverUrl = useSessionStore((state) => state.serverUrl);
  if (!serverUrl) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const accessToken = useSessionStore((state) => state.accessToken);
  const serverUrl = useSessionStore((state) => state.serverUrl);
  if (!serverUrl) {
    return <Navigate to="/" replace />;
  }
  if (!accessToken) {
    return <Navigate to="/auth" replace />;
  }
  return children;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <ConnectPage />,
  },
  {
    path: "/auth",
    element: (
      <RequireServer>
        <AuthPage />
      </RequireServer>
    ),
  },
  {
    path: "/app",
    element: (
      <RequireAuth>
        <WorkspacePage />
      </RequireAuth>
    ),
  },
  {
    path: "/app/:serverSlug/:channelId?",
    element: (
      <RequireAuth>
        <WorkspacePage />
      </RequireAuth>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
