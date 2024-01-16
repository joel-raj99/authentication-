import Mongoose from 'mongoose';

export const connectMongoDB = async (req, res) => {
  try {
    const conn = await Mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB Connected : ${conn.connection.host}`);
  } catch (error) {
    res.json({ message: 'Database Down down', error });
  }
};
