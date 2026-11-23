export const STAFF_TASKS = [
  { id: "applications", label: "Vendor applications", hint: "Approve or reject new sellers" },
  { id: "vendors", label: "Vendors", hint: "Block, suspend, verify sellers and answer appeals" },
  { id: "products", label: "Products & stories", hint: "Remove bad posts" },
  { id: "categories", label: "Categories", hint: "Add categories and pictures" },
  { id: "orders", label: "Orders", hint: "See orders and buyer purchases" },
  { id: "complaints", label: "Complaints", hint: "Decide refunds on complaints" },
  { id: "accounts", label: "Accounts", hint: "See all member accounts" },
] as const;
export type StaffTask = (typeof STAFF_TASKS)[number]["id"];
export const STAFF_TASK_IDS = STAFF_TASKS.map((t) => t.id) as [StaffTask, ...StaffTask[]];
/** Admin sees every section; helpers only sections matching their tasks. Money sections stay admin-only. */
export function visibleAdminSections(isAdmin: boolean, tasks: readonly string[]) {
  if (isAdmin) return null;
  const map: Record<string, string[]> = { applications: ["applications"], vendors: ["vendors"], products: ["products"], categories: ["categories"], orders: ["orders", "buyers"], complaints: ["complaints"], accounts: ["accounts"] };
  return new Set(tasks.flatMap((t) => map[t] ?? []));
}
