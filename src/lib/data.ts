// Firestore collections and the shapes stored in them.
import { Timestamp, type DocumentData, type QueryDocumentSnapshot, type DocumentSnapshot } from "firebase/firestore";

export type Material = {
  id: string;
  name: string;
  unit: string;
  price: number; // cents
  description: string | null;
  active: boolean;
  sortOrder: number;
};

export type RequestItem = { materialName: string; unit: string; unitPrice: number; quantity: number };

export type JobRequest = {
  id: string;
  type: "estimate" | "booking";
  status: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  preferredDate: string | null;
  details: string | null;
  ownerNotes?: string | null;
  items: RequestItem[];
  createdAt: Date;
};

export type InvoiceItem = { description: string; quantity: number; unitPrice: number };

export type Invoice = {
  id: string; // also the secret token in the customer link
  number: string;
  requestId: string | null;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  address: string | null;
  notes: string | null;
  dueDate: string | null;
  payUrl: string | null;
  status: "draft" | "sent" | "paid" | "void";
  items: InvoiceItem[];
  sentAt: Date | null;
  paidAt: Date | null;
  paidMethod: string | null;
  createdAt: Date;
};

export type Photo = { id: string; thumb: string; caption: string | null; createdAt: Date };

export type Review = {
  id: string;
  source: "site" | "facebook" | "manual";
  author: string;
  rating: number | null;
  recommends?: boolean | null;
  text: string;
  approved: boolean;
  createdAt: Date;
};

export type CalEvent = {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  description: string | null;
};

export type Subscriber = { id: string; email: string; name: string | null; active: boolean; createdAt: Date };

export type Newsletter = { id: string; subject: string; body: string; recipientCount: number; sentAt: Date };

/** Snapshot -> plain object with Timestamps turned into Dates. */
export function fromDoc<T>(snap: QueryDocumentSnapshot<DocumentData> | DocumentSnapshot<DocumentData>): T {
  const data = snap.data() || {};
  const out: Record<string, unknown> = { id: snap.id };
  for (const [k, v] of Object.entries(data)) out[k] = v instanceof Timestamp ? v.toDate() : v;
  // serverTimestamp() is null in the local cache until the write lands.
  if ("createdAt" in out && out.createdAt == null) out.createdAt = new Date();
  return out as T;
}

export function randomToken(bytes = 18) {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const defaultMaterials: Omit<Material, "id">[] = [
  { name: "Gravel (#3, #57, Crusher Run)", unit: "5 tons", price: 27500 },
  { name: "Pea Gravel", unit: "5 tons", price: 28500 },
  { name: "Mulch", unit: "5 yards", price: 30000 },
  { name: "Enriched Soil", unit: "5 tons", price: 47500 },
  { name: "Fill Dirt", unit: "5 tons", price: 20000 },
  { name: "Unscreened Topsoil", unit: "5 tons", price: 32500 },
  { name: "Screened Topsoil", unit: "5 tons", price: 42500 },
  { name: "Mason Sand (for pools)", unit: "2 tons", price: 27500 },
  { name: 'River Rock (1"–6")', unit: "5 tons", price: 52500 },
  { name: 'River Rock (3/8"–1 3/8")', unit: "5 tons", price: 42500 },
].map((m, i) => ({ ...m, description: null, active: true, sortOrder: i }));

export const starterPhotos = [
  { src: "/seed/IMG_4502.webp", caption: "Load of gravel ready to roll" },
  { src: "/seed/IMG_8396.webp", caption: "The rig" },
];
