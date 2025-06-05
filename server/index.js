const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')

app.use(express.json())
app.use(cors())

app.use('/images', express.static('public/images'));

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'advicedb',
})
const getQuery = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};
function matrixFactorization(R, P, Q, K, steps = 15000, alpha = 0.005, beta = 0.01) { //! steps = 30000
    const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));

    Q = transpose(Q);
    let e = 0;
    // !ДЛЯ ТЕСТУВАННЯ
    const errorsPerEpoch = []; 

    const { performance } = require('perf_hooks');
    const formatTime = (milliseconds) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const ms = String(Math.floor(milliseconds % 1000)).padStart(3, '0');
        const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const seconds = String(totalSeconds % 60).padStart(2, '0');
        return `${hours}:${minutes}:${seconds}.${ms}`; 
    };
    let start = performance.now();

    for (let step = 0; step < steps; step++) {
        for (let i = 0; i < R.length; i++) {
            for (let j = 0; j < R[i].length; j++) {
                if (R[i][j] > 0) {
                    const eij = R[i][j] - dotProduct(P[i], Q.map(row => row[j]));
                    for (let k = 0; k < K; k++) {
                        P[i][k] = P[i][k] + alpha * (2 * eij * Q[k][j] - beta * P[i][k]);
                        Q[k][j] = Q[k][j] + alpha * (2 * eij * P[i][k] - beta * Q[k][j]);
                    }
                }
            }
        }

        // let e = 0;
        e = 0;
        for (let i = 0; i < R.length; i++) {
            for (let j = 0; j < R[i].length; j++) {
                if (R[i][j] > 0) {
                    const eij = R[i][j] - dotProduct(P[i], Q.map(row => row[j]));
                    e += Math.pow(eij, 2);
                    for (let k = 0; k < K; k++) {
                        e += (beta / 2) * (Math.pow(P[i][k], 2) + Math.pow(Q[k][j], 2));
                    }
                }
            }
        }

        if (step % 100 === 0) {
            const currentTime = formatTime(performance.now() - start);
            // errorsPerEpoch.push({ epoch: step, error: e });
            errorsPerEpoch.push({ epoch: step, error: e, timeFormatted: currentTime });
        }

        if (e < 0.001) {
            break;
        }
    }
    const totalTime = formatTime(performance.now() - start);
    errorsPerEpoch.push({ epoch: steps, error: e, timeFormatted: totalTime });
    // errorsPerEpoch.push({ epoch: steps, error: e });

    // return { P, Q: transpose(Q) };
    // return { P, Q: transpose(Q), e };
    return { P, Q: transpose(Q), e, errorsPerEpoch };

}


app.listen(3002, ()=>{
    console.log("Server is running on port 3002");
})

