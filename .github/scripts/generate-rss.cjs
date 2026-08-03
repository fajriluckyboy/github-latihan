// Script untuk generate file RSS feed dari data release
// dan issue terbaru di repo github-latihan
// Menggabungkan dua sumber data GitHub API menjadi satu feed XML
const { Octokit } = require("@octokit/rest");

// Ambil token dari environment variable, bukan hardcode
// supaya aman dipakai baik lokal maupun di GitHub Actions
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const OWNER = "fajriluckyboy";
const REPO = "github-latihan";

// Fungsi untuk escape karakter khusus XML
// WAJIB dipakai di setiap teks yang dimasukkan ke tag XML
// supaya tidak merusak struktur feed kalau ada karakter
// seperti <, >, & di judul issue/release
function escapeXML(teks) {
  if (!teks) return "";
  return teks
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Fungsi untuk konversi tanggal ISO 8601 (format GitHub API)
// ke format RFC 822 (format WAJIB untuk tag pubDate di RSS)
function keFormatRFC822(tanggalISO) {
  return new Date(tanggalISO).toUTCString();
}

async function generateRSS() {
  console.log("Mengambil data release dari GitHub API...");
  // Ambil semua release yang ada di repo
  const { data: releases } = await octokit.rest.repos.listReleases({
    owner: OWNER,
    repo: REPO,
    per_page: 10, // batasi 10 release terbaru saja
  });

  console.log("Mengambil data issue terbaru dari GitHub API...");
  // Ambil 5 issue terbaru (state: all supaya termasuk yang closed)
  const { data: issues } = await octokit.rest.issues.listForRepo({
    owner: OWNER,
    repo: REPO,
    state: "all",
    sort: "created",
    direction: "desc",
    per_page: 15,
  });
  // Filter buang pull request, karena API issues juga
  // mengembalikan PR (PR dianggap "issue" oleh GitHub API)
  const issueSaja = issues.filter((item) => !item.pull_request);

  console.log(`Ditemukan ${releases.length} release dan ${issueSaja.length} issue.`);

  // ================================================
  // SUSUN ITEM RSS DARI RELEASE
  // ================================================
  const itemRelease = releases
    .map((rilis) => {
      return `    <item>
      <title>${escapeXML("Release: " + rilis.name)}</title>
      <link>${rilis.html_url}</link>
      <description>${escapeXML(rilis.body || "Tidak ada deskripsi.")}</description>
      <pubDate>${keFormatRFC822(rilis.published_at)}</pubDate>
      <guid>${rilis.html_url}</guid>
    </item>`;
    })
    .join("\n");

  // ================================================
  // SUSUN ITEM RSS DARI ISSUE
  // ================================================
  const itemIssue = issueSaja
    .map((isu) => {
      return `    <item>
      <title>${escapeXML("Issue: " + isu.title)}</title>
      <link>${isu.html_url}</link>
      <description>${escapeXML(`Status: ${isu.state} | Dibuat oleh: ${isu.user.login}`)}</description>
      <pubDate>${keFormatRFC822(isu.created_at)}</pubDate>
      <guid>${isu.html_url}</guid>
    </item>`;
    })
    .join("\n");

  // ================================================
  // SUSUN STRUKTUR XML RSS LENGKAP
  // ================================================
  const rssXML = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Update github-latihan</title>
    <link>https://github.com/${OWNER}/${REPO}</link>
    <description>Feed otomatis berisi release dan issue terbaru dari repo github-latihan</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemRelease}
${itemIssue}
  </channel>
</rss>`;

  // Tulis hasil ke file feed.xml di folder docs/
  // supaya nanti bisa dihosting via GitHub Pages
  const fs = require("fs");
  fs.writeFileSync("docs/feed.xml", rssXML);
  console.log("File docs/feed.xml berhasil dibuat!");
}

generateRSS().catch((error) => {
  console.error("Terjadi kesalahan:", error.message);
  process.exit(1);
});
