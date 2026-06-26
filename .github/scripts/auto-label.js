import { Octokit } from "@octokit/action";

// Membuat instance Octokit untuk interaksi dengan API GitHub
const octokit = new Octokit();

// Mengambil informasi repositori dan nomor issue dari environment variables
const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY.split("/")[1];
const issueNumber = parseInt(process.env.ISSUE_NUMBER);
const issueTitle = process.env.ISSUE_TITLE.toLowerCase(); // Diubah ke huruf kecil agar pencarian kata kunci akurat

console.log(`Memproses issue #${issueNumber}: "${issueTitle}"`);

// Array untuk menampung label yang akan ditambahkan
const labelsToAdd = [];

// Periksa jika judul mengandung kata kunci terkait bug/error
if (issueTitle.includes("bug") || issueTitle.includes("error") || issueTitle.includes("fix")) {
  labelsToAdd.push("bug");
}

// Periksa jika judul mengandung kata kunci terkait fitur baru
if (issueTitle.includes("feat") || issueTitle.includes("fitur") || issueTitle.includes("tambah")) {
  labelsToAdd.push("enhancement");
}

// Periksa jika judul mengandung kata kunci terkait dokumentasi
if (issueTitle.includes("docs") || issueTitle.includes("dokumentasi") || issueTitle.includes("readme")) {
  labelsToAdd.push("documentation");
}

// Periksa jika judul mengandung kata kunci terkait pertanyaan
if (issueTitle.includes("pertanyaan") || issueTitle.includes("tanya") || issueTitle.includes("question")) {
  labelsToAdd.push("question");
}

// Proses penempelan label ke GitHub Issue
if (labelsToAdd.length === 0) {
  console.log("Tidak ada label yang cocok untuk issue ini.");
} else {
  console.log(`Label yang akan dipasang: ${labelsToAdd.join(", ")}`);

  // Mengirim permintaan ke API GitHub untuk menambahkan label
  await octokit.rest.issues.addLabels({
    owner,
    repo,
    issue_number: issueNumber,
    labels: labelsToAdd
  });

  console.log(`Label berhasil dipasang ke issue #${issueNumber}`);
}
