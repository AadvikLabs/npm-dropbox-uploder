const { getBoxClient } = require('../config/boxAuth');
const fs = require('fs');

class BoxService {
    constructor() {
        this.client = getBoxClient(process.env.BOX_REFRESH_TOKEN);
    }

    async listFiles(folderId = '0') {
        try {
            const folder = await this.client.folders.getItems(folderId, {
                fields: 'id,name,size,modified_at,type,shared_link'
            });
            return folder.entries.map(item => ({
                id: item.id,
                name: item.name,
                size: item.size,
                type: item.type,
                modifiedAt: item.modified_at,
                sharedLink: item.shared_link ? item.shared_link.url : null
            }));
        } catch (error) {
            console.error('Box List Files Error:', error.message);
            throw error;
        }
    }

    async uploadFile(fileBuffer, fileName, folderId = '0') {
        try {
            const file = await this.client.files.uploadFile(folderId, fileName, fileBuffer);
            return file.entries[0];
        } catch (error) {
            // Handle duplicate filename
            if (error.statusCode === 409) {
                const timestamp = Date.now();
                const newName = `${timestamp}_${fileName}`;
                return this.uploadFile(fileBuffer, newName, folderId);
            }
            console.error('Box Upload Error:', error.message);
            throw error;
        }
    }

    async getDownloadUrl(fileId) {
        try {
            return await this.client.files.getDownloadURL(fileId);
        } catch (error) {
            console.error('Box Download URL Error:', error.message);
            throw error;
        }
    }

    async createSharingLink(fileId) {
        try {
            const file = await this.client.files.update(fileId, {
                shared_link: {
                    access: 'open' // Public link
                }
            });
            return file.shared_link.url;
        } catch (error) {
            console.error('Box Sharing Link Error:', error.message);
            throw error;
        }
    }

    async getFilePreview(fileId) {
        try {
            // Box provides a direct preview link for many file types
            const file = await this.client.files.get(fileId, { fields: 'expiring_embed_link' });
            return file.expiring_embed_link ? file.expiring_embed_link.url : null;
        } catch (error) {
            console.error('Box Preview Error:', error.message);
            return null;
        }
    }

    async deleteFile(fileId) {
        try {
            await this.client.files.delete(fileId);
            return true;
        } catch (error) {
            console.error('Box Delete Error:', error.message);
            throw error;
        }
    }
}

module.exports = new BoxService();
