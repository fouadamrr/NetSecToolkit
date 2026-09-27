document.addEventListener('DOMContentLoaded', () => {
    // Init Subnet Calculator
    const calcBtn = document.getElementById('calc-btn');
    calcBtn.addEventListener('click', handleCalculate);

    // Init Tabs
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });

    // Init Ports Table
    renderPortsTable(portsData);
    document.getElementById('port-search').addEventListener('input', handlePortSearch);

    // Init Bandwidth Converter
    const bwValue = document.getElementById('bw-value');
    const bwUnit = document.getElementById('bw-unit');
    if (bwValue && bwUnit) {
        bwValue.addEventListener('input', calculateBandwidth);
        bwUnit.addEventListener('change', calculateBandwidth);
        calculateBandwidth();
    }

    // Init Crypto & Decoder
    const analyzeBtn = document.getElementById('analyze-btn');
    if (analyzeBtn) {
        // Basic Encoding
        document.getElementById('basic-algo').addEventListener('change', (e) => {
            document.getElementById('caesar-shift-col').style.display = e.target.value === 'caesar' ? 'block' : 'none';
        });
        document.getElementById('basic-enc-btn').addEventListener('click', handleBasicEncode);

        // Advanced Crypto
        analyzeBtn.addEventListener('click', handleAnalyze);
        document.getElementById('aes-enc-btn').addEventListener('click', handleAesEncrypt);
        document.getElementById('aes-dec-btn').addEventListener('click', handleAesDecrypt);

        // Copy buttons
        const copyBasicBtn = document.getElementById('copy-basic-btn');
        if (copyBasicBtn) {
            copyBasicBtn.addEventListener('click', () => copyToClipboard('basic-output', 'copy-basic-btn'));
        }
        
        const copyAesBtn = document.getElementById('copy-aes-btn');
        if (copyAesBtn) {
            copyAesBtn.addEventListener('click', () => copyToClipboard('aes-output', 'copy-aes-btn'));
        }
    }
});

function copyToClipboard(elementId, btnId) {
    const el = document.getElementById(elementId);
    if (!el || !el.value) return;
    
    navigator.clipboard.writeText(el.value).then(() => {
        const btn = document.getElementById(btnId);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Copied!';
            setTimeout(() => btn.textContent = originalText, 2000);
        }
    }).catch(err => console.error('Failed to copy: ', err));
}

function switchTab(tabId) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    const selectedBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    const selectedContent = document.getElementById(tabId);
    
    if (selectedBtn && selectedContent) {
        selectedBtn.classList.add('active');
        selectedContent.classList.add('active');
    }
}

function handleCalculate() {
    const ipInput = document.getElementById('ip-address').value.trim();
    const cidrInput = parseInt(document.getElementById('cidr').value, 10);
    const errorMsg = document.getElementById('subnet-error');
    const resultsContainer = document.getElementById('results-container');

    errorMsg.textContent = '';
    resultsContainer.style.display = 'none';

    if (!isValidIP(ipInput)) {
        errorMsg.textContent = 'Invalid IP address format.';
        return;
    }

    if (isNaN(cidrInput) || cidrInput < 0 || cidrInput > 32) {
        errorMsg.textContent = 'CIDR must be between 0 and 32.';
        return;
    }

    const results = calculateSubnet(ipInput, cidrInput);
    
    document.getElementById('res-ip').textContent = `${ipInput} /${cidrInput}`;
    document.getElementById('res-network').textContent = results.network;
    document.getElementById('res-range').textContent = `${results.firstHost} - ${results.lastHost}`;
    document.getElementById('res-broadcast').textContent = results.broadcast;
    document.getElementById('res-mask').textContent = results.subnetMask;
    document.getElementById('res-hosts').textContent = results.numHosts.toLocaleString();

    resultsContainer.style.display = 'block';
}

function isValidIP(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    return parts.every(part => {
        const num = parseInt(part, 10);
        // Ensure it's 0-255 and has no leading zeros (e.g. 01)
        return num >= 0 && num <= 255 && part === num.toString();
    });
}

