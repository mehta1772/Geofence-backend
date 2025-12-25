const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const members = await Member.find({ userId: req.userId });
    res.json(members);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', auth, async (req, res) => {
  try {
    const member = new Member({ userId: req.userId, ...req.body });
    await member.save();
    res.status(201).json(member);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Member.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id/location', auth, async (req, res) => {
  try {
    const { lat, lng, address, radius } = req.body;
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.userId, {
      homeLocation: { lat, lng, address, radius }
    });
    res.json({ message: 'Location updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;