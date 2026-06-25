const mongoose = require("mongoose");

const connectDB = () => {
  return mongoose
    .connect(process.env.MONGODB_URI)
    .then((conn) => {
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    })
    .catch((error) => {
      console.error("MongoDB Connection Error:", error.message);
      process.exit(1);
    });
};

module.exports = connectDB;