import { Link, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useCountry } from "@/lib/country-context";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Receipt, ArrowLeftRight, Landmark, Globe2, Sparkles, ChevronDown, ShieldCheck,
} from "lucide-react";

const NAV = [
  { to: "/",              label: "Overview",       icon: LayoutDashboard },
  { to: "/bills",         label: "Bills & Mobile", icon: Receipt },
  { to: "/transfer",      label: "Transfer",       icon: ArrowLeftRight },
  { to: "/deposit",       label: "Deposit / Withdraw", icon: Landmark },
  { to: "/international", label: "International",  icon: Globe2 },
  { to: "/pi",            label: "Pi Ecosystem",   icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { country, setCountry, all } = useCountry();
  const path = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-md bg-navy text-navy-foreground shadow-soft">
              <Landmark className="h-4.5 w-4.5" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="font-serif text-lg font-bold text-navy">Meridian Bank</div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Global · Pi-enabled</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              return (
                <Link key={n.to} to={n.to}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active ? "bg-accent text-navy" : "text-muted-foreground hover:text-foreground hover:bg-accent/60"
                  }`}
                >
                  {n.label}
                </Link>
              );
            })}
          </nav>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9 gap-2">
                <span className="text-base leading-none">{country.flag}</span>
                <span className="hidden text-xs font-semibold sm:inline">{country.code}</span>
                <span className="hidden text-xs text-muted-foreground md:inline">· {country.currency}</span>
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                <ShieldCheck className="h-3.5 w-3.5 text-navy" /> Jurisdiction & Central Bank
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {all.map((c) => (
                <DropdownMenuItem key={c.code} onClick={() => setCountry(c.code)} className="gap-2">
                  <span className="text-base">{c.flag}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{c.country}</div>
                    <div className="text-[11px] text-muted-foreground">{c.centralBank}</div>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">{c.currency}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="lg:hidden">
          <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 pt-1">
            {NAV.map((n) => {
              const active = n.to === "/" ? path === "/" : path.startsWith(n.to);
              const Icon = n.icon;
              return (
                <Link key={n.to} to={n.to}
                  className={`flex shrink-0 items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                    active ? "bg-navy text-navy-foreground" : "bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {n.label}
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-10">{children}</main>

      <footer className="mt-16 border-t border-border/60 bg-navy text-navy-foreground/80">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 md:grid-cols-4">
          <div>
            <div className="font-serif text-lg font-bold text-navy-foreground">Meridian Bank</div>
            <p className="mt-2 text-xs leading-relaxed">
              A demonstration of jurisdiction-aware banking UX with Pi Network integration.
              Not a real financial institution. No real money movement.
            </p>
          </div>
          <div className="text-xs">
            <div className="mb-2 font-semibold text-navy-foreground">Regulator</div>
            <div>{country.centralBank}</div>
            <div className="mt-1 opacity-70">{country.notes}</div>
          </div>
          <div className="text-xs">
            <div className="mb-2 font-semibold text-navy-foreground">Currency</div>
            <div>{country.currency} · {country.currencySymbol}</div>
            <div className="mt-1 opacity-70">Indicative FX: 1 {country.currency} ≈ ${country.fxToUsd.toFixed(4)} USD</div>
          </div>
          <div className="text-xs">
            <div className="mb-2 font-semibold text-navy-foreground">Compliance</div>
            <div>KYC · AML · CFT · Sanctions screening</div>
            <div className="mt-1 opacity-70">Prototype — regulatory rules simulated for design purposes only.</div>
          </div>
        </div>
        <div className="border-t border-navy-foreground/10 py-4 text-center text-[11px] opacity-60">
          © {new Date().getFullYear()} Meridian Bank · Pi Ecosystem Partner (mock)
        </div>
      </footer>
    </div>
  );
}