app.post('/register', (req, res)=>{
    const sentEmail = req.body.Email
    const sentName = req.body.Name
    const sentPassword = req.body.Password

    const SQL = 'INSERT INTO users (email, name, password) VALUES (?,?,?)'
    const Values = [sentEmail, sentName, sentPassword]

    db.query(SQL, Values, (err, results)=>{
        if(err){
            res.send(err)
        }
        else{
            console.log("User inserted successfully!")
            res.send({message: 'User added!'})
        }
    })
})
app.post('/login', (req, res)=>{
    const sentLoginName = req.body.LoginName
    const sentLoginPassword = req.body.LoginPassword

    const SQL = 'SELECT * FROM users WHERE name = ?  && password = ?'

    const Values = [sentLoginName, sentLoginPassword]

    db.query(SQL, Values, (err, results)=>{
        if(err){
            console.error("Database error:", err);
            return res.status(500).send({ error: 'Database error' });
        }
        if(results.length > 0){

            console.log(results[0]);
            res.send({
                message: 'Login successful',
                user: results[0].name,
                userID: results[0].userID 
            });
        }
        else{
            res.send({message: `Credentials Don't Match!`})
        }
    })
})
async function trainFully(K) {
    const fs = require('fs');
    const path = require('path');

    const filesDir = path.join(__dirname, 'files');
    if (!fs.existsSync(filesDir)) {
        fs.mkdirSync(filesDir);
    }

    const saveMatrixToCSV = (matrix, filename) => {
        const csv = matrix.map(row => row.join(',')).join('\n');
        fs.writeFileSync(path.join(filesDir, filename), csv);
    };
    const activeUsers = await getQuery(`
        SELECT userID FROM feedbacks GROUP BY userID HAVING COUNT(*) >= 5
    `);
    const userIDIndex = new Map();
    activeUsers.forEach((u, i) => userIDIndex.set(u.userID, i));

    const activePlaces = await getQuery(`
        SELECT placeID FROM feedbacks GROUP BY placeID HAVING COUNT(*) >= 5
    `);
    const placeIDIndex = new Map();
    activePlaces.forEach((p, i) => placeIDIndex.set(p.placeID, i));

    const feedbacks = await getQuery(`SELECT userID, placeID, rating FROM feedbacks`);

    const R = Array.from({ length: activeUsers.length }, () =>
        Array(activePlaces.length).fill(0)
    );

    feedbacks.forEach(({ userID, placeID, rating }) => {
        const i = userIDIndex.get(userID);
        const j = placeIDIndex.get(placeID);
        if (i !== undefined && j !== undefined) {
            R[i][j] = rating;
        }
    });

    saveMatrixToCSV(R, 'original_matrix.csv');

    const randomMatrix = (rows, cols) => Array.from({ length: rows }, () =>
        Array.from({ length: cols }, () => Math.random())
    );
    const P = randomMatrix(R.length, K);
    const Q = randomMatrix(R[0].length, K);

    const { P: finalP, Q: finalQ, e: finalE, errorsPerEpoch } = matrixFactorization(R, P, Q, K, 100000);
    const errorCSV = errorsPerEpoch.map(({ epoch, error, timeFormatted }) =>
        `${epoch},${error},${timeFormatted}`).join('\n');
    fs.writeFileSync(path.join(filesDir, 'errors.csv'), `Epoch,Error,Time\n${errorCSV}`);

    const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const resultMatrix = finalP.map(rowP => finalQ.map(colQ => dotProduct(rowP, colQ)));
    const roundedMatrix = resultMatrix.map(row =>
        row.map(value => Number(value.toFixed(2)))
    );

    saveMatrixToCSV(roundedMatrix, 'predicted_matrix.csv');

    // метрики точності
    let totalSquaredError = 0;
    let totalAbsoluteError = 0;
    let count = 0;
    for (let i = 0; i < R.length; i++) {
        for (let j = 0; j < R[i].length; j++) {
            if (R[i][j] > 0) {
                const predicted = resultMatrix[i][j];
                const actual = R[i][j];
                const error = actual - predicted;
                totalSquaredError += error ** 2;
                totalAbsoluteError += Math.abs(error);
                count++;
            }
        }
    }
    const rmse = Math.sqrt(totalSquaredError / count);
    const mae = totalAbsoluteError / count;
    const metricsCSV = `Metric,Value\nRMSE,${rmse.toFixed(4)}\nMAE,${mae.toFixed(4)}\n`;
    fs.writeFileSync(path.join(filesDir, 'metrics.csv'), metricsCSV);


    for (let i = 0; i < activeUsers.length; i++) {
        const jsonVec = JSON.stringify(finalP[i]);
        await getQuery(`UPDATE users SET featureVector = ? WHERE userID = ?`, [
            jsonVec,
            activeUsers[i].userID,
        ]);
    }

    for (let j = 0; j < activePlaces.length; j++) {
        const jsonVec = JSON.stringify(finalQ[j]);
        await getQuery(`UPDATE places SET featureVector = ? WHERE placeID = ?`, [
            jsonVec,
            activePlaces[j].placeID,
        ]);
    }

    console.log("Повне навчання завершено.");
}

