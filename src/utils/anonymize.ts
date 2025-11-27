/**
 * Legal Tier 1 Compliance: Username Anonymization
 * Protects user privacy by obscuring identifiable information
 */

export function anonymizeUsername(username: string): string {
  if (!username || username.length <= 3) {
    return 'User***';
  }
  
  // Handle Reddit usernames (u/username)
  if (username.startsWith('u/')) {
    const actualName = username.slice(2);
    return `u/${actualName.slice(0, Math.min(3, actualName.length))}***`;
  }
  
  // Handle Twitter handles (@username)
  if (username.startsWith('@')) {
    const actualName = username.slice(1);
    return `@${actualName.slice(0, Math.min(2, actualName.length))}***`;
  }
  
  // Default: Show first 3 characters
  return username.slice(0, 3) + '***';
}

export function anonymizeEmail(email: string): string {
  if (!email || !email.includes('@')) return 'user***@***.com';
  
  const [local, domain] = email.split('@');
  const localAnon = local.slice(0, 2) + '***';
  const domainParts = domain.split('.');
  const domainAnon = domainParts[0].slice(0, 1) + '***.' + domainParts[domainParts.length - 1];
  
  return `${localAnon}@${domainAnon}`;
}