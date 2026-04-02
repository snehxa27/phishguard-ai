import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, Search, BookOpen, History, Settings, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Analysis", url: "/analysis", icon: Search },
  { title: "Learn", url: "/learn", icon: BookOpen },
  { title: "History", url: "/history", icon: History },
];



export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/50">
      <SidebarContent>
        <div className="p-4 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="glow-text font-bold text-sm">🛡️</span>
          </div>
          {!collapsed && (
            <span className="font-bold text-foreground tracking-tight">PhishGuard AI</span>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary border-r-2 border-primary"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>


    </Sidebar>
  );
}
