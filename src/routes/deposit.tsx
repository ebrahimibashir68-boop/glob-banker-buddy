import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCountry } from "@/lib/country-context";
import { formatMoney } from "@/lib/banking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Camera, Banknote, MapPin, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/deposit")({
  head: () => ({
    meta: [
      { title: "Deposit & Withdraw · Meridian Bank" },
      { name: "description", content: "Mobile check deposit, ATM withdrawal, branch cash-in and cash-out." },
    ],
  }),
  component: DepositPage,
});

function DepositPage() {
  const { country } = useCountry();

  return (
    <AppShell>
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy md:text-4xl">Deposit & Withdraw</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cash-in and cash-out under {country.centralBank} operational rules.
        </p>
      </div>

      <Tabs defaultValue="deposit" className="mt-6">
        <TabsList>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="atm">Find ATM / Branch</TabsTrigger>
        </TabsList>

        <TabsContent value="deposit" className="mt-6 grid gap-4 md:grid-cols-3">
          <MethodCard icon={<Camera className="h-5 w-5" />} title="Mobile check deposit" desc={`Snap a photo. Funds available in 1 business day (limit ${formatMoney(5000, country)}).`}
            cta="Scan check" />
          <MethodCard icon={<QrCode className="h-5 w-5" />} title="P2P cash-in" desc="Request cash from another Meridian customer via QR."
            cta="Generate QR" />
          <MethodCard icon={<Banknote className="h-5 w-5" />} title="Branch / Agent" desc={`Visit any partner branch across ${country.country}.`}
            cta="Find a branch" />
        </TabsContent>

        <TabsContent value="withdraw" className="mt-6 grid gap-6 lg:grid-cols-3">
          <Card className="p-6 lg:col-span-2 space-y-4">
            <h3 className="font-serif text-lg font-bold text-navy">Withdraw to cash or card</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Amount ({country.currency})</Label>
                <Input type="number" placeholder="0.00" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Method</Label>
                <select className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option>ATM cardless code</option>
                  <option>Debit card at ATM</option>
                  <option>Branch teller</option>
                  <option>Cash agent</option>
                </select>
              </div>
            </div>
            <div className="rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
              {country.centralBank} daily cash withdrawal limit: {formatMoney(country.dailyTransferCap / 5, country)}.
              Transactions above {formatMoney(country.dailyTransferCap, country)} may require additional verification.
            </div>
            <Button className="bg-navy text-navy-foreground hover:bg-navy/90"
              onClick={() => toast.success("Cardless code generated", { description: "Valid at any Meridian ATM for 30 minutes." })}>
              Generate cash code
            </Button>
          </Card>
          <Card className="p-6">
            <h3 className="font-serif text-lg font-bold text-navy">Today's limits</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Row label="Daily cash out" value={formatMoney(country.dailyTransferCap / 5, country)} />
              <Row label="Weekly cash out" value={formatMoney(country.dailyTransferCap, country)} />
              <Row label="Per-transaction" value={formatMoney(country.dailyTransferCap / 10, country)} />
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="atm" className="mt-6">
          <Card className="overflow-hidden p-0">
            <div className="relative h-64 w-full bg-gradient-to-br from-navy via-navy to-secondary">
              <div className="absolute inset-0 opacity-20"
                style={{ backgroundImage: "radial-gradient(circle at 20% 30%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px), radial-gradient(circle at 40% 80%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
              {[["25%","30%"],["55%","55%"],["70%","35%"],["40%","70%"]].map(([l,t],i) => (
                <div key={i} className="absolute" style={{ left: l, top: t }}>
                  <MapPin className="h-6 w-6 text-white drop-shadow" />
                </div>
              ))}
              <div className="absolute bottom-4 left-4 rounded-md bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur">
                4 locations near you · {country.country}
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {[
                ["Meridian Central Branch", "0.3 km · Open until 5:00 PM"],
                ["Airport ATM Hall B", "6.1 km · 24/7"],
                ["Partner Agent — SuperMart", "1.2 km · Open until 10:00 PM"],
                ["Downtown Kiosk", "2.4 km · 24/7"],
              ].map(([n, d]) => (
                <div key={n} className="flex items-center gap-3 p-4">
                  <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-navy"><MapPin className="h-4 w-4" /></div>
                  <div className="flex-1"><div className="text-sm font-medium">{n}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                  <Button variant="outline" size="sm">Directions</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function MethodCard({ icon, title, desc, cta }: { icon: React.ReactNode; title: string; desc: string; cta: string }) {
  return (
    <Card className="p-6">
      <div className="grid h-10 w-10 place-items-center rounded-md bg-navy text-navy-foreground">{icon}</div>
      <div className="mt-3 font-serif text-lg font-bold">{title}</div>
      <p className="mt-1 text-xs text-muted-foreground">{desc}</p>
      <Button className="mt-4 w-full bg-navy text-navy-foreground hover:bg-navy/90" onClick={() => toast.success(cta)}>{cta}</Button>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className="font-medium">{value}</span></div>;
}
