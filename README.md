# Web-Based Text Encryption Tool

A web-based cryptographic workbench developed for the Information Security assignment. The application allows users to encrypt, decrypt, encode, and hash text using multiple cryptographic techniques.

## Features

- Caesar Cipher encryption and decryption
- AES-256 encryption and decryption
- Base64 encoding and decoding
- SHA-256 hashing
- Input validation
- Copy result to clipboard
- Download result
- Caesar Cipher visualizer
- AES key-strength indicator
- Operation history
- User registration and login
- Save, load, and delete encrypted results
- Responsive professional user interface

## Technologies Used

- HTML5
- CSS3
- JavaScript
- Node.js
- Express.js
- Express Session
- bcryptjs
- Node.js Crypto Module

## Algorithms

### Caesar Cipher

A substitution cipher that shifts alphabetic characters by a specified number.

Example:

Input: `Hello World`  
Shift: `3`  
Output: `Khoor Zruog`

### AES-256

A symmetric encryption algorithm implemented using AES-256-CBC with a secret key and initialization vector.

### Base64

An encoding technique that converts text into Base64 format.

Example:

Input: `Hello World`  
Output: `SGVsbG8gV29ybGQ=`

### SHA-256

A cryptographic hashing algorithm that produces a fixed-length 256-bit hash. SHA-256 is a one-way hash and cannot be decrypted.

## How to Run

Install dependencies:

```bash
npm install
