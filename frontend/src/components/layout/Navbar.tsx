import { Globe, Bell, Settings, User } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";

const navItems = [
  { title: "Dashboard", url: "/" },
  { title: "Analysis", url: "/analysis" },
  { title: "Learn", url: "/learn" },
  { title: "History", url: "/history" },
];

export function Navbar() {
  return (
    <header className="h-14 flex items-center justify-between border-b border-border/50 px-4 bg-card/30 backdrop-blur-md">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.url}
              to={item.url}
              end={item.url === "/"}
              className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground rounded-md transition-colors"
              activeClassName="text-foreground font-medium border-b-2 border-primary"
            >
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <button className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors relative">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
        </button>
      </div>
    </header>
  );
}
