export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

export function toRupees(paise: number): number {
  return paise / 100;
}

export function formatINR(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(rupees);
}

export function calculatePlatformFee(amountPaise: number, commissionPct = 20): number {
  return Math.round((amountPaise * commissionPct) / 100);
}

export function calculateMentorEarning(amountPaise: number, commissionPct = 20): number {
  const fee = calculatePlatformFee(amountPaise, commissionPct);
  return amountPaise - fee;
}
