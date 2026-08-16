import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { getPi, isPiBrowser, payWithPi, type PiCheckoutResult } from "@/lib/pi-sdk";

export interface PiWalletUser {
  uid: string;
  username: string;
}

interface PiWalletState {
  /** true once the Pi SDK is detected (Pi Browser only) */
  available: boolean;
  user: PiWalletUser | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<PiWalletUser | null>;
  disconnect: () => void;
  /** User-to-App payment (user pays the bank/app) */
  pay: (opts: {
    amount: number;
    memo: string;
    metadata?: Record<string, unknown>;
  }) => Promise<PiCheckoutResult>;
  /** App-to-User payment (app pays the user out in Pi) */
  payout: (opts: {
    amount: number;
    memo: string;
    metadata?: Record<string, unknown>;
  }) => Promise<{ paymentId: string; status: string }>;
}

const Ctx = createContext<PiWalletState | null>(null);

const STORAGE_KEY = "meridian.pi.username";

export function PiWalletProvider({ children }: { children: ReactNode }) {
  const [available, setAvailable] = useState(false);
  const [user, setUser] = useState<PiWalletUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    let tries = 0;
    const id = setInterval(() => {
      tries += 1;
      if (isPiBrowser()) {
        setAvailable(true);
        clearInterval(id);
      } else if (tries > 20) {
        clearInterval(id);
      }
    }, 250);
    return () => clearInterval(id);
  }, []);

  const connect = useCallback(async () => {
    const Pi = getPi();
    if (!Pi) {
      toast.error("Pi wallet unavailable", {
        description: "Open Meridian in the Pi Browser to connect your Pi wallet.",
      });
      return null;
    }
    setConnecting(true);
    try {
      const auth = await Pi.authenticate(
        ["username", "payments", "wallet_address"],
        (payment) => {
          const txid = payment.transaction?.txid;
          if (txid) {
            void fetch("/api/public/pi/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ paymentId: payment.identifier, txid }),
            });
          }
        },
      );
      const next = { uid: auth.user.uid, username: auth.user.username };
      setUser(next);
      setAccessToken(auth.accessToken);
      try {
        localStorage.setItem(STORAGE_KEY, next.username);
      } catch {
        /* ignore */
      }
      toast.success(`Pi wallet connected · @${next.username}`, {
        description: "All payments and transactions can now settle in π.",
      });
      return next;
    } catch (e) {
      toast.error("Could not connect Pi wallet", {
        description: e instanceof Error ? e.message : "Authentication was cancelled.",
      });
      return null;
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    toast("Pi wallet disconnected");
  }, []);

  const pay = useCallback<PiWalletState["pay"]>(
    async (opts) => {
      if (!user) {
        const u = await connect();
        if (!u) throw new Error("Pi wallet is not connected.");
      }
      return payWithPi(opts);
    },
    [user, connect],
  );

  const payout = useCallback<PiWalletState["payout"]>(
    async (opts) => {
      let token = accessToken;
      if (!token) {
        const u = await connect();
        if (!u) throw new Error("Pi wallet is not connected.");
        token = null; // state updates async; re-read below
      }
      const res = await fetch("/api/public/pi/payout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token ?? accessToken ?? ""}`,
        },
        body: JSON.stringify({
          amount: opts.amount,
          memo: opts.memo,
          metadata: opts.metadata ?? {},
        }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        paymentId?: string;
        status?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(json.error ?? "Payout failed.");
      return { paymentId: json.paymentId ?? "", status: json.status ?? "created" };
    },
    [accessToken, connect],
  );

  const value = useMemo<PiWalletState>(
    () => ({
      available,
      user,
      connected: !!user,
      connecting,
      connect,
      disconnect,
      pay,
      payout,
    }),
    [available, user, connecting, connect, disconnect, pay, payout],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function usePiWallet(): PiWalletState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePiWallet must be used inside <PiWalletProvider>");
  return ctx;
}
