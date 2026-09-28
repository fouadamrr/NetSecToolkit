# NetSecToolkit — Network & Security Toolkit
A browser-based toolkit for IT support and network/security learners.

## 🌟 Key Features
- IPv4 subnet calculator
- Common ports reference with search
- Bandwidth converter (bps, Kbps, Mbps, Gbps, MB/s)
- Base64/Hex/Caesar encoding
- Smart text analyzer and decoder (auto-detects Base64/Hex, Caesar brute-force)
- AES-256-GCM encryption and decryption

## 🛠 Tech Stack
- Frontend: HTML5, CSS3, vanilla JavaScript
- Crypto: Web Crypto API
- Hosting: GitHub Pages
- No frameworks, no backend, no build step.

## 🔒 Security Highlights
- AES-256-GCM authenticated encryption
- PBKDF2 key derivation (SHA-256, 100,000 iterations)
- A random 16-byte salt and 12-byte IV generated for every encryption
- Everything runs client-side and no data is sent to any server

## 📊 System Diagrams

```mermaid
%%{init: {'theme': 'base', 'themeVariables': { 'primaryColor': '#ffffff', 'primaryTextColor': '#334155', 'primaryBorderColor': '#e2e8f0', 'lineColor': '#94a3b8', 'secondaryColor': '#f8fafc', 'tertiaryColor': '#f1f5f9'}}}%%
graph TD
    classDef ui fill:#3b82f6,stroke:#2563eb,stroke-width:2px,color:#ffffff,rx:12,ry:12;
    classDef module fill:#ffffff,stroke:#cbd5e1,stroke-width:2px,color:#0f172a,rx:8,ry:8;
    classDef core fill:#f1f5f9,stroke:#94a3b8,stroke-width:2px,color:#0f172a,rx:12,ry:12;
    classDef math fill:#e0f2fe,stroke:#7dd3fc,stroke-width:1.5px,color:#0369a1,rx:6,ry:6;

    UI[🖥️ User Interface<br/>index.html]:::ui --> Tabs

    subgraph Tabs [🎨 Toolkit Modules]
        direction LR
        SC[🔢 Subnet Calculator]:::module
        PR[🔌 Ports Reference]:::module
        BC[📶 Bandwidth Converter]:::module
        CR[🔐 Crypto & Decoder]:::module
    end

    Tabs --> Logic[⚙️ app.js Core Logic]:::core

    Logic --> |IP/CIDR| SC_Calc[Network Math]:::math
    Logic --> |Port Search| PR_Search[portsData Filter]:::math
    Logic --> |bps Math| BC_Conv[Rate Conversion]:::math
    
    Logic --> CR_Logic[Crypto Functions]:::math
    CR_Logic --> |Base64/Hex/Caesar| Basic[Basic Encoding]:::math
    CR_Logic --> |Regex Match| Analyzer[Smart Analyzer]:::math
    CR_Logic --> |Web Crypto| AES[AES-256-GCM]:::math
```

## 📸 Screenshots
<div align="center">
  <img src="docs/screenshots/1.png" width="800" alt="Subnet Calculator">
  <br><br>
  <img src="docs/screenshots/2.png" width="800" alt="Ports Reference">
  <br><br>
  <img src="docs/screenshots/3.png" width="800" alt="Bandwidth Converter">
  <br><br>
  <img src="docs/screenshots/4.png" width="800" alt="Crypto Basic Encoding">
  <br><br>
  <img src="docs/screenshots/5.png" width="800" alt="AES Encryption">
</div>

## 🚀 Live Demo
https://fouadamrr.github.io/NetSecToolkit/

## 🚀 Setup & Installation
No installation needed. Clone the repo and open `index.html`, or run `python -m http.server 8000` and open http://localhost:8000.

*This is a portfolio project created to demonstrate proficiency in networking fundamentals, web development, and applied cryptography.*
