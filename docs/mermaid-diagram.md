# Diagram Mermaid di GitHub

## 1. Flowchart - Alur Git Workflow

```mermaid
flowchart TD
    A[Buat Branch Baru] --> B[Edit File]
    B --> C[git add]
    C --> D[git commit]
    D --> E[git push]
    E --> F[Buat Pull Request]
    F --> G{Review OK?}
    G -->|Ya| H[Merge ke Master]
    G -->|Tidak| B
    H --> I[Delete Branch]
```

## 2. Sequence Diagram - Alur GitHub Actions
```mermaid
sequenceDiagram
    participant D as Developer
    participant G as GitHub
    participant R as Runner
    participant S as Server
    D->>G: git push
    G->>R: trigger workflow
    R->>R: jalankan steps
    R->>S: deploy
    S-->>R: success
    R-->>G: workflow selesai
    G-->>D: notifikasi sukses
```

## 3. Gantt - Jadwal Belajar

```mermaid
gantt
    title Jadwal Belajar Git dan GitHub
    dateFormat YYYY-MM-DD
    section Git
    Git Dasar        :done, 2025-01-01, 30d
    Git Lanjutan     :done, 2025-02-01, 30d
    Git Expert       :done, 2025-03-01, 30d
    section GitHub
    GitHub Remote    :done, 2025-04-01, 20d
    GitHub Actions   :done, 2025-05-01, 20d
    Simulasi Tim     :active, 2025-06-01, 20d
```
## 4. Git Graph - Visualisasi Branch
```mermaid
gitGraph
    commit id: "first commit"
    commit id: "tambah README"
    branch feature-login
    checkout feature-login
    commit id: "tambah login"
    commit id: "perbaiki login"
    checkout main
    merge feature-login id: "Merge PR"
    commit id: "hotfix bug"
```
## 5. Pie Chart - Progress Kurikulum
```mermaid
pie title Progress Belajar Git dan GitHub
    "Selesai" : 85
    "Sedang Berjalan" : 10
    "Belum Mulai" : 5
```
