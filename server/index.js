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

    // Manual migration: add isActive if it doesn't exist yet (safe to run multiple times)
    try {
      await sequelize.query(
        'ALTER TABLE Users ADD COLUMN isActive TINYINT(1) NOT NULL DEFAULT 1'
      );
      console.log('Migration: isActive column added.');
    } catch (e) {
      // Column already exists — ignore
    }

    // Manual migration: update ENUM to support superadmin
    try {
      await sequelize.query(
        "ALTER TABLE Users MODIFY COLUMN role ENUM('admin', 'user', 'superadmin') DEFAULT 'user'"
      );
      console.log('Migration: role ENUM updated.');
    } catch (e) {
      // Ignore if fails or already updated
      console.log('Migration role ENUM notice:', e.message);
    }

    // Sync models
    await sequelize.sync();
    console.log('Models synced...');

    // Seed Initial Admin and Config
    const superAdminExists = await User.findOne({ where: { role: 'superadmin' } });
    if (!superAdminExists) {
      const oneOne = await User.findOne({ where: { rut: '1-1' } });
      if (oneOne) {
        await oneOne.update({ role: 'superadmin' });
        console.log('User 1-1 upgraded to Super Admin.');
      } else {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
          name: 'Super Admin',
          rut: '1-1',
          password: hashedPassword,
          role: 'superadmin'
        });
        console.log('Default Super Admin created: 1-1 / admin123');
      }
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
