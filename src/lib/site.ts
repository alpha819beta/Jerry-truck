// Business details shown across the site. Edit these to update contact info.
export const site = {
  name: "Appalachian Assists",
  tagline: "Hauling · Landscaping · Transport",
  established: 2025,
  phone: "681-220-0257",
  phoneHref: "tel:+16812200257",
  smsHref: "sms:+16812200257",
  email: "", // add a public email address here to show it on the site
  facebookUrl: "https://facebook.com/AppalachianAssists",
  serviceArea: "West Virginia and surrounding areas",
  hours: "Call or text anytime. We answer as quickly as we can.",
  services: [
    {
      title: "Material Delivery",
      text: "Gravel, rock, mulch, soil and sand delivered and dumped or tailgated right where you need it.",
    },
    {
      title: "Hauling",
      text: "Dump trailer hauling for clean-outs, debris, and the jobs that are too big for the pickup.",
    },
    {
      title: "Landscaping",
      text: "Driveways, beds, fill and grading help to get your yard looking right.",
    },
    {
      title: "Transport",
      text: "Vehicles, tractors, campers, boats, furniture. If it can be hauled, we can move it.",
    },
  ],
};

function base(envValue: string | undefined) {
  if (envValue) return envValue.replace(/\/$/, "");
  return typeof window !== "undefined" ? window.location.origin : "";
}

/** Public website address, e.g. for invoice and unsubscribe links. */
export function siteUrl(path = "") {
  return base(process.env.NEXT_PUBLIC_SITE_URL) + path;
}

/** Owner portal address (link in new-request alerts). */
export function adminUrl(path = "") {
  return base(process.env.NEXT_PUBLIC_ADMIN_URL) + path;
}
