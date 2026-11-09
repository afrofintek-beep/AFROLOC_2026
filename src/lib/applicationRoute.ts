// Keep the complete application at its original URL. Old SMS links remain usable.
export function applicationRoute(pathname: string, search: string): "fair" | "original" {
  return /^\/feira(?:\/|$)/.test(pathname) || new URLSearchParams(search).has("witness")
    ? "fair" : "original";
}
