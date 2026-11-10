import { randomBytes } from 'crypto';

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function generateUniqueSlug(
  text: string,
  checkExists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const baseSlug = generateSlug(text) || 'item';
  let slug = baseSlug;
  let counter = 1;

  while (await checkExists(slug)) {
    const suffix = counter > 3 ? randomBytes(2).toString('hex') : `${counter}`;
    slug = `${baseSlug}-${suffix}`;
    counter++;
  }

  return slug;
}