function calculateSubnet(ip, cidr) {
    const ipParts = ip.split('.').map(Number);
    // Convert 4 octets to a single 32-bit integer
    const ipInt = (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

    // Create mask (e.g., /24 -> 255.255.255.0)
    // Shift left to fill with 1s, edge case for /0 handled
    const maskInt = cidr === 0 ? 0 : ~((1 << (32 - cidr)) - 1);

    const networkInt = ipInt & maskInt;
    const broadcastInt = networkInt | ~maskInt;

    // /31 and /32 have 0 usable hosts according to standard definition
    const numHosts = (cidr >= 31) ? 0 : Math.pow(2, 32 - cidr) - 2;

    const firstHostInt = (cidr >= 31) ? networkInt : networkInt + 1;
    const lastHostInt = (cidr >= 31) ? broadcastInt : broadcastInt - 1;

    return {
        network: intToIp(networkInt),
        broadcast: intToIp(broadcastInt),
        subnetMask: intToIp(maskInt),
        firstHost: intToIp(firstHostInt),
        lastHost: intToIp(lastHostInt),
        numHosts: numHosts
    };
}

function intToIp(int) {
    // Unsigned right shift (>>>) ensures we deal with positive 32-bit numbers
    return [
        (int >>> 24) & 255,
        (int >>> 16) & 255,
        (int >>> 8) & 255,
        int & 255
    ].join('.');
}

// --- Ports Reference Logic ---

const portsData = [
    { port: 20, proto: "TCP", name: "FTP-DATA", desc: "File Transfer Protocol (Data)" },
    { port: 21, proto: "TCP", name: "FTP", desc: "File Transfer Protocol (Control)" },
    { port: 22, proto: "TCP", name: "SSH", desc: "Secure Shell" },
    { port: 23, proto: "TCP", name: "Telnet", desc: "Telnet (Unencrypted)" },
    { port: 25, proto: "TCP", name: "SMTP", desc: "Simple Mail Transfer Protocol" },
    { port: 53, proto: "TCP/UDP", name: "DNS", desc: "Domain Name System" },
    { port: 67, proto: "UDP", name: "DHCP", desc: "Dynamic Host Configuration Protocol (Server)" },
    { port: 68, proto: "UDP", name: "DHCP", desc: "Dynamic Host Configuration Protocol (Client)" },
    { port: 80, proto: "TCP", name: "HTTP", desc: "Hypertext Transfer Protocol" },
    { port: 88, proto: "TCP/UDP", name: "Kerberos", desc: "Network Authentication System (AD)" },
    { port: 110, proto: "TCP", name: "POP3", desc: "Post Office Protocol v3" },
    { port: 123, proto: "UDP", name: "NTP", desc: "Network Time Protocol" },
    { port: 135, proto: "TCP", name: "RPC", desc: "Microsoft RPC Endpoint Mapper" },
    { port: 139, proto: "TCP", name: "NetBIOS", desc: "NetBIOS Session Service" },
    { port: 143, proto: "TCP", name: "IMAP", desc: "Internet Message Access Protocol" },
    { port: 161, proto: "UDP", name: "SNMP", desc: "Simple Network Management Protocol" },
    { port: 389, proto: "TCP", name: "LDAP", desc: "Lightweight Directory Access Protocol (AD)" },
    { port: 443, proto: "TCP", name: "HTTPS", desc: "HTTP over TLS/SSL" },
    { port: 445, proto: "TCP", name: "SMB", desc: "Server Message Block (Windows File Sharing)" },
    { port: 3389, proto: "TCP", name: "RDP", desc: "Remote Desktop Protocol" }
];

function renderPortsTable(data) {
    const tbody = document.getElementById('ports-tbody');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        
        // Protocol badge formatting
        const protoHtml = item.proto.split('/').map(p => {
            return `<span class="tag ${p.toLowerCase()}">${p}</span>`;
        }).join(' ');

        row.innerHTML = `
            <td><strong>${item.port}</strong></td>
            <td>${protoHtml}</td>
            <td>${item.name}</td>
            <td>${item.desc}</td>
        `;
        tbody.appendChild(row);
    });
}

function handlePortSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    
    const filtered = portsData.filter(item => 
        item.port.toString().includes(query) ||
        item.name.toLowerCase().includes(query) ||
        item.desc.toLowerCase().includes(query) ||
        item.proto.toLowerCase().includes(query)
    );
    
    renderPortsTable(filtered);
}

