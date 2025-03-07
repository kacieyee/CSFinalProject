import axios from 'axios';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        try {
            const { id } = req.query; // get document ID from query

            if (!id) {
                return res.status(400).json({ error: 'Document ID required' });
            }

            const url = `${process.env.RECEIPT_API_URL}/formrecognizer/documentModels/prebuilt-receipt/analyzeResults/${id}?api-version=2022-08-31`;

            const response = await axios.get(url, {
                headers: {
                    'Ocp-Apim-Subscription-Key': process.env.RECEIPT_API_KEY,
                }
            });

            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error fetching results from receipt API', error);
            res.status(500).json({ message: 'Error fetching results from receipt API' });
        }
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}