async function trainUser(userID, K) {
    const countRows = await getQuery(`
        SELECT COUNT(*) as cnt FROM feedbacks WHERE userID = ?
    `, [userID]);
    const countResult = countRows[0];

    if (countResult.cnt < 5) return;

    const places = await getQuery(`SELECT placeID, featureVector FROM places`);

    const placeVectors = places.map(p => p.featureVector ? JSON.parse(p.featureVector) : null);
    const validIndexes = places.map((p, idx) => p.featureVector ? idx : -1).filter(i => i !== -1);

    const feedbacks = await getQuery(`
        SELECT placeID, rating FROM feedbacks WHERE userID = ?
    `, [userID]);

    const placeIDIndex = new Map();
    places.forEach((p, idx) => placeIDIndex.set(p.placeID, idx));

    const R = [Array(places.length).fill(0)];
    feedbacks.forEach(({ placeID, rating }) => {
        const idx = placeIDIndex.get(placeID);
        if (idx !== undefined) R[0][idx] = rating;
    });

    const P = [Array.from({ length: K }, () => Math.random())];
    const Q = placeVectors.map(v => v || Array(K).fill(0)); // замінюємо null

    const { P: finalP } = matrixFactorization(R, P, Q, K, 2000);
    const jsonVec = JSON.stringify(finalP[0]);

    await getQuery(`UPDATE users SET featureVector = ? WHERE userID = ?`, [jsonVec, userID]);
}

async function trainUserLocal(userID, K) {
    const userRows = await getQuery(`
        SELECT cityID, featureVector FROM users WHERE userID = ?
    `, [userID]);
    const user = userRows[0];

    const places = await getQuery(`
        SELECT placeID, featureVector FROM places WHERE cityID = ?
    `, [user.cityID]);

    const feedbacks = await getQuery(`
        SELECT placeID, rating FROM feedbacks WHERE userID = ?
    `, [userID]);

    const placeIDIndex = new Map();
    places.forEach((p, idx) => placeIDIndex.set(p.placeID, idx));

    const R = [Array(places.length).fill(0)];
    feedbacks.forEach(({ placeID, rating }) => {
        const idx = placeIDIndex.get(placeID);
        if (idx !== undefined) R[0][idx] = rating;
    });

    const Q = places.map(p => p.featureVector ? JSON.parse(p.featureVector) : Array(K).fill(0));

    let P;
    if (user.featureVector) {
        P = [JSON.parse(user.featureVector)];
    } else {
        P = [Array.from({ length: K }, () => Math.random())];
    }

    const { P: finalP } = matrixFactorization(R, P, Q, K, 1000);
    const jsonVec = JSON.stringify(finalP[0]);

    await getQuery(`UPDATE users SET featureVector = ? WHERE userID = ?`, [jsonVec, userID]);
}

async function checkAndTrainPlacesWithEnoughRatings(K) {
    const places = await getQuery(`
        SELECT p.placeID FROM places p
        LEFT JOIN feedbacks f ON p.placeID = f.placeID
        WHERE p.featureVector IS NULL
        GROUP BY p.placeID
        HAVING COUNT(f.rating) >= 5
    `);

    for (const { placeID } of places) {
        await trainPlace(placeID, K);
    }
}

async function trainPlace(placeID, K) {
    const users = await getQuery(`
        SELECT u.userID, u.featureVector
        FROM users u
        JOIN (
            SELECT userID FROM feedbacks GROUP BY userID HAVING COUNT(*) >= 5
        ) qualified ON qualified.userID = u.userID
    `);
    const userVectors = users.map(u => u.featureVector ? JSON.parse(u.featureVector) : null);

    const feedbacks = await getQuery(`
        SELECT userID, rating FROM feedbacks WHERE placeID = ?
    `, [placeID]);
    
    const userIDIndex = new Map();
    users.forEach((u, idx) => userIDIndex.set(u.userID, idx));

    const R = Array.from({ length: users.length }, () => [0]);
    feedbacks.forEach(({ userID, rating }) => {
        const idx = userIDIndex.get(userID);
        if (idx !== undefined) R[idx][0] = rating;
    });

    const P = userVectors.map(v => v || Array(K).fill(0));
    const Q = [Array.from({ length: K }, () => Math.random())];

    const { Q: finalQ } = matrixFactorization(R, P, Q, K, 2000);
    const jsonVec = JSON.stringify(finalQ[0]);

    await getQuery(`UPDATE places SET featureVector = ? WHERE placeID = ?`, [jsonVec, placeID]);
}

