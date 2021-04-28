const keys = require('./keys');
const redis = require('redis');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const pg = require('pg');

const app = express();

app.use(cors()); // tek vir alandan talepte bulunmamıza izin verecek.
app.use(bodyParser.json()); // http talepleri json'a ayrıştırıldı.

const pool = new pg.Pool({
    host: keys.pgHost,
    port: keys.pgPort,
    database: keys.pgDatabase,
    user:keys.pgUser,
    password: keys.pgPassword,
    max:10,
    min:2
});

pool.on('error', (err, client) => {
    console.error('Occurred an error : Veritabanına bağlanılamadı');
    process.exit(1);
})

pool.on('connect', () => {
    console.log('----------- Veritabanına başarıyla bağlanıldı -------');
});

// YOKSA OLUŞTUR
pool.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => console.error("---------", err, "------------"));

const redisClient = redis.createClient({
    retry_strategy: () => 1000,
    host: keys.redisHost,
    port: keys.redisPort
});

const redisPublisher = redisClient.duplicate();


app.get('/', (req, res) => {
    res.send('Hi :))');
});

app.get('/values/all', async(req, res) => {
    const values = await pool.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async(req, res) => {
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    })
});

app.post('/values', async(req, res) => {
    const index = req.body.index;
    if(parseInt(index) > 40){
        return res.status(422).send('Index too high');
    }
    redisClient.hset('values', index, 'Nothing yet !');
    redisPublisher.publish('insert', index);
    pool.query('INSERT INTO values (number) VALUES ($1)', [index]);

    res.send({
        working: true
    });
})


app.listen(5000, () => {
    console.log('Listening');
})
