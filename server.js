const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

const app = express();
const port = 3000;
const mongoUrl = 'mongodb://localhost:27017';
const dbName = 'mapdb';
const collectionName = 'points';

app.use(cors());

// 使用中间件解析请求体
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

async function connectToDatabase() {
    let client;
    try {
        client = await MongoClient.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('Connected to the database');
        const db = client.db(dbName);

        // 设置路由
        app.get('/points', async (req, res) => {
            try {
                const result = await db.collection(collectionName).find().toArray();
                res.json(result);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/save', async (req, res) => {
            try {
                const newPoints = req.body;
                const result = await db.collection(collectionName).insertMany(newPoints);
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/submitcomment', async (req, res) => {
            try {
                const comment = req.body.comment;
                const pointId = req.body.pointId;
        
                // 更新点的评论
                const result = await db.collection(collectionName).updateOne(
                    { id: pointId },
                    { $push: { comments: comment } }
                );
        
                res.json({ message: 'Comment submitted successfully' });
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        // 启动服务器
        app.listen(port, () => {
            console.log(`Server running at http://8.136.117.89:${port}`);
        });

    } catch (err) {
        console.error('Failed to connect to the database', err);
    }
}

connectToDatabase();
