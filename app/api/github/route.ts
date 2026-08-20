import { NextResponse } from "next/server";

const USERNAME = "quelemine";

export async function GET() {
  try {
    const ghHeaders: HeadersInit = { "Accept": "application/vnd.github+json" };

    const [userRes, reposRes, chartRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`,
        { headers: ghHeaders, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`,
        { headers: ghHeaders, next: { revalidate: 3600 } }),
      fetch(`https://ghchart.rshah.org/${USERNAME}`,
        { next: { revalidate: 3600 } }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json({ error: "GitHub API error" }, { status: 502 });
    }

    const user  = await userRes.json();
    const repos: { stargazers_count: number; forks_count: number }[] = await reposRes.json();

    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
    const forks = repos.reduce((sum, r) => sum + (r.forks_count ?? 0), 0);

    // Fetch chart SVG — non-fatal if it fails
    let chartSvg: string | null = null;
    if (chartRes.ok) {
      const raw = await chartRes.text();
      // Accept both bare <svg> and XML-declared SVG (<?xml ...><svg ...>)
      const trimmed = raw.trimStart();
      if (trimmed.startsWith("<svg") || trimmed.startsWith("<?xml")) chartSvg = raw;
    }

    return NextResponse.json({
      repos:     user.public_repos as number,
      followers: user.followers    as number,
      stars,
      forks,
      chartSvg,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 500 });
  }
}
