import express from 'express';
import dotenv from 'dotenv';
import { connectMongoDB } from './Database/db.js';
import { router } from './routes/auth.js';

const app = express();
app.use(express.json());
dotenv.config();

//Routes
app.use('/api/auth', router);

// port running server
app.listen(3000, () => {
  connectMongoDB();
  console.log('Server is running on port 3000');
});
