const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const SSN_REGEX = /\d{3}[-\s]?\d{2}[-\s]?\d{4}/g;
const ACCOUNT_NUMBER_REGEX = /\b\d{8,16}\b/g;

export function redactEmail(email: string): string {
  if (!email) {
    return '';
  }

  const atIndex = email.indexOf('@');
  if (atIndex <= 0) {
    return email;
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (localPart.length <= 2) {
    return `*${domain}`;
  }

  const firstChar = localPart[0];
  const lastChar = localPart[localPart.length - 1];
  const masked = '*'.repeat(Math.min(localPart.length - 2, 6));
  return `${firstChar}${masked}${lastChar}${domain}`;
}

export function redactPhone(phone: string): string {
  if (!phone) {
    return '';
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 4) {
    return '****';
  }

  const lastFour = digits.slice(-4);
  return `(***) ***-${lastFour}`;
}

export function redactSsn(ssn: string): string {
  if (!ssn) {
    return '';
  }

  const digits = ssn.replace(/\D/g, '');
  if (digits.length < 4) {
    return '***-**-****';
  }

  const lastFour = digits.slice(-4);
  return `***-**-${lastFour}`;
}

export function redactPii(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'string') {
    return redactStringValue(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => redactPii(item));
  }

  if (typeof obj === 'object') {
    const redacted: any = {};
    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();

      if (lowerKey.includes('email')) {
        redacted[key] = typeof obj[key] === 'string' ? redactEmail(obj[key]) : obj[key];
      } else if (lowerKey.includes('phone') || lowerKey.includes('mobile') || lowerKey.includes('tel')) {
        redacted[key] = typeof obj[key] === 'string' ? redactPhone(obj[key]) : obj[key];
      } else if (lowerKey.includes('ssn') || lowerKey.includes('social')) {
        redacted[key] = typeof obj[key] === 'string' ? redactSsn(obj[key]) : obj[key];
      } else if (lowerKey.includes('account') && lowerKey.includes('number')) {
        redacted[key] = typeof obj[key] === 'string' ? maskAccountStr(obj[key]) : obj[key];
      } else if (lowerKey === 'password' || lowerKey === 'secret' || lowerKey === 'token') {
        redacted[key] = '[REDACTED]';
      } else {
        redacted[key] = redactPii(obj[key]);
      }
    }
    return redacted;
  }

  return obj;
}

function redactStringValue(value: string): string {
  let result = value;
  result = result.replace(SSN_REGEX, '***-**-****');
  result = result.replace(EMAIL_REGEX, (match) => redactEmail(match));
  result = result.replace(PHONE_REGEX, (match) => redactPhone(match));
  return result;
}

function maskAccountStr(accountNumber: string): string {
  if (!accountNumber || accountNumber.length <= 4) {
    return accountNumber;
  }
  return `****${accountNumber.slice(-4)}`;
}
