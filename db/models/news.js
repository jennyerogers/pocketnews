import { Schema } from 'mongoose'

const newsSchema = new Schema({
  article_id: { type: String, 
    required: true, 
    unique: true },
  title: { type: String, required: true },
  description: { type: String },
  link: { type: String },
  source_id: { type: String },
  source_url: { type: String },
  image_url: { type: String },
  pubDate: { type: String },
  language: { type: String },
  
}, { timestamps: true });

export default newsSchema