app.get('/recommendations/:userID', async (req, res) => {
    const userID = parseInt(req.params.userID);
    const K = 15;

    // повне навчання?
    const userStats = await getQuery(`
        SELECT COUNT(*) as total, SUM(CASE WHEN featureVector IS NULL THEN 1 ELSE 0 END) as nullCount FROM users
    `);
    const { total: totalUsers, nullCount: nullUsers } = userStats[0];

    const placeStats = await getQuery(`
        SELECT COUNT(*) as total, SUM(CASE WHEN featureVector IS NULL THEN 1 ELSE 0 END) as nullCount FROM places
    `);
    const { total: totalPlaces, nullCount: nullPlaces } = placeStats[0];

    const allUsersNull = totalUsers === nullUsers;
    const allPlacesNull = totalPlaces === nullPlaces;

    if (allUsersNull && allPlacesNull) {
        await trainFully(K);
    }

    // користувач має приховані особливості? навчання 1 користувача
    const userRows = await getQuery(
        'SELECT featureVector, cityID FROM users WHERE userID = ?', [userID]
    );

    if (userRows.length === 0) return res.status(404).send('User not found');

    const { featureVector, cityID } = userRows[0];

    const countRows = await getQuery(
        'SELECT COUNT(*) as cnt FROM feedbacks WHERE userID = ?', [userID]
    );
    const countRow = countRows[0];

    if (featureVector === null) {
        if (countRow.cnt < 5) {
            return res.status(200).json({ message: "Ваші рекомендації з’являться після оцінювання 5 пам'яток" });
        } else {
            await trainUser(userID, K); 
        }
    }
    // донавчання по регіону користувача
    await trainUserLocal(userID, K);

    // чи має місце Null, коли має >= 5 оцінок
    await checkAndTrainPlacesWithEnoughRatings(K);

    // демонстрація рекомендації
    const fvRow = await getQuery(
        'SELECT featureVector FROM users WHERE userID = ?', [userID]
    );
    const userVector = JSON.parse(fvRow[0].featureVector);

    const places = await getQuery(`
        SELECT placeID, name, description, featureVector
        FROM places
        WHERE cityID = ?
    `, [cityID]);

    const ratedPlaces = await getQuery(`
        SELECT placeID FROM feedbacks WHERE userID = ?
    `, [userID]);

    const ratedSet = new Set(ratedPlaces.map(r => r.placeID));

    const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);

    const predictedRatings = places
        .filter(p => p.featureVector && !ratedSet.has(p.placeID))
        .map(p => ({
            placeID: p.placeID,
            name: p.name,
            description: p.description,
            predictedRating: dotProduct(userVector, JSON.parse(p.featureVector))
        }))
        .sort((a, b) => b.predictedRating - a.predictedRating)
        .map(p => ({
            placeID: p.placeID,
            name: p.name,
            description: p.description,
            predictedRating: Number(p.predictedRating.toFixed(2))
        }));

    res.json(predictedRatings);
});

app.get('/places', (req, res) => {
    // db.query('SELECT placeID, name, description, address FROM places', (err, results) => {
    db.query('SELECT placeID, name, cityID, description FROM places', (err, results) => {

        if (err) {
            console.error('Error fetching places:', err);
            return res.status(500).send('Database error');
        }
        res.json(results);
    });
});

