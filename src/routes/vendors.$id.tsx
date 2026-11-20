import { CustomerFeedback } from "@/components/market/CustomerFeedback";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ProductCard } from "@/components/market/ProductCard";
import { StoreProfile } from "@/components/market/StoreProfile";
import { useStore } from "@/lib/store";
import { DealStories } from "@/components/market/DealStories";
import { SHARE_PREVIEW_IMAGE } from "@/lib/share";
import { getSharePreview } from "@/lib/share-preview.functions";

export const Route = createFileRoute("/vendors/$id")({
  loader: ({ params }) => getSharePreview({ data: { kind: "store", id: params.id } }).catch(() => null),
  head: ({ loaderData }) => {
    const title = loaderData?.title ?? "Store — Murandasi Market";
    const description = loaderData?.description ?? "Browse this independent store on Murandasi Market.";
    const image = loaderData?.image ?? SHARE_PREVIEW_IMAGE;
    return { meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" }, { property: "og:image", content: image }, { name: "twitter:image", content: image }] };
  },
  component: VendorPage,
});

function VendorPage() {
  const { id } = Route.useParams();
  const { vendor, products } = useStore();
  const v = vendor(id);
  if (!v) return <p className="py-24 text-center">Store not found. <Link to="/" className="text-primary">Go home</Link></p>;
  const list = products.filter((p) => p.vendorId === id);
  return (
    <div>
      <StoreProfile vendor={v} />
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-4"><DealStories vendorId={id} /></div>
        <h2 className="mt-6 text-xl font-bold">Products ({list.length})</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-5">{list.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        <CustomerFeedback targetType="shop" targetId={id} />
      </div>
    </div>
  );
}
