import express from 'express';
import User from '../models/User.js';
import Property from '../models/Property.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('favorites');
    res.json(user.favorites);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching favorite properties' });
  }
});

router.post('/:propertyId', auth, async (req, res) => {
  try {
    const property = await Property.findById(req.params.propertyId);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const user = await User.findById(req.user._id);
    if (user.favorites.includes(property._id)) {
      return res.status(400).json({ error: 'Property already in favorites' });
    }

    user.favorites.push(property._id);
    await user.save();
    res.json({ message: 'Property added to favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding property to favorites' });
  }
});

router.delete('/:propertyId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const index = user.favorites.indexOf(req.params.propertyId);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Property not found in favorites' });
    }

    user.favorites.splice(index, 1);
    await user.save();
    res.json({ message: 'Property removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: 'Error removing property from favorites' });
  }
});

export default router; 