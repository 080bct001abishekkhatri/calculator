// TVM formulas — Engineering Economics (ENCE 356)
// i = decimal rate (e.g. 0.10 for 10%), n = periods

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
  cashflows.reduce((sum, cf, t) => sum + cf / Math.pow(1 + i, t), 0);

export const computeFW = (npv, i, n) => npv * Math.pow(1 + i, n);

export const computeAW = (npv, AP) => npv * AP;