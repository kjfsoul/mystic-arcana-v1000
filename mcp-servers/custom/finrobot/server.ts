
import express from 'express';

const app = express();
const port = 4002;

app.get('/status', (req, res) => {
  res.json({ status: 'ok', serverName: 'finrobot' });
});

app.listen(port, () => {
  console.log(`FinRobot server listening at http://localhost:${port}`);
});
