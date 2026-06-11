// TVM formulas — Engineering Economics (ENCE 356)

export const computeFactors = (i, n) => {
  const iN = Math.pow(1 + i, n);

  return {
    PF: 1 / iN,
    FP: iN,
    PA: (iN - 1) / (i * iN),
    AP: (i * iN) / (iN - 1),
    FA: (iN - 1) / i,
    AF: i / (iN - 1),
  };
};

export const computeNPV = (i, cashflows) =>
  cashflows.reduce(
    (sum, cf, t) => sum + cf / Math.pow(1 + i, t),
    0
  );

export const computeFW = (npv, i, n) =>
  npv * Math.pow(1 + i, n);

export const computeAW = (npv, AP) =>
  npv * AP;

export const computeIRR = (cashflows) => {
  const hasPositive = cashflows.some(cf => cf > 0);
  const hasNegative = cashflows.some(cf => cf < 0);

  if (!hasPositive || !hasNegative) return null;

  const npv = (rate) =>
    cashflows.reduce(
      (sum, cf, t) => sum + cf / Math.pow(1 + rate, t),
      0
    );

  let lo = -0.999;
  let hi = 10;

  if (npv(lo) * npv(hi) > 0) return null;

  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;

    if (Math.abs(hi - lo) < 1e-8)
      return mid * 100;

    if (npv(lo) * npv(mid) <= 0)
      hi = mid;
    else
      lo = mid;
  }

  return ((lo + hi) / 2) * 100;
};

export const computePayback = (cashflows) => {
  let cumulative = 0;

  for (let t = 0; t < cashflows.length; t++) {
    const prev = cumulative;
    cumulative += cashflows[t];

    if (cumulative >= 0 && t > 0) {
      return t - 1 + Math.abs(prev) / cashflows[t];
    }
  }

  return null;
};