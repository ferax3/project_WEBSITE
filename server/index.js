const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')

app.use(express.json())
app.use(cors())

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    database: 'advicedb',

})

function matrixFactorization(R, P, Q, K, steps = 15000, alpha = 0.005, beta = 0.01) {
    const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));

    Q = transpose(Q);
    let e = 0;
    // !ДЛЯ ТЕСТУВАННЯ
    const errorsPerEpoch = []; 

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
            errorsPerEpoch.push({ epoch: step, error: e });
        }

        if (e < 0.001) {
            break;
        }
    }
    errorsPerEpoch.push({ epoch: steps, error: e });


    // return { P, Q: transpose(Q) };
    // return { P, Q: transpose(Q), e };
    return { P, Q: transpose(Q), e, errorsPerEpoch };

}

// Function to create rating matrix
function createRatingMatrix(feedbacks, userCount, placeCount) {
    const R = Array.from({ length: userCount }, () => Array(placeCount).fill(0));
    feedbacks.forEach(({ userID, placeID, rating }) => {
        R[userID - 1][placeID - 1] = rating;
    });
    return R;
}

//! ПЕРШЕ ТЕСТУВАННЯ-ПЕРЕВІРКА НА СУМІСНІСТЬ
// function runMatrixFactorization() {
//     db.query('SELECT userID, placeID, rating FROM feedbacks', (err, results) => {
//         if (err) {
//             console.error('Error fetching feedbacks:', err);
//             return;
//         }
//         const userIDs = [...new Set(results.map(item => item.userID))];
//         const placeIDs = [...new Set(results.map(item => item.placeID))];
//         const R = createRatingMatrix(results, userIDs.length, placeIDs.length);
//         const K = 10; 
//         // // Ініціалізація P та Q
//         // const P = Array.from({ length: R.length }, () => 
//         //     Array.from({ length: K }, () => Math.random() * 0.1)
//         // );
//         // const Q = Array.from({ length: R[0].length }, () => 
//         //     Array.from({ length: K }, () => Math.random() * 0.1)
//         // );

//         const randomMatrix = (rows, cols) => 
//             Array.from({ length: rows }, () => 
//                 Array.from({ length: cols }, () => Math.random())
//             );

//         const P = randomMatrix(R.length, K);
//         const Q = randomMatrix(R[0].length, K);

//         // console.log('Initial P:', P);
//         // console.log('Initial Q:', Q);

//         // const P = Array.from({ length: R.length }, () => Array(K).fill(Math.random()));
//         // const Q = Array.from({ length: R[0].length }, () => Array(K).fill(Math.random()));

//         // const { P: finalP, Q: finalQ } = matrixFactorization(R, P, Q, K);
//         const { P: finalP, Q: finalQ, e: finalE  } = matrixFactorization(R, P, Q, K);

//         console.log('Original Rating Matrix:');
//         console.table(R);

//         const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);

//         const resultMatrix = finalP.map(rowP => finalQ.map(colQ => dotProduct(rowP, colQ))
//         );

//         const roundedMatrix = resultMatrix.map(row =>
//             row.map(value => Number(value.toFixed(2)))
//         );

//         console.log('Predicted rating matrix:');
//         console.table(roundedMatrix);
//         // console.table(resultMatrix);
//         // console.log('Factorized Matrices:');
//         // console.log('P:', finalP);
//         // console.log('Q:', finalQ);
//         console.log("Error", finalE);
//     });
// }

