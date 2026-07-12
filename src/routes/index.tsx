import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { useCountry } from "@/lib/country-context";
import { formatMoney, seedAccounts, seedTxns, PI_USD } from "@/lib/banking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight, ArrowDownLeft, Receipt, ArrowLeftRight, Landmark, Globe2,
  Sparkles, TrendingUp, ShieldCheck, Wifi,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Meridian Bank — Global banking, Pi-enabled" },
      { name: "description", content: "Pay bills, transfer, deposit, and send money internationally under each country's central bank rules — with built-in Pi Network wallet." },
      { property: "og:title", content: "Meridian Bank — Global banking, Pi-enabled" },
      { property: "og:description", content: "Multi-country banking dashboard with utility & mobile bill pay, transfers, deposits, international wires, and the Pi ecosystem." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { country } = useCountry();
  const accounts = seedAccounts(country);
  const txns = seedTxns();
  const total = accounts.filter(a => a.type !== "Pi Wallet").reduce((s, a) => s + a.balance, 0);
  const piBal = accounts.find(a => a.type === "Pi Wallet")!.balance;

  return (
    <AppShell>
      {/* Hero balance card */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="relative overflow-hidden border-0 bg-gradient-card p-6 text-navy-foreground shadow-card lg:col-span-2">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-24 -left-8 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] opacity-80">
                <ShieldCheck className="h-3.5 w-3.5" /> Regulated by {country.centralBank}
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[11px]">
                <Wifi className="h-3 w-3 -rotate-90" /> Contactless
              </div>
            </div>
            <div className="mt-6">
              <div className="text-xs uppercase tracking-widest opacity-70">Total Balance · {country.currency}</div>
              <div className="mt-1 font-serif text-4xl font-bold md:text-5xl">{formatMoney(total, country)}</div>
              <div className="mt-1 text-sm opacity-70">
                ≈ ${(total * country.fxToUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD
                &nbsp;·&nbsp; {piBal.toFixed(2)} π (≈ ${(piBal * PI_USD).toFixed(2)})
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <QuickAction to="/transfer"      icon={<ArrowUpRight className="h-4 w-4" />}   label="Send" />
              <QuickAction to="/deposit"       icon={<ArrowDownLeft className="h-4 w-4" />} label="Deposit" />
              <QuickAction to="/bills"         icon={<Receipt className="h-4 w-4" />}       label="Pay Bills" />
              <QuickAction to="/international" icon={<Globe2 className="h-4 w-4" />}        label="International" />
              <QuickAction to="/pi"            icon={<Sparkles className="h-4 w-4" />}      label="Pi" pi />
            </div>
          </div>
        </Card>

        {/* Regulatory panel */}
        <Card className="p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-navy" /> Jurisdiction
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl">{country.flag}</span>
            <span className="font-serif text-xl font-bold">{country.country}</span>
          </div>
          <div className="mt-1 text-sm font-medium text-navy">{country.centralBank}</div>
          <div className="mt-4 space-y-3 text-sm">
            <RegRow label="Daily transfer cap" value={formatMoney(country.dailyTransferCap, country)} used={0.42} />
            <RegRow label="Intl. daily cap" value={country.intlDailyCap ? formatMoney(country.intlDailyCap, country) : "Restricted"} used={country.intlDailyCap ? 0.18 : 1} restricted={!country.intlDailyCap} />
            <div className="flex justify-between border-t border-border/60 pt-3 text-xs">
              <span className="text-muted-foreground">IBAN</span>
              <span className="font-medium">{country.requiresIban ? "Required" : "Optional"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">SWIFT for outbound</span>
              <span className="font-medium">{country.requiresSwift ? "Required" : "Not available"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">FX tax / stamp</span>
              <span className="font-medium">{country.taxOnIntlPct}%</span>
            </div>
          </div>
          <p className="mt-4 rounded-md bg-muted p-2.5 text-[11px] leading-relaxed text-muted-foreground">
            {country.notes}
          </p>
        </Card>
      </section>

      {/* Accounts */}
      <section className="mt-10">
        <SectionTitle>Accounts</SectionTitle>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {accounts.map((a) => {
            const isPi = a.type === "Pi Wallet";
            return (
              <Card key={a.id} className={`relative overflow-hidden p-5 ${isPi ? "bg-gradient-pi text-pi-foreground border-0" : ""}`}>
                <div className={`flex items-center justify-between text-xs ${isPi ? "opacity-80" : "text-muted-foreground"}`}>
                  <span className="uppercase tracking-wider">{a.type}</span>
                  <span className="font-mono">{a.number}</span>
                </div>
                <div className="mt-3 font-medium">{a.name}</div>
                <div className="mt-1 font-serif text-2xl font-bold">
                  {isPi ? `${a.balance.toFixed(4)} π` : formatMoney(a.balance, country)}
                </div>
                <div className={`mt-1 text-xs ${isPi ? "opacity-80" : "text-muted-foreground"}`}>
                  {isPi ? `≈ $${(a.balance * PI_USD).toFixed(2)} USD` : `≈ $${(a.balance * country.fxToUsd).toLocaleString(undefined, { maximumFractionDigits: 0 })} USD`}
                </div>
                {isPi && (
                  <Sparkles className="absolute -right-4 -top-4 h-24 w-24 opacity-10" strokeWidth={1} />
                )}
              </Card>
            );
          })}
        </div>
      </section>

      {/* Services grid */}
      <section className="mt-10">
        <SectionTitle>Banking Services</SectionTitle>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <ServiceCard to="/bills"         icon={Receipt}       title="Utilities & Mobile"   desc={`Pay ${country.billers.length} local billers`} />
          <ServiceCard to="/transfer"      icon={ArrowLeftRight} title="Transfer"            desc={`Instant to any ${country.currency} account`} />
          <ServiceCard to="/deposit"       icon={Landmark}      title="Deposit / Withdraw"   desc="Branches, ATM & mobile check" />
          <ServiceCard to="/international" icon={Globe2}        title="International"        desc={country.requiresSwift ? "SWIFT · SEPA · Wise" : "Restricted by central bank"} />
        </div>
      </section>

      {/* Activity + Pi module */}
      <section className="mt-10 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <SectionTitle inline>Recent Activity</SectionTitle>
            <Button variant="ghost" size="sm">View all</Button>
          </div>
          <div className="mt-4 divide-y divide-border/60">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center gap-3 py-3">
                <div className={`grid h-9 w-9 place-items-center rounded-full ${t.amount > 0 ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {t.amount > 0 ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{t.merchant}</div>
                  <div className="text-xs text-muted-foreground">{t.date} · {t.category}</div>
                </div>
                <div className={`font-mono text-sm font-semibold ${t.amount > 0 ? "text-success" : "text-foreground"}`}>
                  {t.amount > 0 ? "+" : "−"}{formatMoney(Math.abs(t.amount), country)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="relative overflow-hidden border-0 bg-gradient-pi p-6 text-pi-foreground shadow-card">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80">
            <Sparkles className="h-3.5 w-3.5" /> Pi Network
          </div>
          <div className="mt-3 font-serif text-2xl font-bold">Bank + Pi, unified</div>
          <p className="mt-2 text-sm opacity-90">
            Convert between {country.currency} and π, pay Pi-accepting merchants, and receive
            remittances from Pioneers worldwide — settled instantly on the Pi Mainnet.
          </p>
          <div className="mt-4 rounded-lg bg-white/10 p-3 backdrop-blur">
            <div className="flex items-center justify-between text-xs opacity-80">
              <span>1 π</span><span>Live rate</span>
            </div>
            <div className="mt-1 flex items-baseline justify-between">
              <div className="font-serif text-xl font-bold">${PI_USD.toFixed(2)} USD</div>
              <div className="flex items-center gap-1 text-xs text-emerald-200">
                <TrendingUp className="h-3.5 w-3.5" /> +2.4%
              </div>
            </div>
            <div className="mt-1 text-xs opacity-80">
              ≈ {country.currencySymbol}{(PI_USD / country.fxToUsd).toLocaleString(undefined, { maximumFractionDigits: 2 })} {country.currency}
            </div>
          </div>
          <Button asChild variant="secondary" className="mt-4 w-full bg-white text-pi hover:bg-white/90">
            <Link to="/pi">Open Pi Wallet</Link>
          </Button>
        </Card>
      </section>
    </AppShell>
  );
}

function SectionTitle({ children, inline }: { children: React.ReactNode; inline?: boolean }) {
  return (
    <h2 className={`font-serif ${inline ? "text-lg" : "text-xl"} font-bold text-navy`}>{children}</h2>
  );
}

function QuickAction({ to, icon, label, pi }: { to: string; icon: React.ReactNode; label: string; pi?: boolean }) {
  return (
    <Button asChild variant="secondary"
      className={`h-10 gap-2 rounded-full border-0 ${pi ? "bg-pi text-pi-foreground hover:bg-pi/90" : "bg-white/15 text-navy-foreground hover:bg-white/25"} backdrop-blur`}>
      <Link to={to as any}>{icon}<span>{label}</span></Link>
    </Button>
  );
}

function RegRow({ label, value, used, restricted }: { label: string; value: string; used: number; restricted?: boolean }) {
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${restricted ? "text-destructive" : ""}`}>{value}</span>
      </div>
      <Progress value={used * 100} className="mt-1.5 h-1.5" />
    </div>
  );
}

function ServiceCard({ to, icon: Icon, title, desc }: { to: string; icon: any; title: string; desc: string }) {
  return (
    <Link to={to as any} className="group">
      <Card className="h-full p-5 transition-all hover:-translate-y-0.5 hover:shadow-card">
        <div className="grid h-10 w-10 place-items-center rounded-md bg-accent text-navy transition-colors group-hover:bg-navy group-hover:text-navy-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-3 font-semibold">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
      </Card>
    </Link>
  );
}
