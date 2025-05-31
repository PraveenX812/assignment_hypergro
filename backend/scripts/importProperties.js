import fs from 'fs';
import { parse } from 'csv-parse';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from '../models/Property.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const processFile = async () => {
  const records = [];
  const parser = fs
    .createReadStream('data.csv')
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    const property = {
      title: record.title,
      type: record.type,
      price: parseInt(record.price),
      state: record.state,
      city: record.city,
      areaSqFt: parseInt(record.areaSqFt),
      bedrooms: parseInt(record.bedrooms),
      bathrooms: parseInt(record.bathrooms),
      amenities: record.amenities.split('|'),
      furnished: record.furnished,
      availableFrom: new Date(record.availableFrom.split('-').reverse().join('-')),
      listedBy: record.listedBy,
      tags: record.tags.split('|'),
      colorTheme: record.colorTheme,
      rating: parseFloat(record.rating),
      isVerified: record.isVerified === 'TRUE',
      listingType: record.listingType,
      isSample: true 
    };
    records.push(property);
  }

  try {
    await Property.deleteMany({ isSample: true });
    console.log('Cleared existing sample properties');

    await Property.insertMany(records);
    console.log(`Successfully imported ${records.length} properties`);
  } catch (error) {
    console.error('Error importing properties:', error);
  }
  mongoose.connection.close();
};

processFile(); 