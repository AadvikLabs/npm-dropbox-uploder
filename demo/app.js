const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const cors = require('cors');
const uploadRoutes = require('../src/routes/uploadRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api', uploadRoutes);

// Serve Frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`\n🚀 Box Asset Uploader is running!`);
    console.log(`🔗 Local URL: http://localhost:${PORT}`);
    console.log(`📁 Files will be uploaded to your Box root directory.`);
});
