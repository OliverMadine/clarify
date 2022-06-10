const express = require("express");
const redis = require('redis');

// ==== retrieve env variables ====
require('dotenv').config();

const sanitizeRedisUrl = url => url.replace(/^(redis\:\/\/)/, '');

const { REDIS_ENDPOINT_URI, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = process.env;

const endpointUri = REDIS_ENDPOINT_URI
    ? sanitizeRedisUrl(REDIS_ENDPOINT_URI)
    : `${sanitizeRedisUrl(REDIS_HOST)}:${REDIS_PORT}`;

const password = REDIS_PASSWORD || undefined;

// ==== end of retrieve env variables ====

const PORT = 3001; // uncomment for deployment

const app = express();

app.use(express.json());

const path = require('path')
// Serve static files from the React frontend app
app.use(express.static(path.join(__dirname, '../client/build')))

app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
});

app.get("/getall", async (req, res) => {
    client = redis.createClient(); //endpointUri, password);
    console.log("getall: checkpoint [1]");
    await client.connect();
    console.log("getall: checkpoint [2]");
    // styles = await client.lrange('demo', 0, -1, (error, styles) => {
        
    // });
    // styles.forEach(v => console.log(v));
    // res.json({});
    res.json( await client.get('demo', (error, styles) => {
        if (error) console.error(error);
        if (styles != null) {
            return styles;
        }
    }));
});

// Anything that doesn't match the above, send back index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname + '/../client/build/index.html'))
})

app.post("/set", async (req, res) => {
    const { data } = req.body;
    client = redis.createClient();
    console.log("set: checkpoint [1]");
    await client.connect();
    console.log("set: checkpoint [2]");
    // const {font, fontSize, bgColor} = req.body;
    console.log(data);
    client.set('demo', JSON.stringify(data));
    // client.set('demo', "{\"font\":\"demoStyle\",\"fontSize\":12,\"bgColor\":\"red\"}");
    // res.json({ message: await client.get('demo', (error, styles) => {
    //     if (error) console.error(error);
    //     if (styles != null) {
    //         return JSON.parse(styles);
    //     }
    // })});
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
