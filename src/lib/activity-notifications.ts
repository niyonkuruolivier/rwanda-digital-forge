export type ActivityAlert = { id: string; title: string; detail: string; href: string; kind: string; created_at: string };

export function unreadActivityCount(alerts: ActivityAlert[], readIds: string[]) {
  const read = new Set(readIds);
  return alerts.filter(alert => !read.has(alert.id)).length;
}

export function activityDestination(href: string) {
  if (["/orders", "/dashboard", "/admin", "/account", "/become-vendor"].includes(href)) return href;
  if (/^\/(products|vendors)\/[a-zA-Z0-9_-]+$/.test(href)) return href;
  return "/";
}