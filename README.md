# @aadvik-teklabs/dropbox-uploader

[![npm version](https://img.shields.io/npm/v/@aadvik-teklabs/dropbox-uploader.svg)](https://www.npmjs.com/package/@aadvik-teklabs/dropbox-uploader)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

A cloud-storage asset uploader for Node.js with a ready-to-use **Express** router and a simple service wrapper. Includes upload, list, delete, sharing-link generation, and preview URL retrieval.

> **Note:** The current implementation is backed by the **Box** SDK (`box-node-sdk`). A native Dropbox adapter is on the roadmap. The public API surface is provider-agnostic, so migrating an integration will require only a token/credential swap.

---

## ✨ Features

- 📤 **Upload** files (Buffer) to a folder
- 📋 **List** folder contents with metadata
- 🔗 **Shared links** — generate public sharing URLs
- 👁️ **Preview URLs** — get embed/preview links
- 🗑️ **Delete** files
- 🔁 **Automatic duplicate handling** — retries with timestamped filename on 409 conflicts
- ♻️ **Persistent auth** — refresh tokens are auto-rotated and written back to `.env`
- 🚏 **Drop-in Express router** — `/upload`, `/files`, `/download/:fileId`

---

## 📦 Installation

```bash
npm install @aadvik-teklabs/dropbox-uploader
```

---

## 🔧 Setup

### 1. Create a Box Developer App

1. Go to <https://app.box.com/developers/console> → **Create New App** → **Custom App** → **OAuth 2.0 (User Authentication)**.
2. Enable the following scopes: Read/Write files, manage sharing links.
3. Copy your **Client ID** and **Client Secret**.
4. Generate a **Refresh Token** using the included `generate-token.js` helper (in the repo) or the Box OAuth playground.

### 2. Create a `.env` file

```env
BOX_CLIENT_ID=your-client-id
BOX_CLIENT_SECRET=your-client-secret
BOX_REFRESH_TOKEN=your-refresh-token
```

The refresh token will be **auto-updated** in this file whenever Box rotates it.

---

## 🚀 Usage

### Programmatic API

```js
const { boxService } = require('@aadvik-teklabs/dropbox-uploader');
const fs = require('fs');

async function main() {
    const buffer = fs.readFileSync('./document.pdf');

    // Upload
    const file = await boxService.uploadFile(buffer, 'document.pdf');
    console.log('Uploaded file ID:', file.id);

    // Create a public sharing link
    const shareUrl = await boxService.createSharingLink(file.id);
    console.log('Share URL:', shareUrl);

    // Get download URL
    const downloadUrl = await boxService.getDownloadUrl(file.id);

    // List files in root folder
    const files = await boxService.listFiles('0');

    // Preview link
    const preview = await boxService.getFilePreview(file.id);

    // Delete
    await boxService.deleteFile(file.id);
}

main().catch(console.error);
```

### Drop-in Express router

```js
const express = require('express');
const { uploadRoutes } = require('@aadvik-teklabs/dropbox-uploader');

const app = express();
app.use('/api', uploadRoutes);

app.listen(3000, () => console.log('Server running on port 3000'));
```

Exposed endpoints:

| Method | Path | Description |
|---|---|---|
| POST | `/api/upload` | Upload a file (multipart field: `file`) |
| GET  | `/api/files` | List files in root folder |
| GET  | `/api/download/:fileId` | Redirect to a temporary download URL |

Example `curl` upload:

```bash
curl -X POST http://localhost:3000/api/upload -F "file=@./photo.jpg"
```

---

## 📖 API Reference

### `boxService.uploadFile(buffer, fileName, folderId?)`
Uploads a file buffer. Auto-renames with timestamp on duplicate name (HTTP 409).

### `boxService.listFiles(folderId?)`
Returns an array of `{ id, name, size, type, modifiedAt, sharedLink }`.

### `boxService.createSharingLink(fileId)`
Returns a public URL string.

### `boxService.getDownloadUrl(fileId)`
Returns a temporary direct-download URL string.

### `boxService.getFilePreview(fileId)`
Returns an expiring embed URL, or `null` if not available.

### `boxService.deleteFile(fileId)`
Deletes the file. Returns `true` on success.

### `getBoxClient(refreshToken)`
Low-level: returns a raw `box-node-sdk` persistent client if you need custom operations.

---

## 🔒 Security

- Never commit `.env` to source control (it's auto-updated with refreshed tokens).
- Rotate the Box refresh token if it may have been exposed.
- Restrict Box app scopes to the minimum required.

---

## 📝 License

MIT © [Aadvik Labs](https://github.com/AadvikLabs)

## 🔗 Links

- [GitHub Repository](https://github.com/AadvikLabs/npm-dropbox-uploder)
- [Report Issues](https://github.com/AadvikLabs/npm-dropbox-uploder/issues)
- [Box API Docs](https://developer.box.com/reference/)
