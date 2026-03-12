"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Search, Bell, Moon, Sun, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = [{ label: "Home", href: "/" }];
  let path = "";
  for (const segment of segments) {
    path += `/${segment}`;
    crumbs.push({
      label: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
      href: path,
    });
  }

  return (
    <nav className="flex items-center gap-1 text-sm text-muted-foreground ml-12 md:ml-0" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" aria-hidden="true" />}
            {i === crumbs.length - 1 ? (
              <span className="font-medium text-foreground" aria-current="page">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function Header() {
  const [darkMode, setDarkMode] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark" || (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-6 border-b border-border bg-card no-print" role="banner">
      <Breadcrumbs />

      <div className="flex items-center gap-2 md:gap-3">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder="Search contracts..."
            className="pl-9 w-64 h-9"
            aria-label="Search contracts"
          />
        </div>

        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full" aria-label="Unread notifications" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggleDarkMode} aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}>
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>

        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-border">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-semibold" aria-label="User avatar">
            U
          </div>
        </div>
      </div>
    </header>
  );
}
