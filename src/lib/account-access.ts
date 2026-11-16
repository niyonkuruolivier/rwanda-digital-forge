export type AccountRole = "buyer" | "vendor" | "admin";
export function accountAccess(roles: { role: AccountRole; vendor_id: string | null }[]) {
  const seller = roles.find((row) => row.role === "vendor" && row.vendor_id);
  return { role: roles.some((row) => row.role === "admin") ? "admin" as const : seller ? "vendor" as const : "buyer" as const, vendorId: seller?.vendor_id ?? "" };
}
export function safeAccountReturn(path: unknown) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") && !path.includes("\\") && !path.startsWith("/auth") ? path : "/account";
}