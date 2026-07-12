import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCountry } from "@/lib/country-context";
import { formatMoney } from "@/lib/banking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Flame, Droplets, Wifi, Phone, Tv, Receipt, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/bills")({
  head: () => ({
    meta: [
      { title: "Pay Bills & Mobile Top-up · Meridian Bank" },
      { name: "description", content: "Pay electricity, gas, water, internet, TV, and top-up mobile phones with local operators — under your country's central bank rules." },
    ],
  }),
  component: BillsPage,
});

const CATEGORIES = [
  { id: "electricity", label: "Electricity", icon: Zap },
  { id: "gas",         label: "Gas",         icon: Flame },
  { id: "water",       label: "Water",       icon: Droplets },
  { id: "internet",    label: "Internet",    icon: Wifi },
  { id: "tv",          label: "TV",          icon: Tv },
  { id: "other",       label: "Other",       icon: Receipt },
];

function BillsPage() {
  const { country } = useCountry();
  const [tab, setTab] = useState("utilities");

  return (
    <AppShell>
      <Header title="Utilities & Mobile" subtitle={`${country.billers.length} local billers · ${country.mobileOperators.length} mobile operators · settled through ${country.centralBank}`} />

      <Tabs value={tab} onValueChange={setTab} className="mt-6">
        <TabsList>
          <TabsTrigger value="utilities">Utility Bills</TabsTrigger>
          <TabsTrigger value="mobile">Mobile Top-up</TabsTrigger>
          <TabsTrigger value="pending">Scheduled (3)</TabsTrigger>
        </TabsList>

        <TabsContent value="utilities" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <h3 className="font-serif text-lg font-bold text-navy">Categories</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {CATEGORIES.map(({ id, label, icon: Icon }) => (
                  <button key={id} className="group rounded-lg border border-border p-4 text-left transition-colors hover:border-navy hover:bg-accent/50">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-accent text-navy group-hover:bg-navy group-hover:text-navy-foreground">
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <div className="mt-2 text-sm font-semibold">{label}</div>
                    <div className="text-xs text-muted-foreground">
                      {country.billers.filter((_, i) => i % CATEGORIES.length === CATEGORIES.findIndex(c => c.id === id) % country.billers.length).length || 1}+ billers
                    </div>
                  </button>
                ))}
              </div>

              <h3 className="mt-8 font-serif text-lg font-bold text-navy">Local billers in {country.country}</h3>
              <div className="mt-3 divide-y divide-border/60">
                {country.billers.map((b, i) => (
                  <div key={b} className="flex items-center gap-3 py-3">
                    <div className="grid h-10 w-10 place-items-center rounded-md bg-navy/5 font-serif text-sm font-bold text-navy">
                      {b.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{b}</div>
                      <div className="text-xs text-muted-foreground">Ref #{(1002340 + i).toString()} · due in {3 + i} days</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-sm font-semibold">{formatMoney(45 + i * 27.5, country)}</div>
                    </div>
                    <PayButton biller={b} amount={45 + i * 27.5} />
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-serif text-lg font-bold text-navy">Quick pay</h3>
              <p className="mt-1 text-xs text-muted-foreground">Enter a biller reference to pay in one tap.</p>
              <div className="mt-4 space-y-3">
                <FormField label="Biller">
                  <Select defaultValue={country.billers[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{country.billers.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Account / Reference">
                  <Input placeholder="e.g. 1002340" />
                </FormField>
                <FormField label={`Amount (${country.currency})`}>
                  <Input type="number" placeholder="0.00" />
                </FormField>
                <FormField label="Pay from">
                  <Select defaultValue="chk">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chk">Everyday Checking · **** 4021</SelectItem>
                      <SelectItem value="sav">Savings · **** 7788</SelectItem>
                      <SelectItem value="pi">Pi Wallet · π **** 9F2A</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
                <Button className="w-full bg-navy text-navy-foreground hover:bg-navy/90"
                  onClick={() => toast.success("Bill paid", { description: `Confirmation sent · cleared via ${country.centralBank}` })}>
                  Pay now
                </Button>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Cleared through the local ACH network under {country.centralBank} rules. No fee for domestic billers.
                </p>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="mobile" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <h3 className="font-serif text-lg font-bold text-navy">Mobile operators in {country.country}</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {country.mobileOperators.map((op) => (
                  <div key={op} className="rounded-lg border border-border p-4">
                    <div className="flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-md bg-navy text-navy-foreground">
                        <Phone className="h-4.5 w-4.5" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold">{op}</div>
                        <div className="text-xs text-muted-foreground">Prepaid · Postpaid · Data bundles</div>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {[10, 25, 50, 100].map(v => (
                        <button key={v} className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-accent"
                          onClick={() => toast.success(`Top-up sent to ${op}`, { description: `${formatMoney(v, country)} · applied instantly` })}>
                          {formatMoney(v, country)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="p-6">
              <h3 className="font-serif text-lg font-bold text-navy">Recharge any number</h3>
              <div className="mt-4 space-y-3">
                <FormField label="Operator">
                  <Select defaultValue={country.mobileOperators[0]}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{country.mobileOperators.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                  </Select>
                </FormField>
                <FormField label="Phone number">
                  <Input placeholder="+_ ___ ___ ____" />
                </FormField>
                <FormField label={`Amount (${country.currency})`}>
                  <Input type="number" placeholder="0.00" />
                </FormField>
                <Button className="w-full bg-navy text-navy-foreground hover:bg-navy/90"
                  onClick={() => toast.success("Top-up successful")}>
                  Recharge
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <Card className="p-6">
            <div className="divide-y divide-border/60">
              {["Electricity — auto-pay", "Internet — monthly", "Water — quarterly"].map((n, i) => (
                <div key={n} className="flex items-center gap-3 py-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{n}</div>
                    <div className="text-xs text-muted-foreground">Next run in {(i + 1) * 6} days · {country.billers[i]}</div>
                  </div>
                  <Button variant="outline" size="sm">Manage</Button>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function PayButton({ biller, amount }: { biller: string; amount: number }) {
  const { country } = useCountry();
  return (
    <Button size="sm" className="bg-navy text-navy-foreground hover:bg-navy/90"
      onClick={() => toast.success(`Paid ${biller}`, { description: `${formatMoney(amount, country)} · settled` })}>
      Pay
    </Button>
  );
}

export function Header({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="font-serif text-3xl font-bold text-navy md:text-4xl">{title}</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
    </div>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">{label}</Label>
      {children}
    </div>
  );
}
