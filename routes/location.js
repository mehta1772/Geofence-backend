const express = require('express');
const router = express.Router();
const Member = require('../models/Member');
const User = require('../models/User');
const Alert = require('../models/Alert');
const { sendEmail } = require('../utils/email');
const { calculateDistance } = require('../utils/geofence');

router.post('/update', async (req, res) => {
  try {
    const { memberId, lat, lng, trackingToken } = req.body;
    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }
    if (member.trackingToken !== trackingToken) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    const user = await User.findById(member.userId);
    const previousStatus = member.status;
    const distance = calculateDistance(user.homeLocation.lat, user.homeLocation.lng, lat, lng);
    const newStatus = distance <= user.homeLocation.radius ? 'inside' : 'outside';
    
    member.currentLocation = { lat, lng, timestamp: new Date() };
    member.status = newStatus;
    member.lastSeen = new Date();
    await member.save();
    
    if (previousStatus !== newStatus) {
      const alert = new Alert({
        userId: user._id,
        memberId: member._id,
        memberName: member.name,
        type: newStatus === 'inside' ? 'entered' : 'exited',
        location: { lat, lng }
      });
      await alert.save();
      
      if (user.emailNotifications) {
        const subject = `🚨 ${member.name} ${newStatus === 'inside' ? 'entered' : 'exited'} geofence zone`;
        const message = `${member.name} has ${newStatus === 'inside' ? 'entered' : 'exited'} your geofence zone at ${new Date().toLocaleString()}. Distance: ${Math.round(distance)}m`;
        await sendEmail(user.email, subject, message);
        alert.emailSent = true;
        await alert.save();
      }
    }
    
    res.json({ status: newStatus, distance: Math.round(distance) });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;