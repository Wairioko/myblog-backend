import app from './index.js';

const port  = process.env.port

app.listen(port, () => console.log(`Started server on port ${port}`));


