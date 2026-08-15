import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { isPiBrowser, payWithPi } from "@/lib/pi-sdk";

export const PREMIUM_PI_PRICE = 1;

const PERKS = [
  "Higher domestic & international transfer caps",
  "Zero-fee Pi ↔ local currency swaps",
  "Priority SWIFT / SEPA wire processing",
  "Unlimited scheduled bill auto-pays",
];

export function PiPremiumCheckout() {
  const [inPiBrowser, setInPiBrowser] = useState(false);
  const [busy, setBusy] = useState(false);
  const [txid, setTxid] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setInPiBrowser(isPiBrowser()), 400);
    return () => clearTimeout(t);
  }, []);

  const buy = async () => {
    setBusy(true);
    try {
      const result = await payWithPi({
        amount: PREMIUM_PI_PRICE,
        memo: "Meridian Premium — monthly subscription",
        metadata: { product: "premium_monthly" },
      });
      setTxid(result.txid);
      toast.success("Premium activated", {
        description: `Payment confirmed on Pi Mainnet · txid ${result.txid.slice(0, 10)}…`,
      });
    } catch (e) {
      toast.error("Payment not completed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-pi">
        <Sparkles className="h-3.5 w-3.5" /> User-to-App payment
      </div>
      <h3 className="mt-2 font-serif text-lg font-bold text-navy">Meridian Premium</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Pay {PREMIUM_PI_PRICE} π per month directly from your Pi wallet. Approved and completed
        server-side through the Pi Platform API.
      </p>

      <ul className="mt-4 space-y-2">
        {PERKS.map((p) => (
          <li key={p} className="flex items-start gap-2 text-sm">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <span>{p}</span>
          </li>
        ))}
      </ul>

      <Button
        className="mt-5 w-full bg-pi text-pi-foreground hover:bg-pi/90"
        disabled={busy || !!txid}
        onClick={buy}
      >
        {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {txid ? "Premium active" : `Pay ${PREMIUM_PI_PRICE} π with Pi`}
      </Button>

      {txid && (
        <div className="mt-3 break-all rounded-md bg-muted p-3 font-mono text-[11px] text-muted-foreground">
          txid: {txid}
        </div>
      )}

      {!inPiBrowser && (
        <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
          Open this page in the <strong>Pi Browser</strong> to complete a real payment — the Pi SDK
          is only available there.
        </p>
      )}
    </Card>
  );
}