app.get('/user-feedbacks/:userID', (req, res) => {
    const userID = req.params.userID;

    const sql = `
        SELECT f.placeID, f.rating, p.name, p.description, p.address
        FROM feedbacks f
        JOIN places p ON f.placeID = p.placeID
        WHERE f.userID = ?
    `;

    db.query(sql, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching user feedbacks:', err);
            return res.status(500).send('Database error');
        }

        res.json(results);
    });
});
app.post('/feedbacks', (req, res) => {
    const { userID, placeID, rating } = req.body;

    const checkSql = 'SELECT * FROM feedbacks WHERE userID = ? AND placeID = ?';
    db.query(checkSql, [userID, placeID], (err, results) => {
        if (err) {
            console.error('Error checking feedback:', err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            //! Оновлення існуючої оцінки
            const updateSql = 'UPDATE feedbacks SET rating = ? WHERE userID = ? AND placeID = ?';
            db.query(updateSql, [rating, userID, placeID], (err) => {
                if (err) {
                    console.error('Error updating feedback:', err);
                    return res.status(500).send('Database error');
                }
                res.send({ message: 'Rating updated successfully' });
            });
        } else {
            //! Додавання нової оцінки
            const insertSql = 'INSERT INTO feedbacks (userID, placeID, rating) VALUES (?, ?, ?)';
            db.query(insertSql, [userID, placeID, rating], (err) => {
                if (err) {
                    console.error('Error inserting feedback:', err);
                    return res.status(500).send('Database error');
                }
                res.send({ message: 'Rating added successfully' });
            });
        }
    });
});

//Home.tsx
app.get('/user/:userID', (req, res) => {
    const userID = req.params.userID;

    const sql = `
        SELECT u.name, u.cityID, c.name AS cityName
        FROM users u
        JOIN cities c ON u.cityID = c.cityID
        WHERE u.userID = ?
    `;

    db.query(sql, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching user data:', err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            res.json(results[0]);
        } else {
            res.status(404).send('User not found');
        }
    });
});
app.get('/cities', (req, res) => {
    db.query('SELECT * FROM cities', (err, results) => {
      if (err) {
        console.error('Error fetching cities:', err);
        return res.status(500).send('Database error');
      }
      res.json(results);
    });
});
app.put('/user/:userID/city', (req, res) => {
    const userID = req.params.userID;
    const { cityID } = req.body;

    db.query(
        'UPDATE users SET cityID = ? WHERE userID = ?',
        [cityID, userID],
        (err, result) => {
        if (err) {
            console.error('Error updating city:', err);
            return res.status(500).send('Database error');
        }
        res.send({ message: 'City updated successfully' });
        }
    );
});
app.get('/top-places/:userID', (req, res) => {
    const userID = req.params.userID;
  
    const sql = `
      SELECT 
        p.placeID,
        p.name,
        p.description,
        ROUND(AVG(f.rating), 2) AS avgRating
      FROM feedbacks f
      JOIN places p ON f.placeID = p.placeID
      JOIN users u ON u.cityID = p.cityID
      WHERE u.userID = ?
      GROUP BY p.placeID
      ORDER BY avgRating DESC
      LIMIT 5
    `;
  
    db.query(sql, [userID], (err, results) => {
      if (err) {
        console.error('Error fetching top places:', err);
        return res.status(500).send('Database error');
      }
      res.json(results);
    });
});
app.get('/user-stats/:userID', (req, res) => {
    const userID = req.params.userID;
  
    const sql = `
      SELECT 
        COUNT(DISTINCT f.placeID) AS visitedCount,
        ROUND(AVG(f.rating), 2) AS avgRating,
        ROUND(
          COUNT(DISTINCT f.placeID) / (
            SELECT COUNT(*) FROM places WHERE cityID = u.cityID
          ) * 100,
          2
        ) AS visitedPercent
      FROM feedbacks f
      JOIN places p ON f.placeID = p.placeID
      JOIN users u ON u.userID = ?
      WHERE p.cityID = u.cityID AND f.userID = u.userID
    `;
  
    db.query(sql, [userID], (err, results) => {
      if (err) {
        console.error('Error fetching user stats:', err);
        return res.status(500).send('Database error');
      }
  
      res.json(results[0]);
    });
});
app.get('/favourites/:userID', (req, res) => {
    const userID = req.params.userID;
  
    const sql = `
        SELECT f.placeID, p.name, p.description
        FROM favourites f
        JOIN places p ON f.placeID = p.placeID
        JOIN users u ON f.userID = u.userID
        WHERE f.userID = ? AND p.cityID = u.cityID
        ORDER BY f.datetime DESC
        LIMIT 5
    `;
  
    db.query(sql, [userID], (err, results) => {
        if (err) {
            console.error('Error fetching favourites:', err);
            return res.status(500).send('Database error');
        }
    
        res.json(results);
    });
});
app.get('/new-places/:userID', (req, res) => {
    const userID = parseInt(req.params.userID);

    db.query('SELECT cityID FROM users WHERE userID = ?', [userID], (err, userResult) => {
    if (err || userResult.length === 0) {
      console.error('Error fetching user cityID:', err);
      return res.status(500).send('User not found');
    }
    const cityID = userResult[0].cityID;
    
        //!НАДАЛІ ЗМІНИТИ З 9 на!
        const sql = `
            SELECT p.placeID, p.name, p.description, COUNT(f.feedbackID) AS feedbackCount
            FROM places p
            LEFT JOIN feedbacks f ON p.placeID = f.placeID
            WHERE p.cityID = ?
            GROUP BY p.placeID
            HAVING feedbackCount < 9
            ORDER BY p.addedDate DESC
            LIMIT 5
        `;
    
        db.query(sql, [cityID], (err, results) => {
            if (err) {
                console.error('Error fetching new places:', err);
                return res.status(500).send('Database error');
            }
        
            res.json(results);
        });
    });
});

