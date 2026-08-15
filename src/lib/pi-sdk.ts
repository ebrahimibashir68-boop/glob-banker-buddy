// Thin wrapper around the Pi Network SDK (loaded from sdk.minepi.com in __root).
// Only works inside the Pi Browser.

export interface PiPaymentDTO {
  identifier: string;
  user_uid: string;
  amount: number;
  memo: string;
  metadata: Record<string, unknown>;
  to_address: string;
  created_at: string;
  status: Record<string, boolean>;
  transaction: { txid: string; verified: boolean; _link: string } | null;
}

interface PiSDK {
  init: (opts: { version: string; sandbox?: boolean }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: PiPaymentDTO) => void,
  ) => Promise<{ accessToken: string; user: { uid: string; username: string } }>;
  createPayment: (
    payment: { amount: number; memo: string; metadata: Record<string, unknown> },
    callbacks: {
      onReadyForServerApproval: (paymentId: string) => void;
      onReadyForServerCompletion: (paymentId: string, txid: string) => void;
      onCancel: (paymentId: string) => void;
      onError: (error: Error, payment?: PiPaymentDTO) => void;
    },
  ) => void;
}

declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

let initialized = false;

export function getPi(): PiSDK | null {
  if (typeof window === "undefined" || !window.Pi) return null;
  if (!initialized) {
    window.Pi.init({ version: "2.0" });
    initialized = true;
  }
  return window.Pi;
}

export const isPiBrowser = () =>
  typeof window !== "undefined" && typeof window.Pi !== "undefined";

async function post(path: string, body: unknown) {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export interface PiCheckoutResult {
  paymentId: string;
  txid: string;
}

/**
 * Runs the full User-to-App payment flow:
 * authenticate -> createPayment -> server approve -> server complete.
 */
export function payWithPi(opts: {
  amount: number;
  memo: string;
  metadata?: Record<string, unknown>;
}): Promise<PiCheckoutResult> {
  return new Promise((resolve, reject) => {
    const Pi = getPi();
    if (!Pi) {
      reject(new Error("Open this app in the Pi Browser to pay with Pi."));
      return;
    }

    const onIncomplete = (payment: PiPaymentDTO) => {
      const txid = payment.transaction?.txid;
      if (txid) {
        void post("/api/public/pi/complete", { paymentId: payment.identifier, txid });
      }
    };

    Pi.authenticate(["username", "payments"], onIncomplete)
      .then(() => {
        Pi.createPayment(
          {
            amount: opts.amount,
            memo: opts.memo,
            metadata: opts.metadata ?? {},
          },
          {
            onReadyForServerApproval: (paymentId) => {
              void post("/api/public/pi/approve", { paymentId }).catch(reject);
            },
            onReadyForServerCompletion: (paymentId, txid) => {
              post("/api/public/pi/complete", { paymentId, txid })
                .then(() => resolve({ paymentId, txid }))
                .catch(reject);
            },
            onCancel: () => reject(new Error("Payment cancelled.")),
            onError: (error) => reject(error),
          },
        );
      })
      .catch(reject);
  });
}
