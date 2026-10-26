// Public (no login) reads and writes. Firestore rules decide what's allowed.
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  fromDoc,
  randomToken,
  type CalEvent,
  type Invoice,
  type JobRequest,
  type Material,
  type Photo,
  type Review,
  type Subscriber,
} from "./data";
import { notifyOwner } from "./notify";
import { money, prettyDate } from "./format";
import { adminUrl } from "./site";

export async function listMaterials(activeOnly = true) {
  const snap = await getDocs(query(collection(db, "materials"), orderBy("sortOrder")));
  const all = snap.docs.map((d) => fromDoc<Material>(d));
  return activeOnly ? all.filter((m) => m.active) : all;
}

export async function listPhotos(max?: number) {
  const q = max
    ? query(collection(db, "photos"), orderBy("createdAt", "desc"), limit(max))
    : query(collection(db, "photos"), orderBy("createdAt", "desc"));
  return (await getDocs(q)).docs.map((d) => fromDoc<Photo>(d));
}

export async function getPhotoFull(id: string) {
  const snap = await getDoc(doc(db, "photoFull", id));
  return snap.exists() ? (snap.data().data as string) : null;
}

export async function listApprovedReviews() {
  const snap = await getDocs(query(collection(db, "reviews"), where("approved", "==", true)));
  return snap.docs.map((d) => fromDoc<Review>(d)).sort((a, b) => +b.createdAt - +a.createdAt);
}

export async function listEventsFrom(fromYmd: string, max = 50) {
  const q = query(collection(db, "events"), where("date", ">=", fromYmd), orderBy("date"), limit(max));
  return (await getDocs(q)).docs.map((d) => fromDoc<CalEvent>(d)).sort(byDateTime);
}

export async function listEventsInMonth(prefix: string) {
  const q = query(
    collection(db, "events"),
    where("date", ">=", `${prefix}-01`),
    where("date", "<=", `${prefix}-31`),
  );
  return (await getDocs(q)).docs.map((d) => fromDoc<CalEvent>(d)).sort(byDateTime);
}

function byDateTime(a: CalEvent, b: CalEvent) {
  return (a.date + (a.startTime || "")).localeCompare(b.date + (b.startTime || ""));
}

export async function getInvoice(token: string) {
  const snap = await getDoc(doc(db, "invoices", token));
  return snap.exists() ? fromDoc<Invoice>(snap) : null;
}

type NewRequest = Omit<JobRequest, "id" | "status" | "createdAt" | "ownerNotes">;

export async function submitRequest(r: NewRequest) {
  const ref = await addDoc(collection(db, "requests"), { ...r, status: "new", createdAt: serverTimestamp() });

  const lines =
    r.type === "booking"
      ? [
          `${r.name} · ${r.phone}`,
          r.email && `Email: ${r.email}`,
          `Address: ${r.address}`,
          ...r.items.map((i) => `• ${i.quantity} × ${i.materialName} (${i.unit})`),
          `Listed total: ${money(r.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0))}`,
          r.preferredDate && `Preferred date: ${prettyDate(r.preferredDate, { dateStyle: "medium" })}`,
          r.details && `Notes: ${r.details}`,
        ]
      : [
          `${r.name} · ${r.phone}`,
          r.email && `Email: ${r.email}`,
          r.address && `Location: ${r.address}`,
          r.details && `Notes: ${r.details}`,
        ];
  lines.push(`Review: ${adminUrl(`/admin/request/?id=${ref.id}`)}`);

  // The request is saved either way; the alert is best-effort.
  await notifyOwner(
    r.type === "booking" ? `New booking from ${r.name}` : `New estimate request from ${r.name}`,
    lines.filter(Boolean).join("\n"),
  );
  return ref.id;
}

export async function subscribe(email: string, name: string | null) {
  await setDoc(doc(db, "subscribers", randomToken(16)), {
    email: email.toLowerCase(),
    name: name || null,
    active: true,
    createdAt: serverTimestamp(),
  });
}

export async function getSubscriber(token: string) {
  const snap = await getDoc(doc(db, "subscribers", token));
  return snap.exists() ? fromDoc<Subscriber>(snap) : null;
}

export async function unsubscribe(token: string) {
  await updateDoc(doc(db, "subscribers", token), { active: false });
}

export async function submitReview(author: string, text: string, rating: number) {
  await addDoc(collection(db, "reviews"), {
    source: "site",
    author,
    text,
    rating,
    approved: false,
    createdAt: serverTimestamp(),
  });
}
