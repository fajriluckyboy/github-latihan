import { Octokit } from "@octokit/rest";

// Untuk lokal: pakai @octokit/rest dan autentikasi manual via GITHUB_TOKEN
// Berbeda dengan @octokit/action yang khusus untuk environment Actions
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // token diambil dari env variable
});

// Ambil informasi repo dari environment variables yang kita set manual
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split("/")[1];

console.log(`\n📋 Bulk Issue Report (Lokal)`);
console.log(`Repo: ${owner}/${repo}`);
console.log(`================================\n`);

// Ambil SEMUA issue terbuka menggunakan paginate
// paginate otomatis handle semua halaman tanpa perlu urus pagination manual
const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
  owner,
  repo,
  state: "open",    // hanya issue yang masih terbuka
  per_page: 100,    // maksimal per halaman untuk kurangi jumlah request
});

console.log(`Total issue terbuka: ${issues.length}\n`);

// Hitung tanggal hari ini untuk kalkulasi usia issue
const sekarang = new Date();

// Loop setiap issue dan tampilkan informasinya
for (const issue of issues) {
  // Hitung usia issue dalam hari sejak dibuat
  const dibuat = new Date(issue.created_at);
  const selisihMs = sekarang - dibuat;
  const usiaHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));

  // Ambil nama semua label yang terpasang, atau "tanpa label" jika kosong
  const labels = issue.labels.length > 0
    ? issue.labels.map(l => l.name).join(", ")
    : "tanpa label";

  // Tampilkan ringkasan tiap issue
  console.log(`#${issue.number} — ${issue.title}`);
  console.log(`  Usia    : ${usiaHari} hari`);
  console.log(`  Label   : ${labels}`);
  console.log(`  Pembuat : ${issue.user.login}`);
  console.log(`  URL     : ${issue.html_url}`);
  console.log();
}

// Ringkasan statistik di akhir laporan
const issuesDenganLabel = issues.filter(i => i.labels.length > 0).length;
const issuesTanpaLabel = issues.filter(i => i.labels.length === 0).length;

console.log(`================================`);
console.log(`Statistik:`);
console.log(`  Punya label    : ${issuesDenganLabel} issue`);
console.log(`  Tanpa label    : ${issuesTanpaLabel} issue`);
console.log(`================================\n`);
