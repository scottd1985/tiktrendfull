import { useEffect, useState } from "react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [showScraper, setShowScraper] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Show scraper button only if secret key is in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("admin") === "mysecret123") {
      setShowScraper(true);
    }

    // Load products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  const handleScrape = async () => {
    const res = await fetch("/api/admin/scrape?token=mysecret123");
    const data = await res.json();
    setMessage(data.message);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>TikTrend - Trending Products</h1>

      {showScraper && (
        <div style={{ marginBottom: 20 }}>
          <button onClick={handleScrape} style={{ padding: "10px 20px", fontWeight: "bold" }}>
            🚀 Scrape Now
          </button>
          {message && <p style={{ marginTop: 10, color: "green" }}>{message}</p>}
        </div>
      )}

      {products.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {products.map((p, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ccc",
                borderRadius: 8,
                padding: 10,
                width: 300,
              }}
            >
              <img
                src={p.thumbnail}
                alt={p.title}
                style={{ width: "100%", borderRadius: 4 }}
              />
              <h3>{p.title}</h3>
              <p>
                <strong>Niche:</strong> {p.niche}
              </p>
              <p>
                ❤️ {p.stats?.likes || 0} | 👁 {p.stats?.views || 0} | 🔁{" "}
                {p.stats?.shares || 0}
              </p>
              <a href={p.videoUrl} target="_blank" rel="noreferrer">
                Watch on TikTok ↗
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
