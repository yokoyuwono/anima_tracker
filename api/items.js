import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  const client = await clientPromise;
  const db = client.db("animanga_db"); // Nama database
  const collection = db.collection("items");

  try {
    switch (req.method) {
      case 'GET':
        const items = await collection.find({}).sort({ updatedAt: -1 }).toArray();
        // Bersihkan _id object dari mongo agar tidak conflict dengan id frontend jika perlu
        res.status(200).json(items);
        break;

      case 'POST':
        const newItem = req.body;
        // Kita gunakan ID dari frontend sebagai referensi unik
        await collection.insertOne(newItem);
        res.status(201).json({ message: 'Item created', item: newItem });
        break;

      case 'PUT':
        const { id, ...updateData } = req.body;
        if (!id) return res.status(400).json({ error: 'ID required' });
        
        await collection.updateOne(
          { id: id },
          { $set: updateData }
        );
        res.status(200).json({ message: 'Item updated' });
        break;

      case 'DELETE':
        const { id: deleteId } = req.query;
        if (!deleteId) return res.status(400).json({ error: 'ID required' });

        await collection.deleteOne({ id: deleteId });
        res.status(200).json({ message: 'Item deleted' });
        break;

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}