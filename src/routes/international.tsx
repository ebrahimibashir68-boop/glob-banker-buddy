import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useCountry } from "@/lib/country-context";
import { COUNTRIES, formatMoney, getCountry } from "@/lib/banking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Globe2, AlertTriangle, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/international")({
  head: () => ({
    meta: [
      { title: "International Transfers · Meridian Bank" },
      { name: "description", content: "Send money worldwide via SWIFT, SEPA, and correspondent banks — under both origin and destination central bank rules." },
    ],
  }),
  component: IntlPage,
});

function IntlPage() {
  const { country } = useCountry();
  const [dest, setDest] = useState(COUNTRIES.find(c => c.code !== country.code)!.code);
  const [amount, setAmount] = useState("1000");
  const destCountry = getCountry(dest);

  const num = parseFloat(amount) || 0;
  const usd = num * country.fxToUsd;
  const received = usd / destCountry.fxToUsd;
  const fxFee = num * 0.005;
  const wireFee = country.code === "US" ? 25 / country.fxToUsd : num > 500 ? 12 : 4;
  const tax = num * (country.taxOnIntlPct / 100);
  const total = num + fxFee + wireFee + tax;

  const blocked = country.intlDailyCap === 0 || destCountry.intlDailyCap === 0;
  const overCap = num > country.intlDailyCap;

  const rail = useMemo(() => {
    if (country.code === "EU" && destCountry.code === "EU") return "SEPA Instant";
    if (country.requiresSwift && destCountry.requiresSwift) return "SWIFT gpi";
    if (!destCountry.requiresSwift) return "Correspondent bank + local rail";
    return "SWIFT";
  }, [country, destCountry]);

  return (
    <AppShell>
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy md:text-4xl">International transfer</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Cross-border payment subject to both {country.centralBank} (origin) and {destCountry.centralBank} (destination) rules.
        </p>
      </div>

      {blocked && (
        <Alert className="mt-4 border-destructive/40 bg-destructive/5 text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Outbound international transfers are restricted for this corridor under current central bank regulations.
            Domestic services and Pi Network transfers remain available.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="From">
              <div className="flex items-center gap-2 rounded-md border border-input bg-muted/40 px-3 py-2">
                <span className="text-lg">{country.flag}</span>
                <div className="text-sm"><div className="font-medium">{country.country}</div><div className="text-xs text-muted-foreground">{country.currency} · {country.centralBank}</div></div>
              </div>
            </Field>
            <Field label="To">
              <Select value={dest} onValueChange={(v) => setDest(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.filter(c => c.code !== country.code).map(c => (
                    <SelectItem key={c.code} value={c.code}>{c.flag} &nbsp;{c.country} · {c.currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label={`Amount to send (${country.currency})`}>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="text-lg" />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name"><Input placeholder="Full legal name" /></Field>
            <Field label={destCountry.requiresIban ? "IBAN" : "Account number"}>
              <Input placeholder={destCountry.requiresIban ? `${destCountry.code}## #### ####` : "0000 0000 0000"} />
            </Field>
            {destCountry.requiresSwift && (
              <Field label="SWIFT / BIC"><Input placeholder="BANKUS33XXX" /></Field>
            )}
            <Field label="Purpose (regulatory code)">
              <Select defaultValue="family">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="family">Family maintenance</SelectItem>
                  <SelectItem value="salary">Salary / employment</SelectItem>
                  <SelectItem value="invoice">Goods / invoice</SelectItem>
                  <SelectItem value="education">Education fees</SelectItem>
                  <SelectItem value="medical">Medical treatment</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Button className="w-full bg-navy text-navy-foreground hover:bg-navy/90"
            disabled={blocked || overCap || !num}
            onClick={() => toast.success("Wire submitted for compliance review", { description: `${rail} · ETA 1 business day` })}>
            Review & send <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
          {overCap && !blocked && (
            <p className="text-xs text-destructive">
              Exceeds {country.centralBank} international daily cap ({formatMoney(country.intlDailyCap, country)}).
            </p>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Globe2 className="h-3.5 w-3.5 text-navy" /> Route
            </div>
            <div className="mt-2 font-serif text-lg font-bold">{rail}</div>
            <p className="mt-1 text-xs text-muted-foreground">Auto-selected for lowest cost & fastest settlement.</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-navy" /> FX rate
            </div>
            <div className="mt-2 font-mono text-sm">
              1 {country.currency} = {(country.fxToUsd / destCountry.fxToUsd).toFixed(4)} {destCountry.currency}
            </div>
            <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3 text-xs">
              <Row l="Send" v={formatMoney(num, country)} />
              <Row l="FX margin (0.5%)" v={formatMoney(fxFee, country)} />
              <Row l="Wire fee" v={formatMoney(wireFee, country)} />
              <Row l={`${country.centralBank} tax (${country.taxOnIntlPct}%)`} v={formatMoney(tax, country)} />
              <Row l="Total debit" v={formatMoney(total, country)} bold />
              <div className="mt-2 rounded-md bg-accent/60 p-2">
                <div className="text-[11px] text-muted-foreground">Recipient gets</div>
                <div className="font-serif text-base font-bold text-navy">{formatMoney(received, destCountry)}</div>
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-navy" /> Compliance
            </div>
            <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
              <li>· KYC/AML screening on sender & recipient</li>
              <li>· Sanctions & PEP list check</li>
              <li>· Purpose code reported to {country.centralBank}</li>
              <li>· Cleared to {destCountry.centralBank} rules on arrival</li>
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium">{label}</Label>{children}</div>;
}
function Row({ l, v, bold }: { l: string; v: string; bold?: boolean }) {
  return <div className={`flex justify-between ${bold ? "font-semibold text-foreground" : ""}`}><span className="text-muted-foreground">{l}</span><span>{v}</span></div>;
}