app.get('/place-tags', (req, res) => {
    const ids = req.query.ids?.split(',').map(Number);
    if (!ids || ids.length === 0) return res.json({});
    
    const sql = `
      SELECT pt.placeID, t.name AS tag
      FROM placetag pt
      JOIN tags t ON pt.tagID = t.tagID
      WHERE pt.placeID IN (?)
    `;
    db.query(sql, [ids], (err, results) => {
      if (err) return res.status(500).send('Database error');
      const tagMap = {};
      results.forEach(row => {
        if (!tagMap[row.placeID]) tagMap[row.placeID] = [];
        tagMap[row.placeID].push(row.tag);
      });
      res.json(tagMap);
    });
});
app.get('/tags', (req, res) => {
    const sql = 'SELECT * FROM tags';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching tags:', err);
            return res.status(500).send('Database error');
        }

        res.json(results);
    });
});

//Catalog.tsx
app.get('/places/by-city/:cityID', (req, res) => {
    const cityID = req.params.cityID;
    const placeSql = `
        SELECT placeID, name, description, imagePath
        FROM places
        WHERE cityID = ?
    `;

    db.query(placeSql, [cityID], (err, places) => {
        if (err) {
            console.error('Error fetching places:', err);
            return res.status(500).send('Database error');
        }

        const placeIDs = places.map(p => p.placeID);
        if (placeIDs.length === 0) return res.json([]);

        const tagSql = `
            SELECT pt.placeID, t.name AS tag
            FROM placetag pt
            JOIN tags t ON pt.tagID = t.tagID
            WHERE pt.placeID IN (?)
        `;

        db.query(tagSql, [placeIDs], (err, tagResults) => {
        if (err) {
            console.error('Error fetching tags:', err);
            return res.status(500).send('Database error');
        }

        const tagMap = {};
        tagResults.forEach(({ placeID, tag }) => {
            if (!tagMap[placeID]) tagMap[placeID] = [];
            tagMap[placeID].push(tag);
        });

        const enrichedPlaces = places.map(place => ({
            ...place,
            tags: tagMap[place.placeID] || []
        }));

        res.json(enrichedPlaces);
        });
    });
});

