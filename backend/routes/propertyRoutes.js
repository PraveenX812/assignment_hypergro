import express from 'express';
import Property from '../models/Property.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const property = new Property({
      ...req.body,
      owner: req.user._id
    });
    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const {
      type,
      city,
      state,
      listingType,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      bedrooms,
      bathrooms,
      furnished,
      listedBy,
      minRating,
      isVerified,
      amenities,
      tags,
      availableFrom,
      sortBy,
      sortOrder,
      page = 1,
      limit = 10
    } = req.query;


    const filters = {};

    if (type) filters.type = type;
    if (city) filters.city = { $regex: city, $options: 'i' };
    if (state) filters.state = { $regex: state, $options: 'i' };
    if (listingType) filters.listingType = listingType;
    if (furnished) filters.furnished = furnished;
    if (listedBy) filters.listedBy = listedBy;
    if (isVerified) filters.isVerified = isVerified === 'true';

    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = Number(minPrice);
      if (maxPrice) filters.price.$lte = Number(maxPrice);
    }

    if (minArea || maxArea) {
      filters.areaSqFt = {};
      if (minArea) filters.areaSqFt.$gte = Number(minArea);
      if (maxArea) filters.areaSqFt.$lte = Number(maxArea);
    }

    if (bedrooms) filters.bedrooms = Number(bedrooms);
    if (bathrooms) filters.bathrooms = Number(bathrooms);
    if (minRating) filters.rating = { $gte: Number(minRating) };

    if (amenities) {
      const amenitiesList = amenities.split(',');
      filters.amenities = { $all: amenitiesList };
    }

    if (tags) {
      const tagsList = tags.split(',');
      filters.tags = { $all: tagsList };
    }

    if (availableFrom) {
      filters.availableFrom = { $gte: new Date(availableFrom) };
    }

    const sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.isSample = 1;
      sort.createdAt = -1;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [properties, total] = await Promise.all([
      Property.find(filters)
        .populate('owner', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Property.countDocuments(filters)
    ]);

    res.json({
      properties,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching properties' });
  }
});

router.get('/my-properties', auth, async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching your properties' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email');
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }
    res.json(property);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching property' });
  }
});

router.patch('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findOne({ _id: req.params.id, owner: req.user._id });
    if (!property) {
      return res.status(404).json({ error: 'Property not found or you are not authorized to update it' });
    }
    if (property.isSample) {
      return res.status(403).json({ error: 'Sample properties cannot be updated' });
    }

    const updates = Object.keys(req.body);
    const allowedUpdates = ['title', 'type', 'price', 'state', 'city', 'areaSqFt', 
      'bedrooms', 'bathrooms', 'amenities', 'furnished', 'availableFrom', 
      'listedBy', 'tags', 'colorTheme', 'rating', 'isVerified', 'listingType'];
    
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));
    if (!isValidOperation) {
      return res.status(400).json({ 
        error: 'Invalid updates',
        allowedFields: allowedUpdates
      });
    }

    if (req.body.type && !['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse'].includes(req.body.type)) {
      return res.status(400).json({ error: 'Invalid property type' });
    }

    if (req.body.furnished && !['Furnished', 'Unfurnished', 'Semi'].includes(req.body.furnished)) {
      return res.status(400).json({ error: 'Invalid furnished status' });
    }

    if (req.body.listedBy && !['Owner', 'Agent', 'Builder'].includes(req.body.listedBy)) {
      return res.status(400).json({ error: 'Invalid listed by value' });
    }

    if (req.body.listingType && !['sale', 'rent'].includes(req.body.listingType)) {
      return res.status(400).json({ error: 'Invalid listing type' });
    }

    updates.forEach(update => property[update] = req.body[update]);
    await property.save();
    res.json(property);
  } catch (error) {
    res.status(400).json({ error: 'Error updating property' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await Property.findOne({ 
      _id: req.params.id, 
      owner: req.user._id 
    });
    if (!property) {
      return res.status(404).json({ error: 'Property not found or you are not authorized to delete it' });
    }
    if (property.isSample) {
      return res.status(403).json({ error: 'Sample properties cannot be deleted' });
    }
    await property.deleteOne();
    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting property' });
  }
});

export default router; 