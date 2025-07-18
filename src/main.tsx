import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Ticket from "./pages/Ticket.tsx";
import PendingTicket from "./pages/PendingTicket.tsx";
import { Toaster } from "sonner";
import UserGhanaCardVerificationForm from "./components/UserGhanaCardVerificationForm.tsx";
import ProtectedRoute from "./components/ProtectedRoute.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/ticket" element={<Ticket />} />
        <Route
          path="/validate-user"
          element={<UserGhanaCardVerificationForm />}
        />
        <Route
          path="/pending-ticket"
          element={
            <ProtectedRoute>
              <PendingTicket />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
