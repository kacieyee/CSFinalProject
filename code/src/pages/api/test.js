export default function handler(req, res) {
  const { method, query } = req;

  if (method === 'GET') {
    // Handle GET request
    const message = `GET request received. Query params: ${JSON.stringify(query)}`;
    res.status(200).json({ message });
  } else if (method === 'POST') {
    // Handle POST request
    const body = req.body; // If you need to parse the body you will need to add a middleware
    const message = `POST request received. Body: ${JSON.stringify(body)}`;
    res.status(200).json({ message });
  } else {
    // Handle other methods (e.g., PUT, DELETE)
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}