const Config = require('../models/Config');

exports.getQRData = async (req, res) => {
  try {
    const masterToken = await Config.findByPk('qr_master_token');
    // The QR data is a combination of the master token and the user's RUT
    const qrValue = masterToken.value;
    res.json({ qrValue });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
