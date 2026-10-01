export const STALL_CODE_PATTERN = /^MSZ-[A-Z]\d{2}$/;
export const PHONE_PATTERN = /^07[2389]\d{7}$/;

export const STALL_CODE_ERROR = 'Stall code must look like MSZ-A12 (MSZ, dash, one capital letter, two digits).';
export const PHONE_ERROR = 'Enter a 10-digit Rwanda number starting with 072, 073, 078 or 079.';

export function isValidStallCode(value: string): boolean {
  return STALL_CODE_PATTERN.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_PATTERN.test(value.trim());
}
