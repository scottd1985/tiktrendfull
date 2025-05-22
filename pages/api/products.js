
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db('tiktrend');
  const products = await db.collection('products').find().sort({ _id: -1 }).limit(20).toArray();
  res.status(200).json(products);
}
