const expressStaticTemplate = (entryHtml = "index.html") => `
const express = require('express');
const app = express();
const path = require('path');
app.use(express.static('.'));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '${entryHtml}')));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log('Server running on port', port));
`;
export default expressStaticTemplate;