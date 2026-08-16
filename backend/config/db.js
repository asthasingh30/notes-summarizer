import mongoose from "mongoose";

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error(
      "MONGO_URI is missing. Create a .env file in /backend (copy .env.example) and fill it in."
    );
    process.exit(1);
  }

  try {
    // Fail fast instead of hanging forever if Atlas is unreachable
    // (wrong password, IP not whitelisted, cluster paused, etc).
    mongoose.set("strictQuery", true);

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("MongoDB connection failed.");
    console.error(err.message);

    if (err.message.includes("bad auth")) {
      console.error(
        "-> This usually means the password in MONGO_URI is wrong, or you left the <db_password> placeholder in there."
      );
    }
    if (err.message.includes("querySrv") || err.message.includes("ENOTFOUND")) {
      console.error(
        "-> This usually means the cluster address is wrong, or there's a DNS/network issue."
      );
    }
    if (err.name === "MongooseServerSelectionError") {
      console.error(
        "-> Double-check Atlas Network Access has your current IP allowed (or 0.0.0.0/0 for dev), and that the cluster isn't paused."
      );
    }

    process.exit(1);
  }
};

export default connectDB;
