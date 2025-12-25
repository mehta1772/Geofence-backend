// ============================================
// FILE: backend/routes/geocode.js
// REPLACE THE ENTIRE FILE WITH THIS CODE
// ============================================

const express = require('express');
const router = express.Router();
const axios = require('axios');

// Search address (Forward Geocoding)
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Query parameter required' });
    }

    console.log('🔍 Searching for:', q);

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        format: 'json',
        q: q,
        limit: 10, // Increased to get more results
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'GeoGuardPro/1.0'
      }
    });

    if (response.data && response.data.length > 0) {
      const results = response.data.map(item => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        address: item.display_name,
        type: item.type,
        importance: item.importance
      }));

      console.log(`✅ Found ${results.length} results`);
      res.json(results);
    } else {
      console.log('❌ No results found');
      res.json([]);
    }
  } catch (error) {
    console.error('❌ Geocoding error:', error.message);
    res.status(500).json({ 
      message: 'Geocoding failed', 
      error: error.message 
    });
  }
});

// Reverse geocode (Coordinates to Address)
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude required' });
    }

    console.log('🔄 Reverse geocoding:', lat, lng);

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        format: 'json',
        lat: lat,
        lon: lng,
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'GeoGuardPro/1.0'
      }
    });

    if (response.data) {
      console.log('✅ Reverse geocoding successful');
      res.json({
        address: response.data.display_name,
        city: response.data.address?.city || response.data.address?.town || response.data.address?.village,
        country: response.data.address?.country,
        state: response.data.address?.state
      });
    } else {
      res.json({
        address: `Location at ${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}`
      });
    }
  } catch (error) {
    console.error('❌ Reverse geocoding error:', error.message);
    // Return a fallback address
    res.json({
      address: `Location at ${parseFloat(req.query.lat).toFixed(4)}, ${parseFloat(req.query.lng).toFixed(4)}`
    });
  }
});

module.exports = router;
