import clientPromise from "../../../lib/mongodb";

export default async function handler(req, res) {
  const { token, clear } = req.query;

  if (token !== process.env.ADMIN_TOKEN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const client = await clientPromise;
  const db = client.db("tiktrend");
  const collection = db.collection("products");

  if (clear === "1") {
    await collection.deleteMany({});
    return res.status(200).json({ message: "Database cleared." });
  }

  const hashtags = ["viralfinds", "dropshipping", "amazonfinds"];
  let finalProducts = [];
  let usedHashtag = "";

  for (let tag of hashtags) {
    const url = `https://scraptik.p.rapidapi.com/feed/search?keyword=%23${tag}`;
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
        niche: tag,
        stats: {
          likes: item.stats?.diggCount || 0,
          views: item.stats?.playCount || 0,
          shares: item.stats?.shareCount || 0,
        },
      }));

      if (products.length > 0) {
        finalProducts = products;
        usedHashtag = tag;
        break;
      }
    } catch (err) {
      console.log(`Tag ${tag} failed`, err.message);
    }
  }

  if (finalProducts.length === 0) {
    return res.status(200).json({ message: "No TikTok results from any hashtag." });
  }

  await collection.deleteMany({});
  await collection.insertMany(finalProducts);

  res.status(200).json({ message: `Scraped ${finalProducts.length} TikTok products from #${usedHashtag}` });
}