//PlaceDetails.tsx
app.get('/place/:placeID', (req, res) => {
    const placeID = req.params.placeID;
    const sql = 'SELECT * FROM places WHERE placeID = ?';
    db.query(sql, [placeID], (err, results) => {
      if (err) return res.status(500).send('Database error');
      if (results.length === 0) return res.status(404).send('Place not found');
      res.json(results[0]);
    });
});
app.get('/feedbacks/comments/:placeID', (req, res) => {
    const placeID = req.params.placeID;

    const sql = `
        SELECT f.comment, f.reviewDate, u.name AS userName
        FROM feedbacks f
        JOIN users u ON f.userID = u.userID
        WHERE f.placeID = ? AND f.comment IS NOT NULL AND f.comment != ''
        ORDER BY f.reviewDate DESC
    `;

    db.query(sql, [placeID], (err, results) => {
        if (err) {
            console.error('Error fetching comments:', err);
            return res.status(500).send('Database error');
        }
        res.json(results);
    });
});
app.get('/similar-places/:placeID', (req, res) => {
    const placeID = parseInt(req.params.placeID);
    const queryCityAndTags = `
        SELECT p.cityID, pt.tagID
        FROM places p
        JOIN placetag pt ON p.placeID = pt.placeID
        WHERE p.placeID = ?
    `;

    db.query(queryCityAndTags, [placeID], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length === 0) return res.json([]);

        const cityID = results[0].cityID;
        const tagIDs = results.map(r => r.tagID);

        const querySimilarPlaces = `
            SELECT DISTINCT p.placeID, p.name, p.description, p.imagePath
            FROM places p
            JOIN placetag pt ON p.placeID = pt.placeID
            WHERE p.cityID = ? AND pt.tagID IN (?) AND p.placeID != ?
            LIMIT 10
        `;

        db.query(querySimilarPlaces, [cityID, tagIDs, placeID], (err2, similarResults) => {
            if (err2) return res.status(500).send('Database error');
            res.json(similarResults);
        });
    });
});

// додати до вподобань
app.post('/favourites', (req, res) => {
    const { userID, placeID } = req.body;
    const sql = `INSERT INTO favourites (userID, placeID, datetime) VALUES (?, ?, NOW())`;
    db.query(sql, [userID, placeID], (err) => {
        if (err) return res.status(500).send('Error adding to favourites');
        res.send({ message: 'Added to favourites' });
    });
});

// видалити з вподобань
app.delete('/favourites/:userID/:placeID', (req, res) => {
    const { userID, placeID } = req.params;
    const sql = `DELETE FROM favourites WHERE userID = ? AND placeID = ?`;
    db.query(sql, [userID, placeID], (err) => {
        if (err) return res.status(500).send('Error removing from favourites');
        res.send({ message: 'Removed from favourites' });
    });
});
app.post('/rate', (req, res) => {
    const { userID, placeID, rating } = req.body;

    if (!userID || !placeID || !rating) {
        return res.status(400).send('Missing parameters');
    }

    const checkQuery = 'SELECT * FROM feedbacks WHERE userID = ? AND placeID = ?';
    db.query(checkQuery, [userID, placeID], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length > 0) {
            // Оновлення оцінки
            const updateQuery = 'UPDATE feedbacks SET rating = ? WHERE userID = ? AND placeID = ?';
            db.query(updateQuery, [rating, userID, placeID], (err2) => {
                if (err2) return res.status(500).send('Database error');
                res.send({ message: 'Rating updated' });
            });
        } else {
            // Додання оцінки
            const insertQuery = 'INSERT INTO feedbacks (userID, placeID, rating, reviewDate) VALUES (?, ?, ?, NOW())';
            db.query(insertQuery, [userID, placeID, rating], (err3) => {
                if (err3) return res.status(500).send('Database error');
                res.send({ message: 'Rating added' });
            });
        }
    });
});

