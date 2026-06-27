import requests
import os
from datetime import datetime, timezone

# Ambil token dan info repo dari environment variables
# Sama seperti versi Node.js tapi sintaks Python
token = os.environ["GITHUB_TOKEN"]
owner = os.environ["GITHUB_REPOSITORY_OWNER"]
repo = os.environ["GITHUB_REPOSITORY"].split("/")[1]

# Header HTTP yang dikirim di setiap request
# Authorization: Bearer = cara autentikasi GitHub API modern
headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",  # format response GitHub API v3
    "X-GitHub-Api-Version": "2022-11-28",     # versi API yang kita minta
}

print(f"\n📋 Bulk Issue Report (Python requests - Lokal)")
print(f"Repo: {owner}/{repo}")
print(f"================================\n")

# Pagination manual — berbeda dengan Node.js yang pakai octokit.paginate()
# Di Python kita harus loop sendiri sampai halaman kosong
semua_issues = []  # tampung semua issue dari semua halaman
page = 1           # mulai dari halaman pertama

while True:
    # Kirim request ke endpoint issues dengan parameter pagination
    response = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/issues",
        headers=headers,
        params={
            "state": "open",    # hanya issue terbuka
            "per_page": 100,    # maksimal 100 per halaman
            "page": page,       # halaman yang diminta sekarang
        }
    )

    # Pastikan request berhasil — raise error jika status bukan 2xx
    response.raise_for_status()

    # Parse response JSON menjadi list Python
    data = response.json()

    # Jika halaman kosong berarti semua halaman sudah diambil
    if not data:
        break

    # Tambahkan issue halaman ini ke list utama
    semua_issues.extend(data)

    # Lanjut ke halaman berikutnya
    page += 1

print(f"Total issue terbuka: {len(semua_issues)}\n")

# Hitung waktu sekarang untuk kalkulasi usia issue
# timezone.utc penting agar konsisten dengan timestamp GitHub
sekarang = datetime.now(timezone.utc)

# Loop setiap issue dan tampilkan informasinya
for issue in semua_issues:
    # Parse tanggal created_at dari string ISO 8601 ke objek datetime
    dibuat = datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00"))

    # Hitung selisih waktu dalam hari
    usia_hari = (sekarang - dibuat).days

    # Ambil nama semua label atau tampilkan "tanpa label" jika kosong
    labels = issue["labels"]
    nama_labels = ", ".join(l["name"] for l in labels) if labels else "tanpa label"

    # Tampilkan ringkasan tiap issue
    print(f"#{issue['number']} — {issue['title']}")
    print(f"  Usia    : {usia_hari} hari")
    print(f"  Label   : {nama_labels}")
    print(f"  Pembuat : {issue['user']['login']}")
    print(f"  URL     : {issue['html_url']}")
    print()

# Ringkasan statistik
issues_dengan_label = sum(1 for i in semua_issues if i["labels"])
issues_tanpa_label = sum(1 for i in semua_issues if not i["labels"])

print(f"================================")
print(f"Statistik:")
print(f"  Punya label    : {issues_dengan_label} issue")
print(f"  Tanpa label    : {issues_tanpa_label} issue")
print(f"================================\n")
