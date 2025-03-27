import axios from 'axios';
import { IncomingForm } from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function uploadReceipt(docPath) {
    const url = `${process.env.RECEIPT_API_URL}/documentintelligence/documentModels/prebuilt-receipt:analyze?api-version=2024-11-30`;

    const document = fs.readFileSync(docPath);

    try {
        const response = await axios.post(url, document, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.RECEIPT_API_KEY,
                'Content-Type': 'image/jpg',
            },
        });

        return response;
    } catch (error) {
        console.error('Error uploading document to Azure receipt recognizer:', error);
        throw new Error('Error uploading document to Azure receipt recognizer');
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new IncomingForm();

        return new Promise((resolve, reject) => {
            form.parse(req, async (err, fields, files) => {
                if (err) {
                    res.status(500).json({ error: 'Error parsing receipt data' });
                    resolve();
                    return;
                }

                if (!files.document || files.document.length === 0) {
                    res.status(400).json({ error: 'No receipt file uploaded' });
                    resolve();
                    return;
                }

                const file = files.document[0];

                try {
                    const axiosResponse = await uploadReceipt(file.filepath);
                    const requestId = axiosResponse.headers['apim-request-id'];
                    res.status(200).json({result: axiosResponse.data, requestId: requestId});
                    resolve();
                    return;
                } catch (error) {
                    res.status(500).json({ error: 'Error processing receipt' });
                    resolve();
                    return;
                }
            });
        });
    } else {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
}