//показ оцінки
app.get('/rating', (req, res) => {
    const { userID, placeID } = req.query;

    const sql = 'SELECT rating FROM feedbacks WHERE userID = ? AND placeID = ? LIMIT 1';
    db.query(sql, [userID, placeID], (err, results) => {
        if (err) return res.status(500).send('Database error');
        if (results.length > 0) {
            res.json({ rating: results[0].rating });
        } else {
            res.json({ rating: 0 });
        }
    });
});
app.post('/comment', (req, res) => {
    const { userID, placeID, comment } = req.body;
    const reviewDate = new Date().toISOString().split('T')[0]; // тільки дата

    const checkSql = 'SELECT * FROM feedbacks WHERE userID = ? AND placeID = ?';
    db.query(checkSql, [userID, placeID], (err, results) => {
        if (err) return res.status(500).send('Database error');

        if (results.length > 0) {
            // оновити існуючий коментар у користувача
            const updateSql = 'UPDATE feedbacks SET comment = ?, reviewDate = ? WHERE userID = ? AND placeID = ?';
            db.query(updateSql, [comment, reviewDate, userID, placeID], (err2) => {
                if (err2) return res.status(500).send('Database error');
                res.send({ message: 'Коментар оновлено' });
            });
        } else {
            // вставити новий запис для користувача
            const insertSql = 'INSERT INTO feedbacks (userID, placeID, rating, comment, reviewDate) VALUES (?, ?, 0, ?, ?)';
            db.query(insertSql, [userID, placeID, comment, reviewDate], (err3) => {
                if (err3) return res.status(500).send('Database error');
                res.send({ message: 'Коментар додано' });
            });
        }
    });
});
app.get('/comments/:placeID', (req, res) => {
    const { placeID } = req.params;

    const sql = `
        SELECT f.comment, f.reviewDate, u.name AS userName
        FROM feedbacks f
        JOIN users u ON f.userID = u.userID
        WHERE f.placeID = ? AND f.comment IS NOT NULL
        ORDER BY f.reviewDate DESC
    `;

    db.query(sql, [placeID], (err, results) => {
        if (err) return res.status(500).send('Database error');
        res.json(results);
    });
});
// Favourites.tsx
app.get('/all-favourites/:userID', (req, res) => {
  const userID = req.params.userID;
  const cityID = req.query.cityID;

  const sql = `
    SELECT p.placeID, p.name, p.description, p.imagePath
    FROM favourites f
    JOIN places p ON f.placeID = p.placeID
    WHERE f.userID = ? ${cityID ? 'AND p.cityID = ?' : ''}
    ORDER BY f.datetime DESC
  `;
  const params = cityID ? [userID, cityID] : [userID];

  db.query(sql, params, (err, places) => {
    if (err) return res.status(500).send('Database error');

    const placeIDs = places.map(p => p.placeID);
    if (placeIDs.length === 0) return res.json([]);

    const tagSql = `
      SELECT pt.placeID, t.name AS tag
      FROM placetag pt
      JOIN tags t ON pt.tagID = t.tagID
      WHERE pt.placeID IN (?)
    `;

    db.query(tagSql, [placeIDs], (err2, tagResults) => {
      if (err2) return res.status(500).send('Database error');

      const tagMap = {};
      tagResults.forEach(({ placeID, tag }) => {
        if (!tagMap[placeID]) tagMap[placeID] = [];
        tagMap[placeID].push(tag);
      });

      const enrichedPlaces = places.map(place => ({
        ...place,
        tags: tagMap[place.placeID] || []
      }));

      res.json(enrichedPlaces);
    });
  });
});
//Для рандому
app.get('/random-place/:userID', (req, res) => {
  const userID = req.params.userID;

  const citySql = 'SELECT cityID FROM users WHERE userID = ?';

  db.query(citySql, [userID], (err, cityResult) => {
    if (err || cityResult.length === 0) {
      console.error('Error fetching cityID:', err);
      return res.status(500).send('User or city not found');
    }

    const cityID = cityResult[0].cityID;

    const randomPlaceSql = `
      SELECT placeID, name, description
      FROM places
      WHERE cityID = ?
      ORDER BY RAND()
      LIMIT 1
    `;

    db.query(randomPlaceSql, [cityID], (err2, placeResult) => {
      if (err2 || placeResult.length === 0) {
        console.error('Error fetching random place:', err2);
        return res.status(500).send('No place found in city');
      }

      res.json(placeResult[0]);
    });
  });
});
