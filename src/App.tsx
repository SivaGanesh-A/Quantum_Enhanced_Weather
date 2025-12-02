import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      {/* Global notifications */}
      <Toaster />
      <Sonner />

      {/* Full-screen weather shell */}
      <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Ambient weather decoration: always behind content */}
        {/* You can conditionally render these later based on weather */}
        <div className="pointer-events-none absolute inset-0">
          {/* Sunny orb (top-right) */}
          <div className="sun-orb top-8 right-10 hidden md:block" />

          {/* Clouds */}
          <div className="cloud w-44 h-20 top-24 left-4 opacity-80" />
          <div className="cloud w-32 h-14 top-40 right-32 opacity-70" />

          {/* Subtle wind lines near bottom */}
          <div className="wind-particle bottom-24 left-10" />
          <div className="wind-particle bottom-32 right-20 delay-150" />
        </div>

        {/* Main content container */}
        <BrowserRouter>
          <main className="relative z-10 max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
            {/* Top “app bar” */}
            <header className="flex items-center justify-between gap-3 mb-4">
              <div>
                <p className="weather-section-title mb-1">QuantumWeather</p>
                <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                  Hybrid Quantum-Enhanced Weather Dashboard
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1">
                  Real-time forecasts, API fusion and quantum-assisted insights.
                </p>
              </div>

              {/* Small badge / pill */}
              <div className="hidden sm:flex flex-col items-end gap-2">
                <span className="weather-chip">
                  Live Mode
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </span>
                <button className="weather-cta text-xs md:text-sm">
                  Sync Latest Data
                </button>
              </div>
            </header>

            {/* Routed pages inside a “floating panel” */}
            <section className="floating-panel p-4 md:p-6 lg:p-8">
              <Routes>
                <Route path="/" element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </section>
          </main>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
