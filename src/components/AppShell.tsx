import { Link, useRouterState } from "@tanstack/react-router";
import {
  BookOpenCheck,
  CalendarClock,
  LayoutDashboard,
  LibraryBig,
  LogOut,
  Mail,
  Menu,
  MessagesSquare,
  NotebookPen,
  ShieldCheck,
  Telescope,
} from "lucide-react";
import { useState, type ReactNode } from "react";

import logo from "@/assets/elfa-logo.png";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { AI_DISCLAIMER } from "@/lib/tools";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/chat", label: "Study Chat", icon: MessagesSquare },
  { to: "/tools/homework", label: "Homework Helper", icon: BookOpenCheck },
  { to: "/tools/notes", label: "Notes Summariser", icon: NotebookPen },
  { to: "/tools/planner", label: "Study Planner", icon: CalendarClock },
  { to: "/tools/research", label: "Research Assistant", icon: Telescope },
  { to: "/tools/email", label: "Email Writer", icon: Mail },
  { to: "/library", label: "My Library", icon: LibraryBig },
  { to: "/responsible-ai", label: "Responsible AI", icon: ShieldCheck },
] as const;

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map(({ to, label, icon: Icon }) => {
        const active = pathname === to || pathname.startsWith(`${to}/`);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              active && "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="truncate">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarBody({ onNavigate }: { onNavigate?: () => void }) {
  const { user, signOut } = useAuth();

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <Link to="/" className="flex min-w-0 items-center gap-3" onClick={onNavigate}>
        <img src={logo} alt="ELFA logo" width={40} height={40} className="size-10 shrink-0" />
        <span className="min-w-0">
          <span className="block font-display text-lg font-bold leading-none text-sidebar-foreground">
            ELFA
          </span>
          <span className="block truncate text-xs text-sidebar-foreground/70">
            Easy Learning For All
          </span>
        </span>
      </Link>

      <div className="flex-1 overflow-y-auto">
        <NavLinks onNavigate={onNavigate} />
      </div>

      <div className="space-y-3 border-t border-sidebar-border pt-4">
        <p className="text-[11px] leading-relaxed text-sidebar-foreground/60">{AI_DISCLAIMER}</p>
        <div className="flex min-w-0 items-center justify-between gap-2">
          <span className="min-w-0 truncate text-xs text-sidebar-foreground/70">{user?.email}</span>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Sign out"
            className="shrink-0 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            onClick={() => void signOut()}
          >
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-72 shrink-0 bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarBody />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b border-border bg-background/85 px-4 py-3 backdrop-blur lg:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon-sm" aria-label="Open menu">
                <Menu className="size-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-none bg-sidebar p-0">
              <SheetTitle className="sr-only">ELFA navigation</SheetTitle>
              <SidebarBody onNavigate={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
          <div className="flex min-w-0 items-center gap-2">
            <img src={logo} alt="" width={28} height={28} className="size-7 shrink-0" />
            <span className="truncate font-display font-bold">ELFA</span>
          </div>
        </header>

        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
