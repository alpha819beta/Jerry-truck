import { PageHeader } from "@/components/PageHeader";
import { Gallery } from "./Gallery";

export const metadata = { title: "Our Work" };

export default function GalleryPage() {
  return (
    <>
      <PageHeader title="Our Work" subtitle="A look at some of the jobs we've done for customers." />
      <div className="container-page py-12">
        <Gallery />
      </div>
    </>
  );
}
