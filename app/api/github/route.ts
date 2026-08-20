import { NextResponse } from "next/server";

const USERNAME = "quelemine";

export async function GET() {
  try {
    const headers: HeadersInit = { "Accept": "application/vnd.github+json" };

    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, { headers, next: { revalidate: 3600 } }),
    ]);

    if (!userRes.ok || !reposRes.ok) {
      return NextResponse.json({ error: "GitHub API error" }, { status: 502 });
    }

    const user = await userRes.json();
    const repos: { stargazers_count: number; forks_count: number }[] = await reposRes.json();

    const stars = repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
    const forks = repos.reduce((sum, r) => sum + (r.forks_count ?? 0), 0);

    return NextResponse.json({
      repos: user.public_repos as number,
      followers: user.followers as number,
      stars,
      forks,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch GitHub data" }, { status: 500 });
  }
}
