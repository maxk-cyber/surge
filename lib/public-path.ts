const configuredBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function publicAssetPath(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!configuredBasePath) return normalizedPath;
  return `${configuredBasePath}${normalizedPath}`;
}
