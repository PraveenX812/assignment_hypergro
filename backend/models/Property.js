import mongoose from 'mongoose';

const propertySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Apartment', 'Villa', 'Bungalow', 'Studio', 'Penthouse']
  },
  price: {
    type: Number,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  areaSqFt: {
    type: Number,
    required: true
  },
  bedrooms: {
    type: Number,
    required: true
  },
  bathrooms: {
    type: Number,
    required: true
  },
  amenities: [{
    type: String
  }],
  furnished: {
    type: String,
    enum: ['Furnished', 'Unfurnished', 'Semi'],
    required: true
  },
  availableFrom: {
    type: Date,
    required: true
  },
  listedBy: {
    type: String,
    enum: ['Owner', 'Agent', 'Builder'],
    required: true
  },
  tags: [{
    type: String
  }],
  colorTheme: {
    type: String
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  listingType: {
    type: String,
    enum: ['sale', 'rent'],
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: function() { return !this.isSample; }
  },
  isSample: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

propertySchema.index({ title: 'text', city: 'text', state: 'text' });
propertySchema.index({ price: 1 });
propertySchema.index({ type: 1 });
propertySchema.index({ listingType: 1 });

const Property = mongoose.model('Property', propertySchema);

export default Property; 