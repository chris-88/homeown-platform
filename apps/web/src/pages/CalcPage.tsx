import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Seo from "@/components/Seo";
import { Input } from "@/components/ui/input";
import { directusPublic } from "@/api/client";
import { DirectusRequestError } from "@/api/directus";
import { CALC_VERSION, type CalcInputs, calculate } from "@/calc/model";

export default function CalcPage() {
  const anonSessionId = useMemo(() => {
    const key = "homeown_anon_session_id";
    const existing = localStorage.getItem(key);
    if (existing) return existing;
    const next = crypto.randomUUID();
    localStorage.setItem(key, next);
    return next;
  }, []);

  const [grossAnnualIncomeEur, setGrossAnnualIncomeEur] = useState(60_000);
  const [targetPurchasePriceEur, setTargetPurchasePriceEur] = useState(240_000);
  const [cashAvailableTodayEur, setCashAvailableTodayEur] = useState(0);
  const [monthlySurplusEur, setMonthlySurplusEur] = useState(400);
  const [assumedPropertyGrowthRatePercent, setAssumedPropertyGrowthRatePercent] =
    useState(6);

  useEffect(() => {
    const storageKey = "homeown_calc_inputs_v1";
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;
    try {
      const data = JSON.parse(stored) as Partial<CalcInputs>;
      if (typeof data.gross_annual_income_eur === "number")
        setGrossAnnualIncomeEur(data.gross_annual_income_eur);
      if (typeof data.target_purchase_price_eur === "number")
        setTargetPurchasePriceEur(data.target_purchase_price_eur);
      if (typeof data.cash_available_today_eur === "number")
        setCashAvailableTodayEur(data.cash_available_today_eur);
      if (typeof data.monthly_surplus_eur === "number")
        setMonthlySurplusEur(data.monthly_surplus_eur);
      if (typeof data.assumed_property_growth_rate_percent === "number")
        setAssumedPropertyGrowthRatePercent(
          data.assumed_property_growth_rate_percent,
        );
    } catch {
      localStorage.removeItem(storageKey);
    }
  }, []);

  const inputs = useMemo<CalcInputs>(
    () => ({
      gross_annual_income_eur: grossAnnualIncomeEur,
      target_purchase_price_eur: targetPurchasePriceEur,
      cash_available_today_eur: cashAvailableTodayEur,
      monthly_surplus_eur: monthlySurplusEur,
      assumed_property_growth_rate_percent: assumedPropertyGrowthRatePercent,
    }),
    [
      assumedPropertyGrowthRatePercent,
      cashAvailableTodayEur,
      grossAnnualIncomeEur,
      monthlySurplusEur,
      targetPurchasePriceEur,
    ],
  );

  useEffect(() => {
    const storageKey = "homeown_calc_inputs_v1";
    localStorage.setItem(storageKey, JSON.stringify(inputs));
  }, [inputs]);

  const outputs = useMemo(() => calculate(inputs).outputs, [inputs]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);

  const formatDuration = (months: number) => {
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    const yearLabel = years === 1 ? "year" : "years";
    const monthLabel = remainingMonths === 1 ? "month" : "months";
    return `${years} ${yearLabel} ${remainingMonths} ${monthLabel}`;
  };

  const verdictCopy = (() => {
    switch (outputs.verdict_code) {
      case "inputs_missing":
        return {
          title: "Add inputs to calculate",
          detail: "Enter all fields to see your result.",
        };
      case "ready_now":
        return {
          title: "Upfront amount looks reachable",
          detail: "Your available funds meet the upfront amount at today’s prices.",
        };
      case "not_reachable":
        return {
          title: "Upfront amount not reachable under these assumptions",
          detail:
            "Over a long time horizon, price growth outpaces the monthly surplus under these assumptions.",
        };
      case "reachable_le_5y":
        return {
          title: "Upfront amount reachable within five years",
          detail: "Indicative only. This is not a commitment or decision.",
        };
      case "reachable_gt_5y":
        return {
          title: "Upfront amount reachable, but takes longer than five years",
          detail: "Indicative only. This is not a commitment or decision.",
        };
      case "target_high_vs_income":
        return {
          title: "Target looks high vs income (rule-of-thumb)",
          detail: "Indicative only. This is not a commitment or decision.",
        };
    }
  })();

  const lastPersistedSignature = useRef<string>("");
  const [persistStatus, setPersistStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [persistError, setPersistError] = useState<string | null>(null);

  useEffect(() => {
    const payload = {
      anon_session_id: anonSessionId,
      inputs_json: inputs,
      outputs_json: outputs,
      calc_version: CALC_VERSION,
    };

    const signature = JSON.stringify(payload);
    if (signature === lastPersistedSignature.current) return;

    const handle = window.setTimeout(async () => {
      setPersistStatus("saving");
      setPersistError(null);

      try {
        await directusPublic.request(`/items/calculator_snapshots/${anonSessionId}`, {
          method: "PATCH",
          body: payload,
        });
      } catch (err) {
        const isNotFound =
          err instanceof DirectusRequestError && err.status === 404;
        if (!isNotFound) {
          setPersistStatus("error");
          setPersistError(err instanceof Error ? err.message : "Save failed");
          return;
        }

        try {
          await directusPublic.request("/items/calculator_snapshots", {
            method: "POST",
            body: { id: anonSessionId, ...payload },
          });
        } catch (err2) {
          setPersistStatus("error");
          setPersistError(err2 instanceof Error ? err2.message : "Save failed");
          return;
        }
      }

      lastPersistedSignature.current = signature;
      setPersistStatus("saved");
    }, 750);

    return () => window.clearTimeout(handle);
  }, [anonSessionId, inputs, outputs]);

  const inputStyles =
    "grid gap-1 rounded-md border bg-background/40 p-3 text-sm";

  return (
    <div className="grid gap-6">
      <Seo
        title="Homeown — Calculator"
        description="Anonymous-first diagnostic calculator. No identifying details required."
      />

      <Card>
        <CardHeader>
          <CardTitle>Calculator</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm text-muted-foreground">
          <div>
            Anonymous-first: no name, email, mobile, or date of birth required.
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className={inputStyles}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-foreground">
                  Gross annual income (EUR)
                </div>
                <div className="font-mono text-xs">
                  {formatCurrency(grossAnnualIncomeEur)}
                </div>
              </div>
              <input
                type="range"
                min={25_000}
                max={150_000}
                step={500}
                value={grossAnnualIncomeEur}
                onChange={(e) => setGrossAnnualIncomeEur(Number(e.target.value))}
              />
              <Input
                type="number"
                inputMode="numeric"
                value={grossAnnualIncomeEur}
                onChange={(e) => setGrossAnnualIncomeEur(Number(e.target.value))}
              />
            </div>

            <div className={inputStyles}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-foreground">
                  Target purchase price (EUR)
                </div>
                <div className="font-mono text-xs">
                  {formatCurrency(targetPurchasePriceEur)}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={800_000}
                step={5_000}
                value={targetPurchasePriceEur}
                onChange={(e) =>
                  setTargetPurchasePriceEur(Number(e.target.value))
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                value={targetPurchasePriceEur}
                onChange={(e) =>
                  setTargetPurchasePriceEur(Number(e.target.value))
                }
              />
            </div>

            <div className={inputStyles}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-foreground">
                  Cash available today (EUR)
                </div>
                <div className="font-mono text-xs">
                  {formatCurrency(cashAvailableTodayEur)}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={100_000}
                step={1_000}
                value={cashAvailableTodayEur}
                onChange={(e) =>
                  setCashAvailableTodayEur(Number(e.target.value))
                }
              />
              <Input
                type="number"
                inputMode="numeric"
                value={cashAvailableTodayEur}
                onChange={(e) =>
                  setCashAvailableTodayEur(Number(e.target.value))
                }
              />
            </div>

            <div className={inputStyles}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-foreground">
                  Monthly surplus (EUR)
                </div>
                <div className="font-mono text-xs">
                  {formatCurrency(monthlySurplusEur)}
                </div>
              </div>
              <input
                type="range"
                min={0}
                max={2_000}
                step={50}
                value={monthlySurplusEur}
                onChange={(e) => setMonthlySurplusEur(Number(e.target.value))}
              />
              <Input
                type="number"
                inputMode="numeric"
                value={monthlySurplusEur}
                onChange={(e) => setMonthlySurplusEur(Number(e.target.value))}
              />
            </div>

            <div className={inputStyles}>
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-foreground">
                  Assumed annual property growth (%)
                </div>
                <div className="font-mono text-xs">
                  {assumedPropertyGrowthRatePercent.toFixed(1)}%
                </div>
              </div>
              <input
                type="range"
                min={3}
                max={9}
                step={0.5}
                value={assumedPropertyGrowthRatePercent}
                onChange={(e) =>
                  setAssumedPropertyGrowthRatePercent(Number(e.target.value))
                }
              />
              <Input
                type="number"
                inputMode="decimal"
                value={assumedPropertyGrowthRatePercent}
                onChange={(e) =>
                  setAssumedPropertyGrowthRatePercent(Number(e.target.value))
                }
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild>
              <Link to="/calc/save">Save results</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/how-it-works">How it works</Link>
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Save status:{" "}
            <span className="font-mono">
              {persistStatus === "saving"
                ? "saving"
                : persistStatus === "saved"
                  ? "saved"
                  : persistStatus === "error"
                    ? "error"
                    : "idle"}
            </span>
            {persistError ? (
              <span className="ml-2 text-destructive">{persistError}</span>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Results</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-muted-foreground">
          <div className="grid gap-1">
            <div className="font-medium text-foreground">{verdictCopy.title}</div>
            <div>{verdictCopy.detail}</div>
          </div>

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-md border bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">
                Indicative mortgage amount (rule-of-thumb)
              </div>
              <div className="text-base font-semibold text-foreground">
                {formatCurrency(outputs.indicative_mortgage_amount_eur)}
              </div>
            </div>

            <div className="rounded-md border bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">
                Upfront amount needed (today)
              </div>
              <div className="text-base font-semibold text-foreground">
                {formatCurrency(outputs.upfront_amount_needed_today_eur)}
              </div>
            </div>

            <div className="rounded-md border bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">
                Time to upfront amount (indicative)
              </div>
              <div className="text-base font-semibold text-foreground">
                {outputs.time_to_upfront_amount_months === null
                  ? "Not reachable"
                  : formatDuration(outputs.time_to_upfront_amount_months)}
              </div>
            </div>

            <div className="rounded-md border bg-background/40 p-3">
              <div className="text-xs text-muted-foreground">
                Upfront amount % used (floor vs limit)
              </div>
              <div className="text-base font-semibold text-foreground">
                {(outputs.upfront_amount_percent_used * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Version: <span className="font-mono">{CALC_VERSION}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