app.listen(3002, ()=>{
    console.log("Server is running on port 3002");
    // runMatrixFactorization();
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

app.get('/recommendations/:userID', (req, res) => {
    const userID = parseInt(req.params.userID);
    // 1. Спочатку дізнаємось місто користувача
    db.query('SELECT cityID FROM users WHERE userID = ?', [userID], (err, cityResult) => {
        if (err || cityResult.length === 0) {
          console.error('Error fetching cityID:', err);
          return res.status(500).send('User or city not found');
        }
    
        const cityID = cityResult[0].cityID;
        // 2. Отримуємо всі відгуки
        db.query('SELECT userID, placeID, rating FROM feedbacks', (err, results) => {
            if (err) {
                console.error('Error fetching feedbacks:', err);
                return res.status(500).send('Database error');
            }

            const userIDs = [...new Set(results.map(item => item.userID))];
            const placeIDs = [...new Set(results.map(item => item.placeID))];

            const R = createRatingMatrix(results, userIDs.length, placeIDs.length);
            const K = 10;

            //!ПЕРЕВІРКА(ОРИГІНАЛЬНОЇ МАТРИЦІ)
            console.log('Original Rating Matrix:');
            console.table(R);

            const randomMatrix = (rows, cols) =>
                Array.from({ length: rows }, () =>
                    Array.from({ length: cols }, () => Math.random())
                );

            const P = randomMatrix(R.length, K);
            const Q = randomMatrix(R[0].length, K);

            //! ДЛЯ ПЕРЕВІРКИ (ПАРАМЕТР Е В НАВЧАННЯ)
            const { P: finalP, Q: finalQ, e: finalE, errorsPerEpoch } = matrixFactorization(R, P, Q, K);
            // const { P: finalP, Q: finalQ } = matrixFactorization(R, P, Q, K);

            //! Зберігання в errors.csv
            const fs = require('fs');
            const csvData = errorsPerEpoch.map(({ epoch, error }) => `${epoch},${error}`).join('\n');
            fs.writeFileSync('errors.csv', `Epoch,Error\n${csvData}`);

            console.log('Error data saved to errors.csv');
            const userIndex = userID - 1;
            const userVector = finalP[userIndex];

            const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);

            const predictedRatings = finalQ
            .map((placeVector, index) => ({
                placeID: index + 1,
                rating: dotProduct(userVector, placeVector),
                visited: R[userIndex][index] > 0
            }))
            .filter(item => !item.visited)
            .sort((a, b) => b.rating - a.rating);

            const placeIDsToFetch = predictedRatings.map(item => item.placeID);

            //! ДЛЯ ПЕРЕВІРКИ (ПРОГНОЗУВАННЯ МАТРИЦЬ)
            const resultMatrix = finalP.map(rowP => finalQ.map(colQ => dotProduct(rowP, colQ))
            );
            const roundedMatrix = resultMatrix.map(row =>
                row.map(value => Number(value.toFixed(2)))
            ); 
                // !Виведення матриці
            console.log('Predicted rating matrix:');

            console.table(roundedMatrix);
            // console.table(resultMatrix);
            //! ДЛЯ ПЕРЕВІРКИ (МАТРИЦЬ P та Q)
            // console.log('Factorized Matrices:');
            // console.log('P:', finalP);
            // console.log('Q:', finalQ);
            console.log("Error", finalE);

            db.query(
                'SELECT placeID, name, description FROM places WHERE placeID IN (?) AND cityID = ?',
                [placeIDsToFetch, cityID],
                // 'SELECT placeID, name, description FROM places WHERE placeID IN (?)',
                // [placeIDsToFetch],
                (err, places) => {
                    if (err) {
                        console.error('Error fetching places:', err);
                        return res.status(500).send('Database error');
                    }

                    const recommendations = predictedRatings
                        .filter(item => places.some(p => p.placeID === item.placeID))
                        .map(item => {
                        const place = places.find(p => p.placeID === item.placeID);
                        return {
                            placeID: item.placeID,
                            name: place ? place.name : 'Невідоме місце',
                            description: place ? place.description : 'Опис недоступний',
                            predictedRating: Number(item.rating.toFixed(2))
                        };
                    });

                    res.json(recommendations);
                }
            );
        });
    });
});

app.get('/places', (req, res) => {
    db.query('SELECT placeID, name, description, address FROM places', (err, results) => {
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

    // 1. Дізнаємось місто користувача
    db.query('SELECT cityID FROM users WHERE userID = ?', [userID], (err, userResult) => {
    if (err || userResult.length === 0) {
      console.error('Error fetching user cityID:', err);
      return res.status(500).send('User not found');
    }
    const cityID = userResult[0].cityID;
    
        //!НАДАЛІ ЗМІНИТИ З 8 на МЕНШЕ ЧИСЛО!
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
    db.query('SELECT placeID, name, description, imagePath FROM places WHERE cityID = ?', [cityID], (err, results) => {
      if (err) {
        console.error('Error fetching places by city:', err);
        return res.status(500).send('Database error');
      }
      res.json(results);
    });
});
app.use('/images', express.static('public/images'));
// app.use('/images', express.static(path.join(__dirname, 'public', 'images')));