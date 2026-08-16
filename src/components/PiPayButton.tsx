import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { usePiWallet } from "@/lib/pi-wallet";
import { PI_USD, type CountryProfile } from "@/lib/banking";

/** Convert a local-currency amount into π using the indicative FX table. */
export function localToPi(amount: number, country: CountryProfile) {
  const usd = amount * country.fxToUsd;
  return usd / PI_USD;
}

interface Props {
  /** Amount in local currency; converted to π automatically. */
  amount: number;
  country: CountryProfile;
  memo: string;
  metadata?: Record<string, unknown>;
  /** "pay" = user pays the app (U2A) · "payout" = app pays the user (A2U) */
  direction?: "pay" | "payout";
  label?: ReactNode;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "outline" | "secondary" | "ghost";
  disabled?: boolean;
  onDone?: (ref: string) => void;
}

export function PiPayButton({
  amount,
  country,
  memo,
  metadata,
  direction = "pay",
  label,
  className = "",
  size = "default",
  variant,
  disabled,
  onDone,
}: Props) {
  const { pay, payout, connected, connect, connecting } = usePiWallet();
  const [busy, setBusy] = useState(false);
  const pi = localToPi(amount, country);

  const run = async () => {
    if (!connected) {
      const u = await connect();
      if (!u) return;
    }
    if (!Number.isFinite(pi) || pi <= 0) {
      toast.error("Enter an amount first");
      return;
    }
    setBusy(true);
    try {
      if (direction === "payout") {
        const r = await payout({ amount: Number(pi.toFixed(7)), memo, metadata });
        toast.success("Pi payout submitted", {
          description: `${pi.toFixed(4)} π to your wallet · ${r.status}`,
        });
        onDone?.(r.paymentId);
      } else {
        const r = await pay({ amount: Number(pi.toFixed(7)), memo, metadata });
        toast.success("Paid with Pi", {
          description: `${pi.toFixed(4)} π confirmed on Pi Mainnet · txid ${r.txid.slice(0, 10)}…`,
        });
        onDone?.(r.txid);
      }
    } catch (e) {
      toast.error(direction === "payout" ? "Payout failed" : "Pi payment not completed", {
        description: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      size={size}
      variant={variant}
      disabled={disabled || busy || connecting}
      onClick={() => void run()}
      className={
        variant
          ? className
          : `bg-pi text-pi-foreground hover:bg-pi/90 ${className}`
      }
    >
      {busy || connecting ? (
        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
      )}
      {label ?? (
        <>
          {direction === "payout" ? "Receive" : "Pay"} {pi > 0 ? pi.toFixed(4) : "0"} π
        </>
      )}
    </Button>
  );
}
