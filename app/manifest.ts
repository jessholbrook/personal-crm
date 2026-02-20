import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Personal CRM",
    short_name: "CRM",
    description: "Manage relationships, interactions, and follow-ups",
    start_url: "/",
    display: "standalone",
    background_color: "#FAF8F5",
    theme_color: "#C45D3E",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
