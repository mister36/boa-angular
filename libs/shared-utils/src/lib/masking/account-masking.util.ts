export function maskAccountNumber(accountNumber: string): string {
  if (!accountNumber) {
    return '';
  }

  if (accountNumber.length <= 4) {
    return accountNumber;
  }

  const lastFour = accountNumber.slice(-4);
  return `****${lastFour}`;
}

export function maskRoutingNumber(routingNumber: string): string {
  if (!routingNumber) {
    return '';
  }

  if (routingNumber.length <= 4) {
    return routingNumber;
  }

  const lastFour = routingNumber.slice(-4);
  return `****${lastFour}`;
}

export function maskCreditCardNumber(cardNumber: string): string {
  if (!cardNumber) {
    return '';
  }

  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length <= 4) {
    return cleaned;
  }

  const lastFour = cleaned.slice(-4);
  const maskedGroups = Math.ceil((cleaned.length - 4) / 4);
  const masked = Array(maskedGroups).fill('****').join(' ');
  return `${masked} ${lastFour}`;
}

export function getLastFourDigits(accountNumber: string): string {
  if (!accountNumber || accountNumber.length < 4) {
    return accountNumber || '';
  }

  return accountNumber.slice(-4);
}
