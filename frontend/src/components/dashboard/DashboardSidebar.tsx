import { LayoutDashboard, Building2, QrCode, Settings, Inbox, MessageSquare } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const items = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, end: true },
  { title: "Venues", url: "/dashboard/venues", icon: Building2 },
  { title: "Inspections", url: "/dashboard/inspections", icon: Inbox },
  { title: "QR Code", url: "/dashboard/qr", icon: QrCode },
  { title: "Feedback", url: "/dashboard/feedback", icon: MessageSquare },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export const DashboardSidebar = () => {
  const { pathname } = useLocation();
  const isActive = (url: string, end?: boolean) => (end ? pathname === url : pathname.startsWith(url));

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-gradient-accent" />
          <span className="font-display text-lg font-semibold text-sidebar-foreground">Venue Flow</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = isActive(item.url, item.end);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link
                        to={item.url}
                        className={cn(
                          "flex items-center gap-2 transition-colors",
                          active
                            ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                            : "hover:bg-sidebar-accent/50",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
