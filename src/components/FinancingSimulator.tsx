"use client";

import React, { useState, useEffect } from "react";
import { Calculator, Banknote, CalendarDays, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Bank {
  id: number;
  name: string;
  rate: string;
  terms: number[];
  isActive: boolean;
}

interface SimulatorProps {
  vehiclePrice: number;
  vehicleId: number;
  vehicleName: string;
}

export default function FinancingSimulator({ vehiclePrice, vehicleId, vehicleName }: SimulatorProps) {
  const router = useRouter();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(true);

  // Settings
  const minDownPayment = 10;
  const maxDownPayment = 70;
  const step = 5;

  // State
  const [downPaymentPercent, setDownPaymentPercent] = useState(20);
  const [selectedBankId, setSelectedBankId] = useState<number | "">("");
  const [selectedTerm, setSelectedTerm] = useState<number>(36);

  useEffect(() => {
    fetch("/api/banks")
      .then((res) => res.json())
      .then((data) => {
        const activeBanks = data.filter((b: Bank) => b.isActive);
        setBanks(activeBanks);
        if (activeBanks.length > 0) {
          setSelectedBankId(activeBanks[0].id);
          if (activeBanks[0].terms && activeBanks[0].terms.length > 0) {
            setSelectedTerm(activeBanks[0].terms[Math.floor(activeBanks[0].terms.length / 2)]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const downPaymentAmount = (vehiclePrice * downPaymentPercent) / 100;
  const financedAmount = vehiclePrice - downPaymentAmount;

  const selectedBank = banks.find((b) => b.id === selectedBankId);
  const rate = selectedBank ? parseFloat(selectedBank.rate) : 0;

  // Formula: Pago = P * (r(1+r)^n) / ((1+r)^n - 1)
  // P = Amount, r = Monthly rate (e.g. 1.5% = 0.015), n = months
  let monthlyPayment = 0;
  if (financedAmount > 0 && selectedTerm > 0) {
    if (rate > 0) {
      const r = rate / 100;
      const n = selectedTerm;
      monthlyPayment = (financedAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    } else {
      monthlyPayment = financedAmount / selectedTerm;
    }
  }

  const handleApply = () => {
    // Navigate to the multi-step form passing the parameters
    const params = new URLSearchParams({
      vehicleId: vehicleId.toString(),
      price: vehiclePrice.toString(),
      downPayment: downPaymentAmount.toString(),
      financed: financedAmount.toString(),
      term: selectedTerm.toString(),
      bankId: selectedBankId.toString(),
      rate: rate.toString(),
      monthly: monthlyPayment.toString()
    });
    router.push(`/solicitud-credito?${params.toString()}`);
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(val);

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#aaa" }}>Cargando simulador...</div>;
  }

  if (banks.length === 0) {
    return null; // No banks available
  }

  return (
    <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", padding: "1.5rem", marginTop: "2rem" }}>
      <h3 style={{ fontSize: "1.5rem", color: "#cda434", display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
        <Calculator size={24} /> Simula tu financiación
      </h3>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
        {/* Entidad Financiera */}
        <div>
          <label style={{ display: "block", color: "#aaa", marginBottom: "0.5rem" }}>Entidad Financiera</label>
          <select
            value={selectedBankId}
            onChange={(e) => {
              const b = banks.find((b) => b.id === Number(e.target.value));
              setSelectedBankId(Number(e.target.value));
              if (b && b.terms && b.terms.length > 0 && !b.terms.includes(selectedTerm)) {
                setSelectedTerm(b.terms[0]);
              }
            }}
            style={{ width: "100%", padding: "0.8rem", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", color: "#fff", cursor: "pointer" }}
          >
            {banks.map((bank) => (
              <option key={bank.id} value={bank.id}>{bank.name} - Tasa {bank.rate}%</option>
            ))}
          </select>
        </div>

        {/* Plazo */}
        {selectedBank && (
          <div>
            <label style={{ display: "block", color: "#aaa", marginBottom: "0.5rem" }}>Plazo (Meses)</label>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {selectedBank.terms.map((term) => (
                <button
                  key={term}
                  onClick={() => setSelectedTerm(term)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid",
                    borderColor: selectedTerm === term ? "#cda434" : "rgba(255,255,255,0.2)",
                    background: selectedTerm === term ? "rgba(205,164,52,0.2)" : "transparent",
                    color: selectedTerm === term ? "#cda434" : "#aaa",
                    cursor: "pointer"
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Cuota Inicial */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
            <label style={{ color: "#aaa" }}>Cuota Inicial ({downPaymentPercent}%)</label>
            <span style={{ fontWeight: "bold", color: "#fff" }}>{formatCurrency(downPaymentAmount)}</span>
          </div>
          <input
            type="range"
            min={minDownPayment}
            max={maxDownPayment}
            step={step}
            value={downPaymentPercent}
            onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
            style={{ width: "100%", accentColor: "#cda434", cursor: "pointer" }}
          />
        </div>

        {/* Resumen */}
        <div style={{ background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "1.5rem", marginTop: "1rem" }}>
          <div style={{ textAlign: "center", marginBottom: "1rem" }}>
            <p style={{ color: "#aaa", fontSize: "0.9rem", marginBottom: "0.25rem" }}>Tu cuota mensual estimada</p>
            <p style={{ color: "#cda434", fontSize: "2rem", fontWeight: "bold" }}>
              {formatCurrency(monthlyPayment)} <span style={{ fontSize: "1rem", color: "#aaa", fontWeight: "normal" }}>/ mes</span>
            </p>
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc", fontSize: "0.9rem", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span>Precio del vehículo</span>
            <span>{formatCurrency(vehiclePrice)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc", fontSize: "0.9rem", marginBottom: "0.5rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
            <span>Monto financiado</span>
            <span>{formatCurrency(financedAmount)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", color: "#ccc", fontSize: "0.9rem", marginBottom: "1rem" }}>
            <span>Tasa ({selectedBank?.name})</span>
            <span>{rate}% M.V.</span>
          </div>

          <p style={{ fontSize: "0.75rem", color: "#888", textAlign: "center", fontStyle: "italic", marginBottom: "1.5rem" }}>
            * La cuota mostrada es una estimación y puede variar según las condiciones y aprobación de la entidad financiera.
          </p>

          <button
            onClick={handleApply}
            style={{ width: "100%", background: "#cda434", color: "#000", border: "none", padding: "1rem", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer" }}
          >
            Solicitar crédito <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
