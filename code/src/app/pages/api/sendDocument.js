import axios from 'axios';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

async function uploadReceipt(docPath) {
    const url = `${process.env.RECEIPT_API_URL}/formrecognizer/documentModels/prebuilt-receipt:analyze?api-version=2022-08-31`;

    const document = fs.readFileSync(docPath);

    try {
        const response = await axios.post(url, document, {
            headers: {
                'Ocp-Apim-Subscription-Key': process.env.RECEIPT_API_KEY,
                'Content-Type': 'image/jpg',
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error uploading document to Azure receipt recognizer:', error);
        throw new Error('Error uploading document to Azure receipt recognizer');
    }
}

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const form = new formidable.IncomingForm();

        form.parse(req, async (error, getConfigFileParsingDiagnostics, files) => {
            if (err) {
                return res.status(500).json({ error: 'Error parsing receipt data' });
            }
            
            const file = files.document[0];

            if (!file) {
                return res.status(400).json({ error: 'No receipt file uploaded' });
            }

            try {
                const result = await uploadReceipt(file.filepath);

                return res.status(200).json(result);
            } catch(error) {
                return res.status(500).json({ error: 'Error processing receipt' });
            }
        });
    } else {
        return res.status(405).json({ error: 'Method not allowed' });
    }
}
