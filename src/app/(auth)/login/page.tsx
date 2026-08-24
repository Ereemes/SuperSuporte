"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, login, isLoading: authLoading } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/lojas");
  }, [user, authLoading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Preencha todos os campos");
      return;
    }
    setError("");
    setLoading(true);
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error || "Erro ao autenticar");
      setLoading(false);
    }
  }

  if (authLoading || user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--paper)" }}>
        <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "var(--brand)", borderTopColor: "transparent" }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: "var(--paper)" }}
    >
      <div
        className="w-full max-w-[420px] rounded-xl p-8 flex flex-col gap-6"
        style={{
          background: "var(--paper-hi)",
          border: "1px solid var(--rule)",
          boxShadow: "0 8px 32px rgba(17,17,17,.08)",
        }}
      >
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="w-12 h-12">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <path
                d="M 30 88 Q 30 165 65 180 L 65 195 L 135 195 L 135 180 Q 170 165 170 88 Z"
                fill="var(--brand)"
              />
              <circle cx="100" cy="62" r="32" fill="var(--brand)" />
            </svg>
          </div>
          <div className="text-center">
            <h1
              className="text-lg font-semibold tracking-[0.14em] uppercase m-0"
              style={{ color: "var(--ink)" }}
            >
              SUPERSUPORTE
            </h1>
            <p className="text-[13px] mt-1" style={{ color: "var(--muted)" }}>
              Grupo Oscar · TI
            </p>
          </div>
        </div>

        {error && (
          <div
            className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-[13px] font-medium"
            style={{
              background: "var(--alert-soft)",
              color: "var(--alert)",
              border: "1px solid var(--alert)",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="email"
              className="text-[11px] tracking-[0.14em] uppercase font-semibold"
              style={{ color: "var(--muted)" }}
            >
              E-mail
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@grupooscar.com.br"
              autoComplete="email"
              disabled={loading}
              className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-shadow"
              style={{
                background: "var(--paper)",
                border: "1px solid var(--rule-hi)",
                color: "var(--ink)",
              }}
              onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px var(--brand-ring)`)}
              onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="password"
              className="text-[11px] tracking-[0.14em] uppercase font-semibold"
              style={{ color: "var(--muted)" }}
            >
              Senha
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                disabled={loading}
                className="w-full px-3.5 py-2.5 pr-11 rounded-lg text-sm outline-none transition-shadow"
                style={{
                  background: "var(--paper)",
                  border: "1px solid var(--rule-hi)",
                  color: "var(--ink)",
                }}
                onFocus={(e) => (e.currentTarget.style.boxShadow = `0 0 0 3px var(--brand-ring)`)}
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 grid place-items-center rounded-md cursor-pointer"
                style={{ background: "transparent", border: "none", color: "var(--muted)" }}
                tabIndex={-1}
                aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg text-[14px] font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
            style={{
              background: loading ? "var(--brand-hi)" : "var(--brand)",
              color: "#FFFFFF",
              border: "none",
              opacity: loading ? 0.85 : 1,
            }}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>

      <p className="text-[11px] mt-6" style={{ color: "var(--muted-2)" }}>
        SUPERSUPORTE v1.0 · Grupo Oscar TI
      </p>
    </div>
  );
}
