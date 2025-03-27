import axios from 'axios';

export default async function handler(req, res) {
    const { method } = req;

    if (method === 'GET') {
        return new Promise(async (resolve, reject) => {
            try {
                const { id } = req.query; // get document ID from query

                if (!id) {
                    res.status(400).json({ error: 'Document ID required' });
                    resolve();
                    return;
                }

                const url = `${process.env.RECEIPT_API_URL}/documentintelligence/documentModels/prebuilt-receipt/analyzeResults/${id}?api-version=2024-11-30`;

                const response = await axios.get(url, {
                    headers: {
                        'Ocp-Apim-Subscription-Key': process.env.RECEIPT_API_KEY,
                    }
                });

                res.status(200).json(response.data);
                resolve();
                return;
            } catch (error) {
                console.error('Error fetching results from receipt API', error);
                res.status(500).json({ message: 'Error fetching results from receipt API' });
                resolve();
                return;
            }
        });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
        return;
    }
}