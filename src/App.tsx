import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { MusicProvider } from "@/contexts/MusicContext";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { GlobalClickSound } from "@/components/GlobalClickSound";
import { SettingsDialog } from "@/components/SettingsDialog";
import { VirtualPet } from "@/components/VirtualPet";
import Landing from "./pages/Landing";
import HowTo from "./pages/HowTo";
import Room from "./pages/Room";
import AdminPanel from "./pages/AdminPanel";
import DisplayBoard from "./pages/DisplayBoard";
import Privacy from "./pages/Privacy";
import AboutUs from "./pages/AboutUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

/** Floating settings button — visible on every page except /display/:code */
const GlobalSettingsButton = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/display")) return null;
  return (
    <div className="fixed top-5 right-5 z-50">
      <SettingsDialog />
    </div>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        {/* MusicProvider must be inside BrowserRouter to use useLocation */}
        <SettingsProvider>
          <MusicProvider>
            <GlobalClickSound />
            <GlobalSettingsButton />
            <VirtualPet />
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/how-to" element={<HowTo />} />
              <Route path="/room/:code" element={<Room />} />
              <Route path="/admin/:code" element={<AdminPanel />} />
              <Route path="/display/:code" element={<DisplayBoard />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/about-us" element={<AboutUs />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </MusicProvider>
        </SettingsProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;