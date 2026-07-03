const express = require('express');
const router = express.Router();
const multer = require('multer');
const boxService = require('../services/boxService');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

        const file = await boxService.uploadFile(req.file.buffer, req.file.originalname);
        const sharingUrl = await boxService.createSharingLink(file.id);
        const downloadUrl = await boxService.getDownloadUrl(file.id);

        res.json({
            success: true,
            data: {
                id: file.id,
                name: file.name,
                sharingUrl: sharingUrl,
                downloadUrl: downloadUrl,
                size: file.size
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/files', async (req, res) => {
    try {
        const files = await boxService.listFiles();
        res.json({ success: true, data: files });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/download/:fileId', async (req, res) => {
    try {
        const url = await boxService.getDownloadUrl(req.params.fileId);
        res.redirect(url);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
