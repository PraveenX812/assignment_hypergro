import Recommendation from '../models/Recommendation.js';
import Property from '../models/Property.js';
import User from '../models/User.js';

export const recommendProperty = async (req, res) => {
  try {
    const { propertyId, toEmail, message } = req.body;
    const fromUserId = req.user._id;

    // Input validation
    if (!propertyId || !toEmail) {
      return res.status(400).json({ 
        success: false,
        error: 'Property ID and recipient email are required' 
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ 
        success: false,
        error: 'Property not found. The property may have been removed.' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(toEmail)) {
      return res.status(400).json({ 
        success: false,
        error: 'Please enter a valid email address' 
      });
    }

    // Check if recipient exists
    const toUser = await User.findOne({ email: toEmail.toLowerCase().trim() });
    if (!toUser) {
      return res.status(404).json({ 
        success: false,
        error: 'No user found with this email address. Please check the email or ask them to sign up first.' 
      });
    }

    // Check if not recommending to self
    if (toUser._id.toString() === fromUserId.toString()) {
      return res.status(400).json({ 
        success: false,
        error: 'You cannot recommend a property to yourself' 
      });
    }

    // Check for duplicate recommendation
    const existingRecommendation = await Recommendation.findOne({
      property: propertyId,
      fromUser: fromUserId,
      toUser: toUser._id
    });

    if (existingRecommendation) {
      return res.status(409).json({
        success: false,
        error: 'You have already recommended this property to this user'
      });
    }

    try {
      // Create and save recommendation
      const recommendation = new Recommendation({
        property: propertyId,
        fromUser: fromUserId,
        toUser: toUser._id,
        message: message || `Check out this property I found for you!`
      });

      await recommendation.save();

      // Populate the recommendation with user and property details
      const populatedRecommendation = await Recommendation.findById(recommendation._id)
        .populate('property')
        .populate('fromUser', 'name email')
        .populate('toUser', 'name email');

      res.status(201).json({
        success: true,
        data: populatedRecommendation,
        message: 'Property recommended successfully!'
      });
    } catch (error) {
      console.error('Error creating recommendation:', error);
      throw new Error('Failed to create recommendation');
    }
  } catch (error) {
    console.error('Error recommending property:', error);
    res.status(500).json({ error: 'Failed to recommend property' });
  }
};

export const getReceivedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('Fetching recommendations for user:', userId);
    
    // First, check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found:', userId);
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find recommendations for the user
    const recommendations = await Recommendation.find({ toUser: userId })
      .populate({
        path: 'property',
        select: 'title price location images',
        model: 'Property'
      })
      .populate({
        path: 'fromUser',
        select: 'name email',
        model: 'User'
      })
      .sort({ createdAt: -1 })
      .lean(); // Convert to plain JavaScript objects

    console.log(`Found ${recommendations.length} recommendations for user ${userId}`);
    
    // Format the response
    const formattedRecommendations = recommendations.map(rec => ({
      _id: rec._id,
      message: rec.message,
      read: rec.read,
      createdAt: rec.createdAt,
      property: rec.property || { _id: 'deleted', title: 'Property no longer available' },
      fromUser: rec.fromUser || { name: 'Unknown User', email: 'unknown@example.com' }
    }));

    res.json(formattedRecommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    res.status(500).json({ 
      error: 'Failed to fetch recommendations',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude current user
        {
          $or: [
            { email: { $regex: query, $options: 'i' } },
            { name: { $regex: query, $options: 'i' } }
          ]
        }
      ]
    }).select('name email');

    res.json(users);
  } catch (error) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
};
