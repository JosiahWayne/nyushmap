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

const pointsCount = db.points.countDocuments()

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

        app.get('/fetchcomments', async (req, res) => {
            try {
                const pointId = parseInt(req.query.pointId);
                const result = await db.collection(collectionName).findOne({ id: pointId });
                if (result) {
                    res.json(result.comments || []);
                } else {
                    res.status(404).send('Point not found');
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/delete', async (req, res) => {
            try {
                const pointId = req.body.pointId; // 从请求体中获取要删除的点的ID
                const parsedPointId = parseInt(pointId, 10); // 将字符串转换为整数
                
                // 删除指定的点
                const deleteResult = await db.collection(collectionName).deleteOne({ id: parsedPointId });
                pointsCount -= 1;
                if (deleteResult.deletedCount === 1) {
                    // 更新所有大于被删除点ID的点ID
                    const updateResult = await db.collection(collectionName).updateMany(
                        { id: { $gt: parsedPointId } }, // 找到所有id大于删除点id的点
                        { $inc: { id: -1 } } // 将它们的id减1
                    );
        
                    res.json({ message: "Point deleted and IDs updated successfully!" });
                } else {
                    res.status(404).json({ message: "Point not found" });
                }
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal Server Error');
            }
        });

        app.post('/save', async (req, res) => {
            try {
                const newPoints = req.body;
                newPoints[0].id = pointsCount;
                const result = await db.collection(collectionName).insertMany(newPoints);
                res.json("Point Saved Successfully!");
                pointsCount += 1;
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