// --- Bandwidth Converter Logic ---

function calculateBandwidth() {
    const valInput = document.getElementById('bw-value').value;
    const unit = document.getElementById('bw-unit').value;
    
    const val = parseFloat(valInput);
    if (isNaN(val) || valInput.trim() === '') {
        resetBandwidthDisplay();
        return;
    }

    // Convert everything to bits per second (bps) first
    let bps = 0;
    switch(unit) {
        case 'bps': bps = val; break;
        case 'kbps': bps = val * 1000; break;
        case 'mbps': bps = val * 1000000; break;
        case 'gbps': bps = val * 1000000000; break;
        case 'MBps': bps = val * 8000000; break; // 1 Byte = 8 bits
    }

    // Convert from bps to other units
    const results = {
        bps: bps,
        kbps: bps / 1000,
        mbps: bps / 1000000,
        gbps: bps / 1000000000,
        MBps: bps / 8000000
    };

    document.getElementById('res-bps').textContent = formatNumber(results.bps);
    document.getElementById('res-kbps').textContent = formatNumber(results.kbps);
    document.getElementById('res-mbps').textContent = formatNumber(results.mbps);
    document.getElementById('res-gbps').textContent = formatNumber(results.gbps);
    document.getElementById('res-MBps').textContent = formatNumber(results.MBps);
}

function resetBandwidthDisplay() {
    document.getElementById('res-bps').textContent = '0';
    document.getElementById('res-kbps').textContent = '0';
    document.getElementById('res-mbps').textContent = '0';
    document.getElementById('res-gbps').textContent = '0';
    document.getElementById('res-MBps').textContent = '0';
}

function formatNumber(num) {
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// --- Crypto & Auto-Decoder Logic ---

function handleBasicEncode() {
    const text = document.getElementById('basic-text').value;
    const algo = document.getElementById('basic-algo').value;
    const outBox = document.getElementById('basic-output');
    
    if (!text) {
        outBox.value = '';
        return;
    }

    try {
        if (algo === 'base64') {
            outBox.value = btoa(text);
        } else if (algo === 'hex') {
            let hex = '';
            for (let i = 0; i < text.length; i++) {
                let code = text.charCodeAt(i).toString(16);
                hex += (code.length === 1 ? '0' + code : code);
            }
            outBox.value = hex;
        } else if (algo === 'caesar') {
            const shift = parseInt(document.getElementById('caesar-shift').value, 10) || 3;
            let shifted = '';
            for (let i = 0; i < text.length; i++) {
                let charCode = text.charCodeAt(i);
                if (charCode >= 65 && charCode <= 90) { // Uppercase
                    shifted += String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
                } else if (charCode >= 97 && charCode <= 122) { // Lowercase
                    shifted += String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
                } else {
                    shifted += text.charAt(i);
                }
            }
            outBox.value = shifted;
        }
    } catch (e) {
        outBox.value = 'خطأ: النص لازم يكون حروف إنجليزية/أرقام بس';
    }
}

function handleAnalyze() {
    const input = document.getElementById('analyzer-input').value.trim();
    const resultsDiv = document.getElementById('analyzer-results');
    const outputContainer = document.getElementById('analyzer-output');
    
    if (!input) return;
    
    let results = [];
    
    // 1. Check Base64 (Standard Regex for Base64)
    const base64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    if (base64Regex.test(input) && input.length % 4 === 0 && input.length > 0) {
        try {
            const decoded = atob(input);
            results.push(`[+] Base64 Detected!\nDecoded: ${decoded}\n`);
        } catch (e) {}
    }

    // 2. Check Hexadecimal
    const hexRegex = /^[0-9A-Fa-f]+$/;
    if (hexRegex.test(input) && input.length % 2 === 0 && input.length > 0) {
        try {
            let decoded = '';
            for (let i = 0; i < input.length; i += 2) {
                decoded += String.fromCharCode(parseInt(input.substr(i, 2), 16));
            }
            results.push(`[+] Hexadecimal Detected!\nDecoded: ${decoded}\n`);
        } catch (e) {}
    }

    // 3. Caesar Brute Force (try 1-25 shifts)
    results.push(`[*] Attempting Caesar Cipher Brute-force (Top 3 English Matches):`);
    let caesarMatches = [];
    for (let shift = 1; shift < 26; shift++) {
        let shifted = '';
        for (let i = 0; i < input.length; i++) {
            let charCode = input.charCodeAt(i);
            if (charCode >= 65 && charCode <= 90) { // Uppercase
                shifted += String.fromCharCode(((charCode - 65 - shift + 26) % 26) + 65);
            } else if (charCode >= 97 && charCode <= 122) { // Lowercase
                shifted += String.fromCharCode(((charCode - 97 - shift + 26) % 26) + 97);
            } else {
                shifted += input.charAt(i); // Non-alphabetic stays same
            }
        }
        // Basic English heuristic: count spaces and common letters (etaoin)
        const score = (shifted.match(/[etaoin s]/ig) || []).length;
        caesarMatches.push({ text: shifted, shift: shift, score: score });
    }
    
    // Sort by score descending and take top 3
    caesarMatches.sort((a, b) => b.score - a.score);
    caesarMatches.slice(0, 3).forEach(match => {
        results.push(`  -> Shift -${match.shift}: ${match.text}`);
    });

    if (results.length === 1) { // Only the caesar header was added
        results.push(`[-] Could not identify encoding. Data might be encrypted (AES, etc.) or just plain text.`);
    }

    resultsDiv.textContent = results.join('\n');
    outputContainer.style.display = 'block';
}

// AES-256-GCM Implementation using Web Crypto API

async function deriveKey(password, salt) {
    const enc = new TextEncoder();
    // 1. Import password as raw key material
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        "PBKDF2",
        false,
        ["deriveBits", "deriveKey"]
    );
    // 2. Derive a 256-bit AES key using PBKDF2 (100,000 iterations for security)
    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
}

