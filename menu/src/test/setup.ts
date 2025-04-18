import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

// Mock NATS wrapper
jest.mock('../nats-wrapper', () => ({
  natsWrapper: {
    client: {
      publish: jest.fn().mockImplementation(
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
    },
  },
}));

// Declare global signin functions
declare global {
  var customerSignIn: () => string[];
  var staffSignIn: () => string[];
}

let mongo: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Set environment variables for testing
  process.env.JWT_KEY = 'test-jwt-key';

  // Create an in-memory MongoDB server
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  // Connect to the in-memory database
  await mongoose.connect(mongoUri);
});

// Clear collections between tests
beforeEach(async () => {
  const collections = await mongoose.connection.db.collections();
  
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});

// Clean up after all tests
afterAll(async () => {
  await mongoose.connection.close();
  await mongo.stop();
});

// Global sign-in helper for customer role
global.customerSignIn = () => {
  // Create a JWT payload
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test-customer@example.com',
    role: 'customer',
  };

  // Create the JWT token
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build the session object
  const session = { jwt: token };

  // Convert to JSON
  const sessionJSON = JSON.stringify(session);

  // Encode as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return cookie with encoded data
  return [`session=${base64}`];
};

// Global sign-in helper for staff role
global.staffSignIn = () => {
  // Create a JWT payload with staff role
  const payload = {
    id: new mongoose.Types.ObjectId().toHexString(),
    email: 'test-staff@example.com',
    role: 'staff',
  };

  // Create the JWT token
  const token = jwt.sign(payload, process.env.JWT_KEY!);

  // Build the session object
  const session = { jwt: token };

  // Convert to JSON
  const sessionJSON = JSON.stringify(session);

  // Encode as base64
  const base64 = Buffer.from(sessionJSON).toString('base64');

  // Return cookie with encoded data
  return [`session=${base64}`];
}; 