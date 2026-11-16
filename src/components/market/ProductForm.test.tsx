import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { ProductForm } from "./ProductForm";

vi.mock("@/lib/store", () => ({ useStore: () => ({ categories: ["Electronics", "Fashion"] }) }));
vi.mock("@/lib/photo", () => ({ compressPhoto: async (file: File) => `data:image/webp;base64,${file.name === "second.png" ? "BBBB" : "AAAA"}` }));
afterEach(cleanup);

it("saves multiple manually selected photos in chosen order with the final YouTube link", async () => {
  const save = vi.fn(async (_product: unknown) => {});
  render(<ProductForm open onOpenChange={() => {}} vendorId="seller" onSave={save} />);
  fireEvent.change(screen.getByLabelText("Product title"), { target: { value: "Camera" } });
  fireEvent.change(screen.getByLabelText("Category *"), { target: { value: "Electronics" } });
  fireEvent.change(screen.getByLabelText("Price (RWF)"), { target: { value: "25000" } });
  fireEvent.change(screen.getByLabelText("Stock"), { target: { value: "2" } });
  fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Camera with video" } });
  fireEvent.change(screen.getByLabelText("Add product photos"), { target: { files: [new File(["a"], "first.png", { type: "image/png" }), new File(["b"], "second.png", { type: "image/png" })] } });
  await screen.findByRole("button", { name: "Make photo 2 the cover" });
  fireEvent.click(screen.getByRole("button", { name: "Make photo 2 the cover" }));
  fireEvent.change(screen.getByLabelText("Video link (optional)"), { target: { value: "https://youtu.be/M7lc1UVf-VE" } });
  fireEvent.submit(screen.getByRole("button", { name: "Publish product" }).closest("form") as HTMLFormElement);
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0]?.[0]).toMatchObject({ images: ["data:image/webp;base64,BBBB", "data:image/webp;base64,AAAA"], videoUrl: "https://youtu.be/M7lc1UVf-VE", category: "Electronics", price: 25000 });
});

it("retains all existing photos when editing and allows the video to be removed", async () => {
  const save = vi.fn(async (_product: unknown) => {});
  render(<ProductForm open onOpenChange={() => {}} vendorId="seller" onSave={save} initial={{ id: "test", vendorId: "seller", title: "Camera", category: "Electronics", price: 25000, stock: 2, description: "Camera", images: ["https://example.com/one.jpg", "https://example.com/two.jpg"], videoUrl: "https://youtu.be/M7lc1UVf-VE", rating: 0, reviews: [] }} />);
  fireEvent.change(screen.getByLabelText("Video link (optional)"), { target: { value: "" } });
  fireEvent.submit(screen.getByRole("button", { name: "Save changes" }).closest("form") as HTMLFormElement);
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0]?.[0]).toMatchObject({ images: ["https://example.com/one.jpg", "https://example.com/two.jpg"] });
  expect(save.mock.calls[0]?.[0]).not.toHaveProperty("videoUrl");
});

it.each(["https://www.instagram.com/reel/CxYz9hTsW-E/", "https://www.tiktok.com/@scout2015/video/6718335390845095173"])("saves a detected social video from the single link field: %s", async (videoUrl) => {
  const save = vi.fn(async (_product: unknown) => {});
  render(<ProductForm open onOpenChange={() => {}} vendorId="seller" onSave={save} initial={{ id: "test", vendorId: "seller", title: "Camera", category: "Electronics", price: 25000, stock: 2, description: "Camera", images: ["https://example.com/one.jpg", "https://example.com/two.jpg"], rating: 0, reviews: [] }} />);
  fireEvent.change(screen.getByLabelText("Video link (optional)"), { target: { value: videoUrl } });
  fireEvent.submit(screen.getByRole("button", { name: "Save changes" }).closest("form") as HTMLFormElement);
  await waitFor(() => expect(save).toHaveBeenCalledTimes(1));
  expect(save.mock.calls[0]?.[0]).toHaveProperty("videoUrl", videoUrl);
});