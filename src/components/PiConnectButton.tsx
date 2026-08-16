import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePiWallet } from "@/lib/pi-wallet";
import { Loader2, Sparkles, Wallet, LogOut } from "lucide-react";

export function PiConnectButton({ className = "" }: { className?: string }) {
  const { connected, connecting, user, connect, disconnect, available } = usePiWallet();

  if (!connected) {
    return (
      <Button
        variant="outline"
        className={`h-9 gap-1.5 border-pi/40 text-pi hover:bg-pi/10 hover:text-pi ${className}`}
        disabled={connecting}
        onClick={() => void connect()}
      >
        {connecting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Sparkles className="h-3.5 w-3.5" />
        )}
        <span className="text-xs font-semibold">
          {connecting ? "Connecting…" : available ? "Connect Pi wallet" : "Pi wallet"}
        </span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={`h-9 gap-1.5 border-pi/40 text-pi ${className}`}>
          <Wallet className="h-3.5 w-3.5" />
          <span className="max-w-[7rem] truncate text-xs font-semibold">@{user?.username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-xs">Pi wallet connected</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="px-2 pb-2 text-[11px] leading-relaxed text-muted-foreground">
          Payments, bills, transfers, and payouts in this app can settle directly from your Pi
          wallet on Pi Mainnet.
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnect} className="gap-2 text-destructive">
          <LogOut className="h-3.5 w-3.5" /> Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
