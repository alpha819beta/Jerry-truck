// Owner-only reads and writes. Firestore rules reject these unless the
// signed-in user is listed in /admins.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  defaultMaterials,
  fromDoc,
  randomToken,
  starterPhotos,
  type CalEvent,
  type Invoice,
  type InvoiceItem,
  type JobRequest,
  type Material,
  type Newsletter,
  type Review,
  type Subscriber,
} from "./data";
import { preparePhoto } from "./image";

export async function isOwner(uid: string) {
  return (await getDoc(doc(db, "admins", uid))).exists();
}

export async function navCounts() {
  const [reqs, revs] = await Promise.all([
    getDocs(query(collection(db, "requests"), where("status", "==", "new"))),
    getDocs(query(collection(db, "reviews"), where("approved", "==", false))),
  ]);
  return { newRequests: reqs.size, pendingReviews: revs.size };
}

// ─── Requests ──────────────────────────────────────────────────────────
export async function listRequests() {
  const snap = await getDocs(query(collection(db, "requests"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => fromDoc<JobRequest>(d));
}

export async function getRequest(id: string) {
  const snap = await getDoc(doc(db, "requests", id));
  return snap.exists() ? fromDoc<JobRequest>(snap) : null;
}

export function updateRequest(id: string, data: { status?: string; ownerNotes?: string | null }) {
  return updateDoc(doc(db, "requests", id), data);
}

export function deleteRequest(id: string) {
  return deleteDoc(doc(db, "requests", id));
}

// ─── Invoices ──────────────────────────────────────────────────────────
export async function listInvoices(requestId?: string) {
  const q = requestId
    ? query(collection(db, "invoices"), where("requestId", "==", requestId))
    : query(collection(db, "invoices"), orderBy("createdAt", "desc"));
  const list = (await getDocs(q)).docs.map((d) => fromDoc<Invoice>(d));
  return list.sort((a, b) => +b.createdAt - +a.createdAt);
}

export type InvoiceInput = {
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  address: string | null;
  notes: string | null;
  dueDate: string | null;
  payUrl: string | null;
  items: InvoiceItem[];
};

/** Creates a draft (with the next AA-#### number) or updates an existing draft. Returns its id. */
export async function saveInvoice(input: InvoiceInput, opts: { id?: string; requestId?: string | null }) {
  if (opts.id) {
    await updateDoc(doc(db, "invoices", opts.id), input);
    return opts.id;
  }
  const id = randomToken(18);
  await runTransaction(db, async (tx) => {
    const counterRef = doc(db, "counters", "invoices");
    const counter = await tx.get(counterRef);
    const next = counter.exists() ? (counter.data().next as number) : 1001;
    tx.set(counterRef, { next: next + 1 });
    tx.set(doc(db, "invoices", id), {
      ...input,
      number: `AA-${next}`,
      requestId: opts.requestId || null,
      status: "draft",
      sentAt: null,
      paidAt: null,
      paidMethod: null,
      createdAt: serverTimestamp(),
    });
  });
  return id;
}

export async function markInvoiceSent(inv: Invoice) {
  await updateDoc(doc(db, "invoices", inv.id), { status: "sent", sentAt: serverTimestamp() });
  if (inv.requestId) await updateRequest(inv.requestId, { status: "invoiced" }).catch(() => {});
}

export async function markInvoicePaid(inv: Invoice, method: string) {
  await updateDoc(doc(db, "invoices", inv.id), { status: "paid", paidAt: serverTimestamp(), paidMethod: method });
  if (inv.requestId) await updateRequest(inv.requestId, { status: "scheduled" }).catch(() => {});
}

export function voidInvoice(id: string) {
  return updateDoc(doc(db, "invoices", id), { status: "void" });
}

export function deleteInvoice(id: string) {
  return deleteDoc(doc(db, "invoices", id));
}

// ─── Photos ────────────────────────────────────────────────────────────
export async function addPhoto(src: Blob | string, caption: string | null) {
  const { full, thumb } = await preparePhoto(src);
  const id = doc(collection(db, "photos")).id;
  const batch = writeBatch(db);
  batch.set(doc(db, "photos", id), { thumb, caption, createdAt: serverTimestamp() });
  batch.set(doc(db, "photoFull", id), { data: full });
  await batch.commit();
}

export function updatePhotoCaption(id: string, caption: string | null) {
  return updateDoc(doc(db, "photos", id), { caption });
}

export async function deletePhoto(id: string) {
  const batch = writeBatch(db);
  batch.delete(doc(db, "photos", id));
  batch.delete(doc(db, "photoFull", id));
  await batch.commit();
}

// ─── Reviews ───────────────────────────────────────────────────────────
export async function listAllReviews() {
  const snap = await getDocs(collection(db, "reviews"));
  return snap.docs
    .map((d) => fromDoc<Review>(d))
    .sort((a, b) => Number(a.approved) - Number(b.approved) || +b.createdAt - +a.createdAt);
}

export function setReviewApproved(id: string, approved: boolean) {
  return updateDoc(doc(db, "reviews", id), { approved });
}

export function deleteReview(id: string) {
  return deleteDoc(doc(db, "reviews", id));
}

export function addManualReview(r: { author: string; text: string; rating: number | null; source: "facebook" | "manual"; date: string | null }) {
  return addDoc(collection(db, "reviews"), {
    source: r.source,
    author: r.author,
    text: r.text,
    rating: r.rating,
    recommends: r.rating ? null : true,
    approved: true,
    createdAt: r.date ? new Date(r.date + "T12:00:00") : serverTimestamp(),
  });
}

// ─── Events ────────────────────────────────────────────────────────────
export async function getEvent(id: string) {
  const snap = await getDoc(doc(db, "events", id));
  return snap.exists() ? fromDoc<CalEvent>(snap) : null;
}

export async function saveEvent(data: Omit<CalEvent, "id">, id?: string) {
  if (id) await setDoc(doc(db, "events", id), data);
  else await addDoc(collection(db, "events"), data);
}

export function deleteEvent(id: string) {
  return deleteDoc(doc(db, "events", id));
}

// ─── Newsletter ────────────────────────────────────────────────────────
/** Active subscribers, one per email address (signing up twice is possible). */
export async function listSubscribers() {
  const snap = await getDocs(query(collection(db, "subscribers"), where("active", "==", true)));
  const byEmail = new Map<string, Subscriber>();
  for (const s of snap.docs.map((d) => fromDoc<Subscriber>(d)).sort((a, b) => +b.createdAt - +a.createdAt)) {
    if (!byEmail.has(s.email)) byEmail.set(s.email, s);
  }
  return [...byEmail.values()];
}

/** Turns off every signup for this email. */
export async function removeSubscriber(email: string) {
  const snap = await getDocs(query(collection(db, "subscribers"), where("email", "==", email)));
  await Promise.all(snap.docs.map((d) => updateDoc(d.ref, { active: false })));
}

export async function listNewsletters() {
  const snap = await getDocs(query(collection(db, "newsletters"), orderBy("sentAt", "desc")));
  return snap.docs.map((d) => fromDoc<Newsletter>(d));
}

export function recordNewsletter(subject: string, body: string, recipientCount: number) {
  return addDoc(collection(db, "newsletters"), { subject, body, recipientCount, sentAt: serverTimestamp() });
}

// ─── Materials ─────────────────────────────────────────────────────────
export async function saveMaterial(data: Omit<Material, "id">, id?: string) {
  if (id) await setDoc(doc(db, "materials", id), data);
  else await addDoc(collection(db, "materials"), data);
}

export function deleteMaterial(id: string) {
  return deleteDoc(doc(db, "materials", id));
}

/** First-run helper: the price list from the sign + the starter job photos. */
export async function loadStarterContent() {
  const batch = writeBatch(db);
  for (const m of defaultMaterials) batch.set(doc(collection(db, "materials")), m);
  await batch.commit();
  for (const p of starterPhotos) await addPhoto(p.src, p.caption);
}
