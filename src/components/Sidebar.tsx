import { MapPin, Calendar, Info, TrendingUp, Split, Layers, CloudRain, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeView: "forecast" | "map" | "climate" | "historical" | "comparison" | "radar" | "settings";
  onViewChange: (view: "forecast" | "map" | "climate" | "historical" | "comparison" | "radar" | "settings") => void;
}

export const Sidebar = ({ activeView, onViewChange }: SidebarProps) => {
  const menuItems = [
    { id: "forecast" as const, label: "Forecast", icon: Calendar },
    { id: "map" as const, label: "Weather Map", icon: Layers },
    { id: "radar" as const, label: "Radar", icon: CloudRain },
    { id: "climate" as const, label: "Climate & AQI", icon: Info },
    { id: "historical" as const, label: "Historical Data", icon: TrendingUp },
    { id: "comparison" as const, label: "Compare Locations", icon: Split },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="w-80 bg-sidebar border-r border-sidebar-border p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Weather Dashboard</h1>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                activeView === item.id
                  ? "bg-sidebar-accent text-sidebar-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};
