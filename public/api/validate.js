export default function handler(req, res) {
    if (req.method === 'POST') {
        console.log('Save called with payload:', req.body);
        // Process the data and save it
        res.status(200).json({ message: 'Save successful' });
    } else {
        res.status(405).json({ message: 'Method not allowed' });
    }
}
