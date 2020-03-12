'use strict';

const { Client } = require('pg');
const express = require('express');
const PORT = 8080;
const app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.get('/sql', (req, res) => {
  if (req.query.sqlquery) {
    const client = new Client({
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
        res
          .status(200)
          .send('bad postgresql query')
          .end();
        client.end();
      });
  } else {
    res
      .status(200)
      .send('no query')
      .end();
  }
});

app.post('/login', (req, res) => {
  const client = new Client({
    user: 'postgres',
    host: '34.74.147.158',
    database: 'postgres',
    password: 'password'
  });
  client.connect();
  client
    .query(
      "SELECT password FROM LOGINS WHERE username='" + req.body.username + "'"
    )
    .then(data => {
      if (data.rows[0] && data.rows[0].password == req.body.password) {
        res.send({ success: true }).end();
      } else {
        res.send({ success: false }).end();
      }
      client.end();
    })
    .catch(err => {
      console.log(err);
      res.send({ success: false, data: err }).end();
      client.end();
    });
});
app.post('/register', (req, res) => {
  const client = new Client({
    user: 'postgres',
    host: '34.74.147.158',
    database: 'postgres',
    password: 'password'
  });
  client.connect();
  client
    .query(
      `INSERT INTO logins (username, password) VALUES ('${req.body.username}', '${req.body.password}');`
    )
    .then(data => {
      if (data.rowCount && data.rowCount == 1) {
        res.send({ success: true, data: data });
      }
      client.end();
    })
    .catch(err => {
      res.send({ success: false, data: err }).end();
      client.end();
    });
});

app.listen(PORT, () => {
  console.log('App listening on port', PORT);
});
