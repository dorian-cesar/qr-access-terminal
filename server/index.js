const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Models
const User = require('./models/User');
const Company = require('./models/Company');
const Config = require('./models/Config');

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/user', require('./routes/user.routes'));

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync models
    await sequelize.sync();
    console.log('Models synced...');

    // Seed Initial Admin and Config
    const adminExists = await User.findOne({ where: { role: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Super Admin',
        rut: '1-1',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Default Admin created: 1-1 / admin123');
    }

    const qrConfig = await Config.findByPk('qr_master_token');
    if (!qrConfig) {
      await Config.create({ key: 'qr_master_token', value: 'TERMINAL_SUR_2026' });
      console.log('Default QR master token set.');
    }

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}

startServer();
