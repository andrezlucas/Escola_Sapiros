export const MAX_DESCRICAO_LENGTH = 2000;
export const MAX_METADATA_LENGTH = 4000;

export function truncate(str: string, maxLen: number): string {
  if (!str) return str;
  return str.length > maxLen ? str.slice(0, maxLen) : str;
}

export function sanitizeMetadata(metadata: Record<string, any>): Record<string, any> {
  if (!metadata) return metadata;
  const json = JSON.stringify(metadata);
  if (json.length > MAX_METADATA_LENGTH) {
    return { truncated: true, originalSize: json.length };
  }
  return metadata;
}

export function obfuscateCPF(cpf: string): string {
  if (!cpf || cpf.length !== 11) return cpf;
  return `${cpf.slice(0, 3)}.***.***-${cpf.slice(-2)}`;
}

export function obfuscateEmail(email: string): string {
  if (!email || !email.includes('@')) return email;
  const [user, domain] = email.split('@');
  const visible = Math.min(2, user.length);
  return `${user.slice(0, visible)}***@${domain}`;
}
