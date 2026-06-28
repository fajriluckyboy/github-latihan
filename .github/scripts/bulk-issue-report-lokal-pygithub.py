from github import Github, Auth
import os
from datetime import datetime, timezone

# Inisialisasi koneksi ke GitHub via PyGithub
# Cara baru PyGithub 2.x: pakai Auth.Token() bukan login_or_token
# Lebih eksplisit dan tidak akan deprecated
token = os.environ["GITHUB_TOKEN"]
auth = Auth.Token(token)        # buat objek autentikasi
g = Github(auth=auth)           # pass objek auth ke Github

# Ambil objek repo langsung via PyGithub
# Tidak perlu susun URL endpoint manual seperti di requests
owner = os.environ["GITHUB_REPOSITORY_OWNER"]
repo_name = os.environ["GITHUB_REPOSITORY"].split("/")[1]
repo = g.get_repo(f"{owner}/{repo_name}")

print(f"\n📋 Bulk Issue Report (PyGithub - Lokal)")
print(f"Repo: {repo.full_name}")
print(f"================================\n")

# get_issues() kembalikan PaginatedList — otomatis handle pagination
# Tidak perlu while True loop seperti di requests
issues = repo.get_issues(state="open")

# Hitung waktu sekarang untuk kalkulasi usia issue
sekarang = datetime.now(timezone.utc)

# Konversi PaginatedList ke list biasa dulu
# Ini memastikan semua halaman sudah diambil sebelum kita proses
issues_list = list(issues)

# Tampilkan total setelah semua data ter-load
# Lebih akurat dari issues.totalCount yang dihitung sebelum load
print(f"Total issue terbuka: {len(issues_list)}\n")

# Loop setiap issue dan tampilkan informasinya
for issue in issues_list:
    # created_at sudah berupa objek datetime — tidak perlu parse manual
    # Berbeda dengan requests yang dapat string ISO 8601
    dibuat = issue.created_at.replace(tzinfo=timezone.utc)
    usia_hari = (sekarang - dibuat).days

    # issue.labels adalah list objek Label
    # setiap label punya atribut .name — akses via dot notation
    labels = issue.labels
    nama_labels = ", ".join(l.name for l in labels) if labels else "tanpa label"

    # Semua field diakses via dot notation — lebih bersih dari ["key"]
    print(f"#{issue.number} — {issue.title}")
    print(f"  Usia    : {usia_hari} hari")
    print(f"  Label   : {nama_labels}")
    print(f"  Pembuat : {issue.user.login}")
    print(f"  URL     : {issue.html_url}")
    print()

# Ringkasan statistik menggunakan issues_list yang sudah lengkap
issues_dengan_label = sum(1 for i in issues_list if i.labels)
issues_tanpa_label = sum(1 for i in issues_list if not i.labels)

print(f"================================")
print(f"Statistik:")
print(f"  Punya label    : {issues_dengan_label} issue")
print(f"  Tanpa label    : {issues_tanpa_label} issue")
print(f"================================\n")

# Tutup koneksi PyGithub dengan benar setelah selesai
g.close()
