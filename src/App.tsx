import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PCProvider } from "@/contexts/PCContext";
import Index from "./pages/Index";
import DashboardPage from "./pages/DashboardPage";
import PCDetailsPage from "./pages/PCDetailsPage";
import PCEditPage from "./pages/PCEditPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <PCProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename="/location">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/pc/:id" element={<PCDetailsPage />} />
            <Route path="/pc/:id/edit" element={<PCEditPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </PCProvider>
  </QueryClientProvider>
);

export default App;
