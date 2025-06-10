const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');

app.use(cors());
const uploadsDir = path.join(__dirname, 'mock_uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

app.use(bodyParser.raw({ type: '*/*', limit: '5gb' }));

let blobCounter = 0;

// Mock publisher - nhận chunk (PUT /v1/blobs?epochs=1)
app.put('/v1/blobs', (req, res) => {
  const blobId = `blob_${Date.now()}_${++blobCounter}`;
  const filePath = path.join(uploadsDir, blobId);

  fs.writeFileSync(filePath, req.body);

  res.json({
    newlyCreated: {
      blobObject: {
        blobId,
      },
    },
  });
});

// Mock aggregator - giả lập download (GET /v1/blobs/:blobId)
app.get('/v1/blobs/:blobId', (req, res) => {
  const { blobId } = req.params;
  const filePath = path.join(uploadsDir, blobId);

  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Blob not found' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Mock Walrus server running at http://localhost:${PORT}`);
});


