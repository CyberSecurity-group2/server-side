'use strict';

const bcrypt = require('bcrypt');
const saltRounds = 10;
const myPlaintextPassword = 's0//P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';
const { Client } = require('pg');
const express = require('express');
const PORT = 8080;
const app = express();
const clientData = {
  user: 'postgres',
  host: '34.74.147.158',
  database: 'postgres',
  password: 'password'
};

var bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

var cors = require('cors');

app.get('/', (req, res) => {
  res.send('nice').end();
});

app.use(cors());

app.get('/sql', (req, res) => {
  if (req.query.sqlquery) {
    const client = new Client(clientData);
    client.connect();
    let quoteCount = 0;
    // for (let i = 0; i < req.query.sqlquery.length; i++) {
    //   if (req.query.sqlquery.charAt(i) === "'") {
    //     quoteCount++;
    //   }
    // }
    if (quoteCount > 2) {
      res
        .status(200)
        .send({ data: 'intruder alert' })
        .end();
    } else {
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
            .send({ data: 'bad postgresql query' })
            .end();
          client.end();
        });
    }
  } else {
    res
      .status(200)
      .send({ data: 'no query' })
      .end();
  }
});

app.post('/login', (req, res) => {
  const client = new Client(clientData);
  client.connect();
  client
    .query(
      "SELECT password, id FROM user_data WHERE username='" +
        req.body.username +
        "'"
    )
    .then(data => {
      bcrypt.compare(req.body.password, data.rows[0].password, function(
        err,
        result
      ) {
        if (result === true) {
          res
            .send({
              success: true,
              username: req.body.username,
              id: data.rows[0].id
            })
            .end();
        } else {
          res.send({ success: false, data: null }).end();
        }
      });
      client.end();
    })
    .catch(err => {
      console.log(err);
      res.send({ success: false, data: err }).end();
      client.end();
    });
});

app.post('/register', (req, res) => {
  const client = new Client(clientData);
  client.connect();
  bcrypt.genSalt(saltRounds, function(err, salt) {
    bcrypt.hash(req.body.password, salt, function(err, hash) {
      client
        .query(
          `INSERT INTO user_data (username, password) VALUES ('${req.body.username}', '${hash}');`
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
  });
});

app.get('/getUser', (req, res) => {
  var num = req.query.id;
  // num = num.substring(6, 7);
  const client = new Client(clientData);
  client.connect();
  client
    .query("SELECT * FROM user_data WHERE id='" + num + "'")
    .then(data => {
      res.send({ success: true, data: data.rows[0] });
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
