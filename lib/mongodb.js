import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
const options = {};

let client;
let clientPromise;

if (!uri) {
  // Do not throw error at top level to avoid crashing the serverless function initialization
  // Logs error for developer visibility
  console.error('ERROR: MONGODB_URI is not defined in Environment Variables.');
  // Return a rejected promise so the API handler catches it gracefully
  clientPromise = Promise.reject(new Error('MONGODB_URI is not defined'));
} else {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, options);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }
}

export default clientPromise;