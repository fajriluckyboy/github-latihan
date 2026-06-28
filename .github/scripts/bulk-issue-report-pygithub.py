from github import Github, Auth
import os
from datetime import datetime, timezone

# Di Actions, GITHUB_TOKEN otomatis tersedia dari environment runner
# Cara baru PyGithub 2.x: pakai Auth.Token() untuk autentikasi
token = os.environ["GITHUB_TOKEN"]
auth = Auth.Token(token)        # buat objek autentikasi eksplisit
g = Github(auth=auth)           # inisialisasi koneksi ke GitHub

# Ambil objek repo dari environment Actions
owner = os.environ["GITHUB_REPOSITORY_OWNER"]
repo_name = os.environ["GITHUB_REPOSITORY"].split("/")[1]
repo = g.get_repo(f"{owner}/{repo_name}")

print(f"\n📋 Bulk Issue Report (PyGithub - Actions)")
print(f"Repo: {repo.full_name}")
print(f"================================\n")

# PaginatedList otomatis handle pagination tanpa loop manual
issues = repo.get_issues(state="open")

# Konversi ke list biasa agar totalCount akurat
# dan bisa dipakai untuk statistik di akhir
issues_list = list(issues)

print(f"Total issue terbuka: {len(issues_list)}\n")

# Hitung waktu sekarang untuk kalkulasi usia issue
sekarang = datetime.now(timezone.utc)

# Loop dan tampilkan tiap issue di log Actions
for issue in issues_list:
    # created_at sudah objek datetime — tidak perlu parse string
    dibuat = issue.created_at.replace(tzinfo=timezone.utc)
    usia_hari = (sekarang - dibuat).days

    # Akses label via dot notation — lebih bersih dari dictionary
    labels = issue.labels
    nama_labels = ", ".join(l.name for l in labels) if labels else "tanpa label"

    print(f"#{issue.number} — {issue.title}")
    print(f"  Usia    : {usia_hari} hari")
    print(f"  Label   : {nama_labels}")
    print(f"  Pembuat : {issue.user.login}")
    print()

# Statistik ringkasan untuk log Actions
issues_dengan_label = sum(1 for i in issues_list if i.labels)
issues_tanpa_label = sum(1 for i in issues_list if not i.labels)

print(f"================================")
print(f"Statistik:")
print(f"  Punya label    : {issues_dengan_label} issue")
print(f"  Tanpa label    : {issues_tanpa_label} issue")
print(f"================================\n")

# Tutup koneksi dengan benar setelah selesai
g.close()
