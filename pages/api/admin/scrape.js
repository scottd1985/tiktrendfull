import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { token } = req.query;

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const client = await clientPromise;
  const db = client.db("tiktrend");
  const collection = db.collection("products");

  // Replace old data
  await collection.deleteMany({});

  // New sample products with working images
  const sampleProducts = [
    {
      title: "LED Galaxy Projector",
      thumbnail: "https://m.media-amazon.com/images/I/71zFeUtwEaL._AC_SL1500_.jpg",
      videoUrl: "https://www.tiktok.com/@example/video/123456789",
      niche: "Home Decor",
      stats: {
        likes: 5123,
        views: 20456,
        shares: 122
      }
    },
    {
      title: "Portable Smoothie Blender",
      thumbnail: "https://m.media-amazon.com/images/I/61+J2Y+f2gL._AC_SL1500_.jpg",
      videoUrl: "https://www.tiktok.com/@example/video/987654321",
      niche: "Kitchen",
      stats: {
        likes: 6341,
        views: 31823,
        shares: 268
      }
    }
  ];

  await collection.insertMany(sampleProducts);

  res.status(200).json({ message: "Products added to MongoDB!" });
}
