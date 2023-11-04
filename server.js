const express = require('express');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto'); 
// const sharp = require('sharp');
const mysql = require('mysql2')

const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const dotenv = require('dotenv');

dotenv.config()

const bucketName = process.env.BUCKET_NAME
const bucketRegion = process.env.BUCKET_REGION
const accessKey = process.env.ACCESS_KEY
const secretAccessKey = process.env.SECRET_ACCESS_KEY
const dbHost = process.env.DB_HOST
const dbUser = process.env.DB_USER
const dbPassword = process.env.DB_PASSWORD
const dbName = process.env.DB_NAME

const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretAccessKey
    },
    region: bucketRegion
});

const pool = mysql.createPool({
    host: dbHost,
    user: dbUser,
    database: dbName,
    password: dbPassword,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
})

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')

function executeQuery(query, values) {
    return new Promise((resolve, reject) => {
        pool.query(query, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}

const app = express()
const port = 3000;

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const staticFolderPath = path.join(__dirname, 'static');
const customStaticPath = '/';
app.use(customStaticPath, express.static(staticFolderPath));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/templates/index.html')
})

app.get('/api/posts', async (req, res) => {
    const results = await executeQuery('SELECT * FROM msg');
    const posts = Object.values(results);
    for (const post of posts){
        post.imageUrl = 'https://d29rlw59n5e204.cloudfront.net/' + post.image
    }
    res.send(posts)
})

app.get('/api/post', async (req, res) => {
    const new_result = await executeQuery('SELECT * FROM msg ORDER BY id DESC LIMIT 1');
    const new_post = Object.values(new_result)[0];
    new_post.imageUrl = 'https://d29rlw59n5e204.cloudfront.net/' + new_post.image
    res.send(new_post)
})

app.post('/api/post',  upload.single('image'), async (req, res) => {
    const imageName = randomImageName();
    // const buffer = await sharp(req.file.buffer).resize({height: 64, width: 64, fit: 'contain'}).toBuffer()
    const params = {
        Bucket: bucketName,
        Key: imageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
    }
    const command = new PutObjectCommand(params)
    await s3.send(command)
    const data = {
        caption: req.body.caption,
        image: imageName
    }
    await executeQuery('INSERT INTO msg SET ?', data)
    res.send({})
})

app.listen(port, () => {
    console.log(`應用程序運行在 http://localhost:${port}`);
});