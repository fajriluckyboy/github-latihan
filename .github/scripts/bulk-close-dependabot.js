import { Octokit } from "@octokit/rest";

// Inisialisasi Octokit dengan token dari environment variable
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split("/")[1];

// DRY_RUN: jika true, script hanya simulasi tanpa benar-benar ubah data
// Ubah ke "false" jika sudah yakin ingin eksekusi sungguhan
const isDryRun = process.env.DRY_RUN !== "false";

console.log(`\n🤖 Bulk Close Dependabot Issues`);
console.log(`Repo: ${owner}/${repo}`);
console.log(`Mode: ${isDryRun ? "DRY RUN (simulasi)" : "EKSEKUSI SUNGGUHAN"}`);
console.log(`================================\n`);

// Ambil semua issue terbuka dari Dependabot via paginate
const issues = await octokit.paginate(octokit.rest.issues.listForRepo, {
  owner,
  repo,
  state: "open",
  per_page: 100,
});

// Hitung tanggal hari ini untuk kalkulasi usia
const sekarang = new Date();

// Filter: hanya ambil issue dari dependabot yang lebih dari 30 hari
const targetIssues = issues.filter(issue => {
  const usiaHari = Math.floor(
    (sekarang - new Date(issue.created_at)) / (1000 * 60 * 60 * 24)
  );
  // Cek apakah pembuat adalah dependabot dan usia lebih dari 30 hari
  return issue.user.login === "dependabot[bot]" && usiaHari > 30;
});

console.log(`Ditemukan ${targetIssues.length} issue Dependabot lebih dari 30 hari\n`);

if (targetIssues.length === 0) {
  console.log("Tidak ada issue yang perlu ditutup.");
  process.exit(0);
}

// Proses setiap issue yang memenuhi kriteria
for (const issue of targetIssues) {
  const usiaHari = Math.floor(
    (sekarang - new Date(issue.created_at)) / (1000 * 60 * 60 * 24)
  );

  console.log(`#${issue.number} — ${issue.title}`);
  console.log(`  Usia: ${usiaHari} hari`);

  if (isDryRun) {
    // Mode simulasi: hanya tampilkan apa yang AKAN dilakukan
    console.log(`  [DRY RUN] Akan ditutup dengan komentar\n`);
  } else {
    // Mode eksekusi: benar-benar tutup issue dengan komentar
    // Tambah komentar penjelasan sebelum menutup
    await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: issue.number,
      body: `Menutup issue Dependabot ini secara otomatis karena sudah lebih dari 30 hari tanpa aktivitas.\n\n> Ditutup via bulk-close-dependabot.js`,
    });

    // Tutup issue
    await octokit.rest.issues.update({
      owner,
      repo,
      issue_number: issue.number,
      state: "closed",
    });

    console.log(`  ✓ Berhasil ditutup\n`);

    // Jeda 1 detik antar request untuk hindari rate limit
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

console.log(`================================`);
console.log(`Selesai! ${targetIssues.length} issue diproses`);
console.log(isDryRun ? `Jalankan dengan DRY_RUN=false untuk eksekusi sungguhan` : `Semua issue berhasil ditutup`);
console.log(`================================\n`);
