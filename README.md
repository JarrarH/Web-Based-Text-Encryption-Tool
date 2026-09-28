# CRYPTOLAB — Cryptographic Workbench

A professional web-based text encryption and cryptographic workbench developed for an Information Security assignment.

CRYPTOLAB allows users to encrypt, decrypt, encode, and hash text using multiple cryptographic techniques through a modern, responsive web interface.

---

## Features

### Core Features

- Plain text input
- Algorithm selection
- Encryption processing
- Ciphertext/result display
- Input validation
- User-friendly error messages
- Responsive professional interface

### Supported Cryptographic Methods

- Caesar Cipher
- AES-256-CBC
- Base64
- SHA-256 Hashing

### Advanced Features

- Text decryption
- SHA-256 hashing
- Copy result to clipboard
- Download result as `.txt`
- Caesar Cipher rotation visualizer
- AES key-strength indicator
- Live character and word counter
- Security information panel
- Recent operation history
- User registration and login
- Session-based authentication
- Save encrypted results
- Load saved results
- Delete saved results
- Professional animations and responsive UI

---

## Technologies Used

### Frontend

- HTML5
- CSS3
- JavaScript

### Backend

- Node.js
- Express.js
- Express Session

### Security

- Node.js Crypto module
- AES-256-CBC
- SHA-256
- bcryptjs for password hashing

### Storage

- Local JSON file storage for users and saved messages

---

## Cryptographic Techniques

### 1. Caesar Cipher

The Caesar Cipher is a substitution technique where each alphabetic character is shifted by a specified number of positions.

Example:

```text
Plain Text:
Hello World

Shift:
3

Encrypted:
Khoor Zruog
