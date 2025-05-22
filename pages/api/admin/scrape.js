import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { token } = req.query;

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const client = await clientPromise;
  const db = client.db("tiktrend");
  const collection = db.collection("products");

  const hashtag = "tiktokmademebuyit";
const url = `https://scraptik.p.rapidapi.com/feed/search?keyword=%23${hashtag}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-RapidAPI-Key": process.env.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "scraptik.p.rapidapi.com",
      },
    });

    const data = await response.json();

    const products = data?.data?.slice(0, 10).map((item) => ({
      title: item.desc || "Untitled",
      thumbnail: item.video?.cover || "",
      videoUrl: `https://www.tiktok.com/@${item.author?.uniqueId}/video/${item.id}`,
      niche: hashtag,
      stats: {
        likes: item.stats?.diggCount || 0,
        views: item.stats?.playCount || 0,
        shares: item.stats?.shareCount || 0,
      },
    }));

    if (!products || products.length === 0) {
      return res.status(200).json({ message: "No results returned from TikTok" });
    }

    await collection.deleteMany({});
    await collection.insertMany(products);

    res.status(200).json({ message: `Scraped and saved ${products.length} TikTok products.` });
  } catch (error) {
    console.log("TikTok raw data:", data);
    res.status(500).json({ message: "Scraping failed.", error: error.message });
  }
}
