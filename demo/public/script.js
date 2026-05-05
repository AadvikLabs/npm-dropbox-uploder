document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const activeUploads = document.getElementById('active-uploads');
    const emptyState = document.getElementById('empty-state');
    const uploadCountBadge = document.getElementById('upload-count');
    
    // Modal elements
    const resultModal = document.getElementById('result-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const closeIconBtn = document.getElementById('close-modal-btn');
    const viewBtn = document.getElementById('view-btn');
    const downloadBtn = document.getElementById('download-btn');
    const copyBtn = document.getElementById('copy-btn');
    const modalFilename = document.getElementById('modal-filename');
    const modalFilesize = document.getElementById('modal-filesize');
    
    let activeCount = 0;
    let totalUploaded = 0;
    let currentSharingLink = '';

    // Drag & Drop Handlers
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragging');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        handleFiles(e.dataTransfer.files);
    });

    dropZone.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    function handleFiles(files) {
        if (files.length === 0) return;
        emptyState.style.display = 'none';
        
        Array.from(files).forEach(file => {
            uploadFile(file);
        });
    }

    function uploadFile(file) {
        activeCount++;
        // We don't call updateBadge here anymore, we wait for success

        const item = document.createElement('div');
        item.className = 'upload-item';
        item.innerHTML = `
            <div class="item-icon">
                <i class="fa-solid fa-file-invoice"></i>
            </div>
            <div class="item-info">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                    <h4>${file.name}</h4>
                    <span class="item-status" style="font-size: 0.75rem; color: var(--primary); font-weight: 600;">0%</span>
                </div>
                <div class="progress-container">
                    <div class="progress-bar"></div>
                </div>
            </div>
        `;
        
        activeUploads.prepend(item);
        const progressBar = item.querySelector('.progress-bar');
        const statusText = item.querySelector('.item-status');

        const formData = new FormData();
        formData.append('file', file);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/api/upload', true);

        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = percent + '%';
                statusText.innerText = percent + '%';
            }
        };

        xhr.onload = () => {
            if (xhr.status === 200) {
                const res = JSON.parse(xhr.responseText);
                progressBar.style.width = '100%';
                statusText.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--success);"></i>';
                // Store data for re-opening
                const fileData = res.data;
                item.style.cursor = 'pointer';
                item.title = 'Click to view sharing options';
                item.addEventListener('click', () => showSuccessModal(fileData));

                // Show high-end modal
                showSuccessModal(fileData);
                totalUploaded++;
                updateBadge();
            } else {
                statusText.innerHTML = '<i class="fa-solid fa-circle-xmark" style="color: var(--error);"></i>';
            }
            activeCount--;
            // We only update if totalUploaded hasn't changed or we want to check empty state
            if (activeCount === 0 && totalUploaded === 0) updateBadge();
        };

        xhr.send(formData);
    }

    function showSuccessModal(data) {
        modalFilename.innerText = data.name;
        modalFilesize.innerText = formatBytes(data.size);
        viewBtn.href = data.sharingUrl;
        downloadBtn.href = data.downloadUrl;
        currentSharingLink = data.sharingUrl;
        
        resultModal.classList.add('active');
    }

    function updateBadge() {
        uploadCountBadge.innerText = totalUploaded;
        if (activeCount === 0 && totalUploaded === 0) {
            emptyState.style.display = 'flex';
        } else {
            emptyState.style.display = 'none';
        }
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    closeModalBtn.addEventListener('click', () => {
        resultModal.classList.remove('active');
    });

    closeIconBtn.addEventListener('click', () => {
        resultModal.classList.remove('active');
    });

    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(currentSharingLink).then(() => {
            const toast = document.getElementById('toast');
            toast.classList.add('active');
            setTimeout(() => toast.classList.remove('active'), 3000);
        });
    });

    // Close modal on outside click
    resultModal.addEventListener('click', (e) => {
        if (e.target === resultModal) resultModal.classList.remove('active');
    });
});
