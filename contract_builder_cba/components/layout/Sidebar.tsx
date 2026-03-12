"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Anchor,
  Menu,
  X,
  GitBranch,
  Layers,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contracts", label: "Contracts", icon: FileText },
  { href: "/workflows", label: "Workflows", icon: GitBranch },
  { href: "/bulk", label: "Bulk Operations", icon: Layers },
  { href: "/monitor", label: "Monitoring", icon: Activity },
  { href: "/templates", label: "Templates", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <>
      <div className={cn("flex items-center gap-3 px-4 h-16 border-b border-border", collapsed && "justify-center")}>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
          <Anchor className="w-5 h-5" />
        </div>
        {!collapsed && (
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground tracking-tight">Contract Builder</span>
            <span className="text-[10px] text-muted-foreground">CBA Platform</span>
          </div>
        )}
      </div>

      <nav className="flex-1 py-4 px-2 space-y-1" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
              aria-current={isActive ? "page" : undefined}
            >
              <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <div className="p-2 border-t border-border hidden md:block">
        <Button
          variant="ghost"
          size="sm"
          className={cn("w-full", collapsed && "px-2")}
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-card border-r border-border transition-all duration-300 no-print",
          collapsed ? "w-16" : "w-64"
        )}
        aria-label="Sidebar navigation"
      >
        {sidebarContent}
      </aside>
    </>
  );
}
