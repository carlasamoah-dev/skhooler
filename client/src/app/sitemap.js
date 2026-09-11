export default function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://skhooler.com";
  const now = new Date().toISOString();

  // Static routes
  const staticRoutes = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/discover`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
  ];

  // TODO: When backend is connected, fetch all public community slugs and add:
  // const communities = await fetchPublicCommunities();
  // const communityRoutes = communities.map(c => ({
  //   url: `${baseUrl}/${c.slug}`,
  //   lastModified: c.updatedAt,
  //   changeFrequency: "daily",
  //   priority: 0.8,
  // }));

  return [...staticRoutes];
}
