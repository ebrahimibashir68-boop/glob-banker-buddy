import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCountry } from "@/lib/country-context";
import { PI_USD } from "@/lib/banking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, ArrowUpDown, QrCode, Store, TrendingUp, Wallet, Globe2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/pi")({
  head: () => ({
    meta: [
      { title: "Pi Ecosystem Wallet · Meridian Bank" },
      { name: "description", content: "Hold, send, swap, and spend Pi (π) alongside your local currency — integrated with the Pi Network mainnet." },
    ],
  }),
  component: PiPage,
});

function PiPage() {
  const { country } = useCountry();
  const [amount, setAmount] = useState("100");
  const num = parseFloat(amount) || 0;
  const local = (num * PI_USD) / country.fxToUsd;

  return (
    <AppShell>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-pi/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-pi">
            <Sparkles className="h-3 w-3" /> Pi Network Mainnet
          </div>
          <h1 className="mt-2 font-serif text-3xl font-bold text-navy md:text-4xl">Pi Ecosystem</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Your Pi wallet lives inside Meridian — swap between π and {country.currency}, pay Pi-accepting merchants, and receive from Pioneers worldwide.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-pi p-6 text-pi-foreground shadow-card lg:col-span-2">
          <Sparkles className="absolute -right-6 -top-6 h-40 w-40 opacity-10" strokeWidth={0.8} />
          <div className="text-xs uppercase tracking-widest opacity-80">Pi Balance</div>
          <div className="mt-2 font-serif text-5xl font-bold">428.7314 π</div>
          <div className="mt-1 text-sm opacity-80">
            ≈ ${(428.73 * PI_USD).toFixed(2)} USD · ≈ {country.currencySymbol}
            {((428.73 * PI_USD) / country.fxToUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} {country.currency}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { icon: <ArrowUpDown className="h-4 w-4" />, label: "Swap" },
              { icon: <QrCode className="h-4 w-4" />, label: "Receive" },
              { icon: <Wallet className="h-4 w-4" />, label: "Send" },
              { icon: <Store className="h-4 w-4" />, label: "Pay merchant" },
            ].map((a) => (
              <button key={a.label} className="flex items-center justify-center gap-2 rounded-lg bg-white/15 py-2.5 text-sm font-medium backdrop-blur transition-colors hover:bg-white/25"
                onClick={() => toast.success(a.label, { description: "Pi Mainnet transaction pending confirmation" })}>
                {a.icon}{a.label}
              </button>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <TrendingUp className="h-3.5 w-3.5 text-pi" /> π / USD
          </div>
          <div className="mt-2 font-serif text-3xl font-bold">${PI_USD.toFixed(2)}</div>
          <div className="mt-1 text-xs text-success">+2.4% today · +18.3% 30d</div>
          <div className="mt-4 h-24 w-full">
            <svg viewBox="0 0 200 80" className="h-full w-full">
              <path d="M0,60 Q30,50 50,55 T100,40 T150,30 T200,20" fill="none" stroke="oklch(0.5 0.22 300)" strokeWidth="2" />
              <path d="M0,60 Q30,50 50,55 T100,40 T150,30 T200,20 L200,80 L0,80 Z" fill="oklch(0.5 0.22 300 / 0.15)" />
            </svg>
          </div>
          <div className="mt-2 rounded-md bg-muted p-2 text-[11px] text-muted-foreground">
            Rate is indicative. Actual swap price set at confirmation on Pi Mainnet.
          </div>
        </Card>
      </div>

      <Tabs defaultValue="swap" className="mt-8">
        <TabsList>
          <TabsTrigger value="swap">Swap</TabsTrigger>
          <TabsTrigger value="merchants">Pi Merchants</TabsTrigger>
          <TabsTrigger value="remit">Pi Remittance</TabsTrigger>
        </TabsList>

        <TabsContent value="swap" className="mt-6">
          <Card className="mx-auto max-w-lg p-6">
            <h3 className="font-serif text-lg font-bold text-navy">Swap π ↔ {country.currency}</h3>
            <div className="mt-4 space-y-3">
              <div className="rounded-lg bg-muted/60 p-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground"><span>You pay</span><span>Bal 428.73 π</span></div>
                <div className="mt-1 flex items-center gap-3">
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" className="border-0 bg-transparent p-0 text-2xl font-serif shadow-none focus-visible:ring-0" />
                  <div className="rounded-full bg-pi px-3 py-1 text-sm font-semibold text-pi-foreground">π Pi</div>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="grid h-8 w-8 place-items-center rounded-full border border-border bg-background"><ArrowUpDown className="h-4 w-4" /></div>
              </div>
              <div className="rounded-lg bg-muted/60 p-4">
                <div className="text-xs text-muted-foreground">You get</div>
                <div className="mt-1 flex items-center gap-3">
                  <div className="flex-1 font-serif text-2xl">{local.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                  <div className="rounded-full bg-navy px-3 py-1 text-sm font-semibold text-navy-foreground">{country.currency}</div>
                </div>
              </div>
              <div className="rounded-md border border-border/60 p-3 text-xs text-muted-foreground">
                Route: Pi Mainnet → Meridian FX desk → {country.currency} account · Settles in ~30 seconds
              </div>
              <Button className="w-full bg-pi text-pi-foreground hover:bg-pi/90"
                onClick={() => toast.success("Swap confirmed", { description: "Pi Mainnet block mined · funds settled" })}>
                Confirm swap
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="merchants" className="mt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Pi Café", "Coffee · Local", "0.42 π"],
              ["Chainmart Groceries", "Food & Retail", "12.5 π"],
              ["Pioneer Air", "Travel", "180 π"],
              ["Node Repair", "Services", "3.8 π"],
              ["PiBooks", "Digital goods", "0.9 π"],
              ["Meridian π→Bill", "Utilities (via Meridian)", "varies"],
            ].map(([n, cat, price]) => (
              <Card key={n} className="p-5 hover:shadow-card transition-shadow">
                <div className="grid h-10 w-10 place-items-center rounded-md bg-gradient-pi text-pi-foreground"><Store className="h-5 w-5" /></div>
                <div className="mt-3 font-semibold">{n}</div>
                <div className="text-xs text-muted-foreground">{cat}</div>
                <div className="mt-2 text-sm font-mono">from {price}</div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="remit" className="mt-6">
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-gradient-pi text-pi-foreground">
                <Globe2 className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg font-bold text-navy">Pi remittance corridor</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pioneers abroad can send you π directly to your Meridian Pi Wallet with zero cross-border fees.
                  We auto-swap to {country.currency} at arrival — bypassing SWIFT for micro-remittances.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                  <Stat label="Avg. arrival" value="~30s" />
                  <Stat label="Fee" value="0%" />
                  <Stat label="Corridors" value="200+" />
                </div>
                <Button className="mt-4 bg-pi text-pi-foreground hover:bg-pi/90">Share your Pi address</Button>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/60 p-3">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-serif text-xl font-bold text-navy">{value}</div>
    </div>
  );
}