// Helpers to convert between ArrayBuffer (Binary) and Base64 (Text)
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary = window.atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
}

async function handleAesEncrypt() {
    const text = document.getElementById('aes-text').value;
    const pass = document.getElementById('aes-pass').value;
    const errorMsg = document.getElementById('aes-error');
    const outBox = document.getElementById('aes-output');
    
    errorMsg.textContent = '';
    outBox.value = '';

    if (!text || !pass) {
        errorMsg.textContent = 'Please provide both text and passphrase.';
        return;
    }

    try {
        // Generate random Salt and IV for strong security
        const salt = window.crypto.getRandomValues(new Uint8Array(16));
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const key = await deriveKey(pass, salt);

        const enc = new TextEncoder();
        const encrypted = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            key,
            enc.encode(text)
        );

        // Pack the result into a single copy-pasteable string: Base64(salt) : Base64(iv) : Base64(ciphertext)
        const resultStr = arrayBufferToBase64(salt) + ":" + 
                          arrayBufferToBase64(iv) + ":" + 
                          arrayBufferToBase64(encrypted);
        
        outBox.value = resultStr;
    } catch (e) {
        errorMsg.textContent = 'Encryption failed: ' + e.message;
    }
}

async function handleAesDecrypt() {
    const text = document.getElementById('aes-text').value.trim();
    const pass = document.getElementById('aes-pass').value;
    const errorMsg = document.getElementById('aes-error');
    const outBox = document.getElementById('aes-output');
    
    errorMsg.textContent = '';
    outBox.value = '';

    if (!text || !pass) {
        errorMsg.textContent = 'Please provide both ciphertext and passphrase.';
        return;
    }

    const parts = text.split(':');
    if (parts.length !== 3) {
        errorMsg.textContent = 'Invalid ciphertext format. Expected format: salt:iv:ciphertext.';
        return;
    }

    try {
        // Unpack the string back to binary buffers
        const salt = base64ToArrayBuffer(parts[0]);
        const iv = base64ToArrayBuffer(parts[1]);
        const ciphertext = base64ToArrayBuffer(parts[2]);

        const key = await deriveKey(pass, salt);

        const decrypted = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: new Uint8Array(iv) },
            key,
            ciphertext
        );

        const dec = new TextDecoder();
        outBox.value = dec.decode(decrypted);
    } catch (e) {
        errorMsg.textContent = 'Decryption failed. Wrong passphrase or corrupted data.';
    }
}
