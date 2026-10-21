import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { useSimulation } from "@/lib/simulation-context";
import { useCountry } from "@/lib/country-context";
import { formatMoney, seedAccounts } from "@/lib/banking";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Zap, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { PiPayButton } from "@/components/PiPayButton";

export const Route = createFileRoute("/transfer")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Domestic Transfers · Meridian Banking Simulation" },
      { property: "og:description", content: "Explore simulated domestic transfers alongside a separate Pi SDK checkout." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Transfer Money · Meridian Bank" },
      { name: "description", content: "Send money instantly to any account under your country's central bank rules." },
    ],
  }),
  component: TransferPage,
});

function TransferPage() {
  const { country } = useCountry();
  const sim = useSimulation();
  const settle = (amount: number, memo: string, category: string, source = "chk", deposit = false) => { try { sim.transact(amount, memo, category, source, deposit); toast.success("Simulation settlement recorded"); } catch (error) { toast.error(error instanceof Error ? error.message : "Settlement failed"); } };
  const accounts = sim.state.vaults.filter(v => v.currency === country.currency).map(v => ({ ...v, type: v.kind }));
  const [source, setSource] = useState("chk");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const num = parseFloat(amount) || 0;
  const overCap = num > country.dailyTransferCap;

  return (
    <AppShell>
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy md:text-4xl">Send money</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simulated domestic ledger transfers · profile: {country.centralBank}. Daily cap {formatMoney(country.dailyTransferCap, country)}.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From account">
                <Select value={source} onValueChange={setSource}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {accounts.map(a => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.name} · {a.type === "Pi Wallet" ? `${a.balance.toFixed(2)} π` : formatMoney(a.balance, country)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Rail">
                <Select defaultValue="instant">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instant">Instant · 24/7</SelectItem>
                    <SelectItem value="ach">Standard clearing · same-day</SelectItem>
                    <SelectItem value="wire">Wire · high-value</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Recipient name">
              <Input aria-label="Recipient name" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Full legal name" />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={country.requiresIban ? "IBAN" : "Account number"}>
                <Input placeholder={country.requiresIban ? `${country.code}## #### #### ####` : "0000 0000 0000"} />
              </Field>
              <Field label={country.requiresIban ? "BIC / Bank code" : "Routing / Sort code"}>
                <Input placeholder="—" />
              </Field>
            </div>

            <Field label={`Amount (${country.currency})`}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{country.currencySymbol}</span>
                <Input value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="0.00" className="pl-8 text-lg" />
              </div>
              {overCap && (
                <p className="text-xs text-destructive">
                  Exceeds daily cap set by {country.centralBank} ({formatMoney(country.dailyTransferCap, country)}).
                </p>
              )}
            </Field>

            <Field label="Reference / Purpose">
              <Textarea rows={2} placeholder="e.g. Rent, invoice #123" />
            </Field>

            <Button disabled={num <= 0 || overCap || !recipient.trim()}
              className="w-full bg-navy text-navy-foreground hover:bg-navy/90"
              onClick={() => settle(num, `Transfer to ${recipient}`, "Transfer", source)}>
              Review & send <ArrowRight className="ml-1 h-4 w-4" />
            </Button>

            <PiPayButton
              className="w-full"
              amount={num}
              country={country}
              disabled={!num || overCap}
              memo="Meridian transfer funded with Pi"
              metadata={{ type: "transfer", country: country.code, localAmount: num }}
            />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Pi SDK checkout is separate. Paying the app does not credit a bank recipient or convert fiat.
            </p>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Zap className="h-3.5 w-3.5 text-navy" /> Speed
            </div>
            <div className="mt-2 font-serif text-lg font-bold">Instant · 24/7</div>
            <p className="mt-1 text-xs text-muted-foreground">Money lands in seconds on domestic rails.</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-navy" /> Cutoffs
            </div>
            <div className="mt-2 text-sm">{country.notes}</div>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
              <Users className="h-3.5 w-3.5 text-navy" /> Recent recipients
            </div>
            <div className="mt-3 space-y-2">
              {["Aisha K.", "Michael O.", "Landlord — Aptos LLC"].map(n => (
                <button key={n} className="flex w-full items-center gap-2 rounded-md p-1.5 text-left text-sm hover:bg-accent">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-navy/10 text-xs font-semibold text-navy">
                    {n.split(" ").map(x => x[0]).join("").slice(0, 2)}
                  </div>
                  {n}
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium">{label}</Label>{children}</div>;
}
