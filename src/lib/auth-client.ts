/**
 * Auth.js validates absolute callback URLs on the server. Building the login
 * callback from the browser origin keeps every product subdomain in its own
 * auth flow instead of inheriting an accidentally configured local URL.
 */
export function getCurrentLoginUrl(): string {
  if (typeof window === "undefined") return "/login";
  return new URL("/login", window.location.origin).toString();
}
