"use client";

import { useEffect, useRef, useState } from "react";
import { Store } from "@/lib/types";

interface Props {
  store: Store | null;
  onClose: () => void;
}

function Field({ label, value, mono }: { label: string; value: string | null | undefined; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10.5px] tracking-[0.14em] uppercase font-semibold" style={{ color: "var(--muted)" }}>
        {label}
      </span>
      <span className={`text-sm py-0.5 ${mono ? "font-mono text-[13px]" : ""}`} style={{ color: "var(--ink)" }}>
        {value}
      </span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3.5">
      <div className="pb-2.5" style={{ borderBottom: "1px solid var(--rule)" }}>
        <h4 className="text-[11.5px] tracking-[0.16em] uppercase font-semibold m-0" style={{ color: "var(--muted)" }}>
          {title}
        </h4>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 gap-x-6">{children}</div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Aberta: "ok",
    Fechada: "mute",
  };
  const variant = map[status] || "warn";
  const classes: Record<string, string> = {
    ok: "bg-[var(--ok-soft)] text-[var(--ok)]",
    warn: "bg-[var(--warn-soft)] text-[var(--warn)]",
    alert: "bg-[var(--alert-soft)] text-[var(--alert)]",
    mute: "bg-[var(--paper-sub)] text-[var(--muted)]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[12px] font-semibold ${classes[variant]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}




export function StoreDrawer({ store, onClose }: Props) {
  const asideRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!store) return;

    document.body.style.overflow = "hidden";

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);

    asideRef.current?.focus();

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKey);
    };
  }, [store, onClose]);

  if (!store) return null;

  const waDigits = store.whatsapp?.replace(/\D/g, "") || "";
  const waNumber = waDigits.startsWith("55") ? waDigits : `55${waDigits}`;

  const hasHours = store.horaAbertura || store.horaFechamento;
  const hoursText = hasHours
    ? [store.horaAbertura, store.horaFechamento].filter(Boolean).join(" – ")
    : null;

  return (
    <>
      <div
        className="fixed inset-0 z-20 transition-opacity"
        style={{ background: "rgba(17,17,17,.35)" }}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Detalhes da loja ${store.nome}`}
        tabIndex={-1}
        className="fixed top-0 right-0 bottom-0 z-30 flex flex-col outline-none"
        style={{
          width: "min(720px, 94vw)",
          background: "var(--paper-hi)",
          borderLeft: "1px solid var(--rule)",
          boxShadow: "-30px 0 60px rgba(17,17,17,.15)",
        }}
      >
        <div className="px-6 pt-4 pb-0" style={{ background: "var(--paper-sub)" }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] tracking-[0.12em] uppercase font-semibold" style={{ color: "var(--muted)" }}>
              Loja {store.codigo}
            </span>
            <button
              onClick={onClose}
              aria-label="Fechar painel"
              className="w-8 h-8 grid place-items-center rounded-md cursor-pointer transition-colors"
              style={{ color: "var(--ink-soft)", background: "transparent", border: "none" }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
          <h2 className="text-[22px] font-semibold m-0 flex items-center gap-3 flex-wrap" style={{ letterSpacing: "-0.01em" }}>
            {store.nome}
            <StatusPill status={store.status} />
          </h2>
          <p className="text-[13px] mt-1 flex items-center gap-1.5 flex-wrap" style={{ color: "var(--muted)" }}>
            {store.cidade} · {store.uf}
            {store.unidadeNegocio && <> · {store.unidadeNegocio}</>}
            {hoursText && (
              <span className="inline-flex items-center gap-1 ml-1 px-2 py-0.5 rounded text-[11.5px]" style={{ background: "var(--paper)", border: "1px solid var(--rule)", color: "var(--ink-soft)" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-3 h-3">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                {hoursText}
              </span>
            )}
          </p>

        </div>

        <div
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5"
          style={{ borderTop: "1px solid var(--rule)" }}
        >
              {store.status !== "Fechada" && (store.telefone || store.whatsapp || store.emailLoja || store.emailGerente) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {store.telefone && (
                    <div className="rounded-lg p-3.5 flex flex-col gap-2.5" style={{ background: "var(--paper)", border: "1px solid var(--rule)" }}>
                      <span className="text-[10.5px] tracking-[0.14em] uppercase font-semibold flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        Telefone
                      </span>
                      <span className="font-mono text-sm" style={{ color: "var(--ink)" }}>{store.telefone}</span>
                      <a
                        href={`tel:${store.telefone.replace(/\D/g, "")}`}
                        className="px-3 py-2 rounded-md text-[12.5px] font-semibold text-center text-white no-underline"
                        style={{ background: "var(--brand)" }}
                      >
                        Ligar agora
                      </a>
                    </div>
                  )}
                  {store.whatsapp && (
                    <div className="rounded-lg p-3.5 flex flex-col gap-2.5" style={{ background: "var(--paper)", border: "1px solid var(--rule)" }}>
                      <span className="text-[10.5px] tracking-[0.14em] uppercase font-semibold flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        WhatsApp
                      </span>
                      <span className="font-mono text-sm break-all" style={{ color: "var(--ink)" }}>{store.whatsapp}</span>
                      <a
                        href={`https://wa.me/${waNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 rounded-md text-[12.5px] font-semibold text-center text-white no-underline"
                        style={{ background: "#25D366" }}
                      >
                        Enviar mensagem
                      </a>
                    </div>
                  )}
                  {store.emailLoja && (
                    <div className="rounded-lg p-3.5 flex flex-col gap-2.5" style={{ background: "var(--paper)", border: "1px solid var(--rule)" }}>
                      <span className="text-[10.5px] tracking-[0.14em] uppercase font-semibold flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        E-mail Loja
                      </span>
                      <span className="font-mono text-sm break-all" style={{ color: "var(--ink)" }}>{store.emailLoja}</span>
                      <a
                        href={`mailto:${store.emailLoja}`}
                        className="px-3 py-2 rounded-md text-[12.5px] font-semibold text-center no-underline"
                        style={{ background: "var(--ink)", color: "var(--paper-hi)" }}
                      >
                        Enviar e-mail
                      </a>
                    </div>
                  )}
                  {store.emailGerente && (
                    <div className="rounded-lg p-3.5 flex flex-col gap-2.5" style={{ background: "var(--paper)", border: "1px solid var(--rule)" }}>
                      <span className="text-[10.5px] tracking-[0.14em] uppercase font-semibold flex items-center gap-2" style={{ color: "var(--muted)" }}>
                        E-mail Gerente
                      </span>
                      <span className="font-mono text-sm break-all" style={{ color: "var(--ink)" }}>{store.emailGerente}</span>
                      <a
                        href={`mailto:${store.emailGerente}`}
                        className="px-3 py-2 rounded-md text-[12.5px] font-semibold text-center no-underline"
                        style={{ background: "var(--ink)", color: "var(--paper-hi)" }}
                      >
                        Enviar e-mail
                      </a>
                    </div>
                  )}
                </div>
              )}

              {store.fornecedorAtendimento && (
                <Section title="Atendimento">
                  <Field label="Fornecedor" value={store.fornecedorAtendimento} />
                  {store.possuiTaxaDeslocamento && (
                    <Field label="Taxa de deslocamento" value="Sim" />
                  )}
                </Section>
              )}

              <Section title="Identificacao">
                <Field label="CNPJ" value={store.cnpj} mono />
                <Field label="Razao Social" value={store.razaoSocial} />
                <Field label="Grupo Financeiro" value={store.grupoFinanceiro} />
                <Field label="Regional" value={store.regional} />
                <Field label="Diretor" value={store.diretor} />
              </Section>

              <Section title="Localizacao">
                <Field label="Logradouro" value={store.logradouro} />
                <Field label="Numero" value={store.numero} />
                <Field label="Complemento" value={store.complemento} />
                <Field label="Bairro" value={store.bairro} />
                <Field label="CEP" value={store.cep} mono />
              </Section>

              {(store.ip || store.linkInternet || store.operadora || store.tipoConexao || store.qtdePdvs || store.servidorLocal || store.modeloEquipamento) && (
                <Section title="Infraestrutura TI">
                  <Field label="IP" value={store.ip} mono />
                  <Field label="Link de Internet" value={store.linkInternet} />
                  <Field label="Operadora" value={store.operadora} />
                  <Field label="Tipo de Conexao" value={store.tipoConexao} />
                  <Field label="Qtde PDVs" value={store.qtdePdvs?.toString()} mono />
                  <Field label="Servidor Local" value={store.servidorLocal} />
                  <Field label="Modelo Equipamento" value={store.modeloEquipamento} />
                </Section>
              )}

              {(store.versaoMegastore || store.versaoRetaguarda || store.versaoFrente || store.ambiente || store.homologacao) && (
                <Section title="Sistemas">
                  <Field label="Versao MegaStore" value={store.versaoMegastore} mono />
                  <Field label="Versao Retaguarda" value={store.versaoRetaguarda} mono />
                  <Field label="Versao Frente" value={store.versaoFrente} mono />
                  <Field label="Ambiente" value={store.ambiente} />
                  <Field label="Homologacao" value={store.homologacao} />
                </Section>
              )}

              {store.observacoes && (
                <Section title="Observacoes">
                  <div className="col-span-2">
                    <p className="text-sm" style={{ color: "var(--ink)" }}>{store.observacoes}</p>
                  </div>
                </Section>
              )}
        </div>

        <div
          className="px-6 py-3.5 flex justify-between items-center text-xs"
          style={{ background: "var(--paper-sub)", borderTop: "1px solid var(--rule)", color: "var(--muted)" }}
        >
          <span>Ultima atualizacao · {store.ultimaAtualizacao || "—"}</span>
        </div>
      </aside>
    </>
  );
}
