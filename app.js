'use strict';
const { Client } = require('pg');
const express = require('express');

const app = express();

app.get('/', (req, res) => {
  if(req.query.sqlquery){
  let client = new Client({
    user: 'postgres',
    host: '34.74.147.158',
    database: 'postgres',
    password: 'password'
  });
  client.connect();
  client
    .query(req.query.sqlquery)
    .then(data => {
      res
        .status(200)
        .send(data.rows)
        .end();
      client.end();
    })
    .catch(err => {
      console.log(err);
      client.end();
    });
    } else {
    res.status(200).send('no query').end();
    }
});

const PORT = 8080;

app.listen(PORT, () => {
  console.log('App listening on port', PORT);
});
