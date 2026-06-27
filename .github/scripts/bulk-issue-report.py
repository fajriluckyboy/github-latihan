import requests
import os
from datetime import datetime, timezone

# Di Actions, GITHUB_TOKEN otomatis tersedia dari environment runner
# Tidak perlu set manual seperti saat jalankan lokal
token = os.environ["GITHUB_TOKEN"]
owner = os.environ["GITHUB_REPOSITORY_OWNER"]
repo = os.environ["GITHUB_REPOSITORY"].split("/")[1]

# Header HTTP untuk autentikasi dan versi API
headers = {
    "Authorization": f"Bearer {token}",
    "Accept": "application/vnd.github+json",  # format response GitHub API v3
    "X-GitHub-Api-Version": "2022-11-28",     # versi API yang kita minta
}

print(f"\n📋 Bulk Issue Report (Python requests - Actions)")
print(f"Repo: {owner}/{repo}")
print(f"================================\n")

# Pagination manual — loop sampai tidak ada data lagi
semua_issues = []
page = 1

while True:
    # Request ke endpoint issues GitHub
    response = requests.get(
        f"https://api.github.com/repos/{owner}/{repo}/issues",
        headers=headers,
        params={
            "state": "open",
            "per_page": 100,
            "page": page,
        }
    )

    # Hentikan jika request gagal
    response.raise_for_status()

    data = response.json()

    # Halaman kosong = semua data sudah diambil
    if not data:
        break

    semua_issues.extend(data)
    page += 1

print(f"Total issue terbuka: {len(semua_issues)}\n")

sekarang = datetime.now(timezone.utc)

for issue in semua_issues:
    # Parse tanggal dari format ISO 8601 GitHub ke objek datetime Python
    dibuat = datetime.fromisoformat(issue["created_at"].replace("Z", "+00:00"))
    usia_hari = (sekarang - dibuat).days

    labels = issue["labels"]
    nama_labels = ", ".join(l["name"] for l in labels) if labels else "tanpa label"

    print(f"#{issue['number']} — {issue['title']}")
    print(f"  Usia    : {usia_hari} hari")
    print(f"  Label   : {nama_labels}")
    print(f"  Pembuat : {issue['user']['login']}")
    print()

# Statistik ringkasan untuk log Actions
issues_dengan_label = sum(1 for i in semua_issues if i["labels"])
issues_tanpa_label = sum(1 for i in semua_issues if not i["labels"])

print(f"================================")
print(f"Statistik:")
print(f"  Punya label    : {issues_dengan_label} issue")
print(f"  Tanpa label    : {issues_tanpa_label} issue")
print(f"================================\n")
