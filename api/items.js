import clientPromise from '../lib/mongodb.js';

export default async function handler(req, res) {
  try {
    // Pindahkan await clientPromise ke dalam try block
    // agar jika koneksi gagal (misal URI salah), error tertangkap di catch
    const client = await clientPromise;
    
    // Gunakan nama database yang bersih dan sesuai aplikasi
    // MongoDB akan otomatis membuat database ini jika belum ada
    const db = client.db("animanga_tracker"); 
    const collection = db.collection("items");

    switch (req.method) {
      case 'GET':
        const items = await collection.find({}).sort({ updatedAt: -1 }).toArray();
        res.status(200).json(items);
        break;

      case 'POST':
        const newItem = req.body;
        // Pastikan kita menyimpan ID yang dikirim dari frontend
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
    console.error("Database/API Error:", e);
    // Return 500 agar frontend bisa mendeteksi error dan switch ke LocalStorage
    res.status(500).json({ error: 'Internal Server Error', details: e.message });
  }
}