<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Seller catalog changes use marketplace_content with server-verified vendor ownership, RLS and realtime refresh; seed catalog remains illustrative, while orders and financial state stay browser-local demonstrations.
- Account pages live under the authenticated layout; Google uses the managed broker, administrator credentials use Cloud Auth, and privileges come only from protected user_roles with server checks to prevent role escalation.
- Purchase history retains shop name/location/contact snapshots at checkout; current shop contact takes precedence. Complaint submission checks buyer, completed payment and active hold, requires photo/message, and targets the purchased option variant so sibling items remain unchanged.
- Demo checkout records explicit payment status, reference and completion time; shared order helpers gate vendor orders, metrics and notifications on completed payments. These browser-managed references are not real payment verification or withdrawal credentials; a future gateway must verify payments server-side.
- Shared navigation owns desktop links and a mobile bottom bar; account links reflect verified roles and sign-out clears protected queries before clearing the session.
- BackButton uses router history with a home fallback; root PageBack covers non-home pages except rendered photo profiles, whose shared BackButton stays over the cover, avoiding duplicate or missing return controls.
- Deal stories use the shared Cloud catalog; LIVE is seller-declared with a validated HTTPS external link, not automatic provider status or in-app broadcast. LIVE stories show for 3 hours from liveSince; sellers renew with "Still live".
- Alerts use trigger-created public/recipient rows and account-owned read receipts; RLS protects private activity. Push needs a connected provider.
- ProductCard exposes an opt-in compact mobile variant for the Shop grid, so denser browsing does not change cards on other pages.
- Story image halves are accessible previous/next tap targets using the shared story navigation helper; keep shopping links and the dialog close control outside those targets to avoid accidental navigation.
- Group active stories by vendor before rendering cards and flatten those groups for tap navigation, so each seller has one card and their updates play together.
- All manual photo inputs share PhotoUpload and browser-only compression in photo.ts; verify encoded Blob size before accepting it so every upload obeys the size limit without server dependencies.
- Store profiles reuse DealStories with a vendor filter and no publishing control; this keeps seller-specific deals in the same viewer and expiry flow as home and shop.
- Public storefronts and the seller dashboard share StoreProfile and the same vendor record; profile edits preserve the store ID and platform-managed rating/join date so products and orders keep their associations.
- Payout hold/complaint/withdrawal rules live in src/lib/withdrawals.ts (itemFunds, vendorBalance) and are derived from order items at read time, so balances never drift from orders.
- Demo withdrawal requests retain validated recipient snapshots; shared recipient details render in vendor/admin histories without implying bank verification or real payout delivery.
- Admin oversight combines demo financial summaries with server-protected application reviews; approval assigns a vendor role bound to the submitted store, never a browser-selected store ID.
- Vendor moderation is Cloud-backed with server-verified administrator writes and owner/admin reason reads; public status-only reads pause demo shopping without exposing private reasons, while orders and funds remain intact.
- Suspension end times are calculated server-side from whole-day durations; effective status reads and shared trading checks release expired suspensions without requiring a scheduled task.
- Restricted vendor accounts see only the shared access notice and sign-out; demo mutation guards and Cloud write policies deny activity while preserving identity/status reads and historical records.
- Restricted vendors may submit owner-scoped appeals; administrator appeal decisions and account restoration are transactional. Customer feedback is Cloud-backed with server-sourced public name/photo snapshots and validated compressed photos.
- Raw feedback reads are owner/admin-scoped; public feedback uses a target-scoped, bounded RPC excluding private user IDs so storefront comments stay public without exposing account identities.
- Application approval and seller-role assignment run in one database transaction; RLS-scoped change subscriptions refresh pending status and account access without another login.
- Application review validates rejection reasons on the server and in the transactional review function; reasons are retained alongside the immutable submitted agreement for applicant correction and a fresh application.
- Vendor applications retain agreement/document snapshots in Cloud; owner and administrator read policies expose the same record without owner update/delete permissions, preserving submitted terms.
- Prepare vendor applications before confirmation, sharing AgreementContent for preview and retained viewing and snapshotting company signatory assets with the agreement so future company changes do not alter submitted records.
- Retained document actions live in VendorAgreementRecord; certificate previews use temporary browser Blob URLs so uploaded files open without cross-origin embedding restrictions.
- HorizontalBrowse provides shared overflow-aware arrow controls for category, store and story rows; keep story viewer tap navigation separate so browsing arrows do not alter playback.
- Story playback uses useStoryPlayback for per-story timers and progress; changing or closing a story cancels its timer to prevent stale advances.
- Categories share admin-owned names/covers; server/RLS restrict edits. Admin post deletion uses protected tombstones that sellers cannot reverse, preserving purchases.
- ProductGallery selects photos/video; ProductVideo uses official embeds, not downloads.
