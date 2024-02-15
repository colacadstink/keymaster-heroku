const express = require('express');
const {generateCode} = require("./generateCode");

const server = express();
server.get('/key/:serviceName', async (req, res) => {
  const {serviceName} = req.params;
  const result = await generateCode(serviceName);
  res.status(result.statusCode);
  res.send(result.body ?? '');
});

server.listen(process.env['PORT'] || 8080);
