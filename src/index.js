const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const nexusRoutes = require('./routes/nexus');
const omnivaelRoutes = require('./routes/omnivael');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Slot 4: Shared API Hub
app.use('/api/auth', authRoutes);

// Slot 5: Admin Tools
app.use('/api/admin', adminRoutes);

// Slot 1: Nexus
app.use('/api/nexus', nexusRoutes);

// Slot 3: Omnivael
app.use('/api/omnivael', omnivaelRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('Shared API Hub (Admin Engine Backend) is running');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
