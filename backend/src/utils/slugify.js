/**
 * Slug generation utility.
 */

export function generateSlug(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Remove invalid chars
    .replace(/\s+/g, '-')         // Collapse whitespace and replace by -
    .replace(/-+/g, '-')          // Collapse dashes
    .substring(0, 100)            // Max 100 chars
    .replace(/^-+|-+$/g, '');     // Trim hyphens from start and end
}

export async function generateUniqueSlug(text, checkExists) {
  let baseSlug = generateSlug(text);
  if (!baseSlug) baseSlug = 'group';

  let currentSlug = baseSlug;
  let exists = await checkExists(currentSlug);
  let retries = 0;

  while (exists && retries < 5) {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    currentSlug = `${baseSlug.substring(0, 95)}-${randomSuffix}`;
    exists = await checkExists(currentSlug);
    retries++;
  }

  if (exists) {
    throw new Error('Unable to generate unique slug after 5 retries');
  }

  return currentSlug;
}
