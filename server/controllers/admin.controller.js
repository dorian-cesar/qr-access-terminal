const User = require('../models/User');
const Company = require('../models/Company');
const Config = require('../models/Config');
const bcrypt = require('bcryptjs');

// Companies
exports.getCompanies = async (req, res) => {
  const companies = await Company.findAll();
  res.json(companies);
};

exports.createCompany = async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.json(company);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Users
exports.getUsers = async (req, res) => {
  const users = await User.findAll({ include: [Company] });
  res.json(users);
};

exports.createUser = async (req, res) => {
  try {
    const { password, ...userData } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...userData, password: hashedPassword });
    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { password, ...userData } = req.body;
    
    if (password) {
      userData.password = await bcrypt.hash(password, 10);
    }

    await User.update(userData, { where: { id } });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// QR Token
exports.getQRToken = async (req, res) => {
  const token = await Config.findByPk('qr_master_token');
  res.json(token);
};

exports.updateQRToken = async (req, res) => {
  try {
    const { value } = req.body;
    await Config.update({ value }, { where: { key: 'qr_master_token' } });
    res.json({ message: 'QR Master Token updated successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
