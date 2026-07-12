import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { COUNTRIES, getCountry, type CountryCode, type CentralBank } from "./banking";

interface Ctx {
  country: CentralBank;
  setCountry: (c: CountryCode) => void;
  all: CentralBank[];
}

const CountryCtx = createContext<Ctx | null>(null);

export function CountryProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<CountryCode>("US");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? window.localStorage.getItem("bank.country") : null;
    if (saved && COUNTRIES.some((c) => c.code === saved)) setCode(saved as CountryCode);
  }, []);

  const setCountry = (c: CountryCode) => {
    setCode(c);
    if (typeof window !== "undefined") window.localStorage.setItem("bank.country", c);
  };

  return (
    <CountryCtx.Provider value={{ country: getCountry(code), setCountry, all: COUNTRIES }}>
      {children}
    </CountryCtx.Provider>
  );
}

export function useCountry() {
  const ctx = useContext(CountryCtx);
  if (!ctx) throw new Error("useCountry must be used within CountryProvider");
  return ctx;
}
