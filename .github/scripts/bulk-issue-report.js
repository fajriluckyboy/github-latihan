import { Octokit } from "@octokit/action";

// Untuk Actions: pakai @octokit/action yang otomatis ambil GITHUB_TOKEN
// Berbeda dengan bulk-issue-report-lokal.js yang pakai @octokit/rest
const octokit = new Octokit();

// Di Actions, variabel ini otomatis tersedia dari environment runner
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split("/")[1];

console.log(`\n📋 Bulk Issue Report (Actions)`);
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

// Loop setiap issue dan tampilkan informasinya di log Actions
for (const issue of issues) {
  // Hitung usia issue dalam hari sejak dibuat
  const dibuat = new Date(issue.created_at);
  const selisihMs = sekarang - dibuat;
  const usiaHari = Math.floor(selisihMs / (1000 * 60 * 60 * 24));

  // Ambil nama semua label yang terpasang, atau "tanpa label" jika kosong
  const labels = issue.labels.length > 0
    ? issue.labels.map(l => l.name).join(", ")
    : "tanpa label";

  // Tampilkan ringkasan tiap issue di log Actions
  console.log(`#${issue.number} — ${issue.title}`);
  console.log(`  Usia    : ${usiaHari} hari`);
  console.log(`  Label   : ${labels}`);
  console.log(`  Pembuat : ${issue.user.login}`);
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
