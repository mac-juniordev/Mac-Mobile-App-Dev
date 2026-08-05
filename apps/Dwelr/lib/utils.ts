export const formatPrice = (value: number): string => {
  if (value >= 1000000) {
    const millions = (value / 1000000)
      .toFixed(1)
      .replace(/\.0$/, "");

    return `${millions}M FCFA`;
  }

  return `${value.toLocaleString("en-US")} FCFA`;
};