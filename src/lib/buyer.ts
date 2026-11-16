import demoPhoto from "@/assets/demo-client.jpg";
import type { Order } from "./data";
import { hasCompletedPayment } from "./orders";

export interface BuyerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  photo: string;
  cover: string;
}

export const DEMO_BUYER: BuyerProfile = {
  id: "demo-client",
  name: "Claudine Irakoze",
  email: "claudine@example.com",
  phone: "",
  city: "Kigali",
  address: "KG 7 Ave",
  photo: demoPhoto,
  cover: demoPhoto,
};

// Only these seeded purchases belong to the client preview; other buyers stay separate.
export function linkDemoBuyer(order: Order): Order {
  return !order.buyerId && ["MM-1004", "MM-1005"].includes(order.id)
    ? { ...order, buyerId: DEMO_BUYER.id, customer: DEMO_BUYER.name }
    : order;
}

export function buyerOrders(orders: Order[], buyerId: string): Order[] {
  return orders.filter((order) => order.buyerId === buyerId && hasCompletedPayment(order));
}