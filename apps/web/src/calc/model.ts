export const CALC_VERSION = "cz-v1";

export type CalcInputs = {
  gross_annual_income_eur: number;
  target_purchase_price_eur: number;
  cash_available_today_eur: number;
  monthly_surplus_eur: number;
  assumed_property_growth_rate_percent: number;
};

export type CalcVerdictCode =
  | "inputs_missing"
  | "ready_now"
  | "not_reachable"
  | "reachable_le_5y"
  | "reachable_gt_5y"
  | "target_high_vs_income";

export type CalcOutputs = {
  mortgage_multiple_used: number;
  indicative_mortgage_amount_eur: number;
  upfront_amount_percent_used: number;
  upfront_amount_needed_today_eur: number;
  upfront_amount_due_to_mortgage_limit_eur: number;
  time_to_upfront_amount_months: number | null;
  upfront_amount_at_catch_eur: number | null;
  verdict_code: CalcVerdictCode;
};

type CalcModelResult = {
  outputs: CalcOutputs;
};

function clampNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

export function calculate(inputs: CalcInputs): CalcModelResult {
  const mortgageMultipleUsed = 4;

  const grossAnnualIncomeEur = clampNonNegative(inputs.gross_annual_income_eur);
  const targetPurchasePriceEur = clampNonNegative(inputs.target_purchase_price_eur);
  const cashAvailableTodayEur = clampNonNegative(inputs.cash_available_today_eur);
  const monthlySurplusEur = clampNonNegative(inputs.monthly_surplus_eur);
  const annualGrowthRatePercent = clampNonNegative(
    inputs.assumed_property_growth_rate_percent,
  );

  const hasRequiredInputs = targetPurchasePriceEur > 0 && grossAnnualIncomeEur > 0;

  const indicativeMortgageAmountEur = grossAnnualIncomeEur * mortgageMultipleUsed;

  const upfrontAmountDueToMortgageLimitEur = Math.max(
    0,
    targetPurchasePriceEur - indicativeMortgageAmountEur,
  );

  const upfrontAmountPercentDueToMortgageLimit =
    targetPurchasePriceEur > 0
      ? upfrontAmountDueToMortgageLimitEur / targetPurchasePriceEur
      : 0;

  const upfrontFloorPercent = 0.1;
  const upfrontPercentUsed = Math.max(
    upfrontFloorPercent,
    upfrontAmountPercentDueToMortgageLimit,
  );

  const monthlyGrowth =
    Math.pow(1 + annualGrowthRatePercent / 100, 1 / 12) - 1;

  const upfrontAmountNeededTodayEur = hasRequiredInputs
    ? targetPurchasePriceEur * upfrontPercentUsed
    : 0;

  let catchMonth: number | null = null;
  let upfrontAmountAtCatchEur: number | null = null;

  if (hasRequiredInputs) {
    for (let t = 0; t <= 480; t += 1) {
      const cash = cashAvailableTodayEur + monthlySurplusEur * t;
      const upfrontTarget =
        targetPurchasePriceEur * upfrontPercentUsed * Math.pow(1 + monthlyGrowth, t);

      if (cash >= upfrontTarget) {
        catchMonth = t;
        upfrontAmountAtCatchEur = upfrontTarget;
        break;
      }
    }
  }

  const verdictCode: CalcVerdictCode = (() => {
    if (!hasRequiredInputs) return "inputs_missing";

    const readyNow = cashAvailableTodayEur >= upfrontAmountNeededTodayEur;
    if (readyNow) return "ready_now";

    const notReachable = catchMonth === null;
    if (upfrontAmountPercentDueToMortgageLimit > upfrontFloorPercent) {
      return notReachable ? "target_high_vs_income" : "target_high_vs_income";
    }

    if (notReachable) return "not_reachable";
    if (catchMonth <= 60) return "reachable_le_5y";
    return "reachable_gt_5y";
  })();

  return {
    outputs: {
      mortgage_multiple_used: mortgageMultipleUsed,
      indicative_mortgage_amount_eur: indicativeMortgageAmountEur,
      upfront_amount_percent_used: upfrontPercentUsed,
      upfront_amount_needed_today_eur: upfrontAmountNeededTodayEur,
      upfront_amount_due_to_mortgage_limit_eur: upfrontAmountDueToMortgageLimitEur,
      time_to_upfront_amount_months: catchMonth,
      upfront_amount_at_catch_eur: upfrontAmountAtCatchEur,
      verdict_code: verdictCode,
    },
  };
}

