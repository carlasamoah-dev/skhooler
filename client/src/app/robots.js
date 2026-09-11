export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skhooler.com";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/discover", "/u/"],
        disallow: [
          "/account",
          "/create",
          "/api/",
          "/*?*edit=*",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
