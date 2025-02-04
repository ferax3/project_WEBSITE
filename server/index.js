//our dependecies

const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')

app.use(express.json())
app.use(cors())

// Let us run the server



// let us create our database(mysql)

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    // database: 'plantdb',
    database: 'advicedb',

})

// Matrix Factorization Function
function matrixFactorization(R, P, Q, K, steps = 10000, alpha = 0.005, beta = 0.01) {
    const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);
    const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));

    Q = transpose(Q);
    let e = 0;

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

        if (e < 0.001) {
            break;
        }
    }

    // return { P, Q: transpose(Q) };
    return { P, Q: transpose(Q), e };

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
//         const K = 10; // Number of latent features
//         // // Ініціалізація P та Q
//         // const P = Array.from({ length: R.length }, () => 
//         //     Array.from({ length: K }, () => Math.random() * 0.1)
//         // );
//         // const Q = Array.from({ length: R[0].length }, () => 
//         //     Array.from({ length: K }, () => Math.random() * 0.1)
//         // );

//         // Функція для створення випадкової матриці
//         const randomMatrix = (rows, cols) => 
//             Array.from({ length: rows }, () => 
//                 Array.from({ length: cols }, () => Math.random())
//             );

//         // Ініціалізація матриць P та Q
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

//         // Виправлений розрахунок повної матриці передбачення
//         const resultMatrix = finalP.map(rowP => finalQ.map(colQ => dotProduct(rowP, colQ))
//         );

//         // Округлення всіх значень у матриці до трьох знаків після коми
//         const roundedMatrix = resultMatrix.map(row =>
//             row.map(value => Number(value.toFixed(2)))
//         );

//         console.log('Predicted rating matrix:');
//         // Виведення матриці у консоль
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

//let us now create a route to the server that will register a user
app.post('/register', (req, res)=>{
    // we need to get variables sent from the form
    const sentEmail = req.body.Email
    const sentName = req.body.Name
    const sentPassword = req.body.Password

    //Lets create SQL statement to insert the user to the Database table Users
    const SQL = 'INSERT INTO users (email, name, password) VALUES (?,?,?)'
    const Values = [sentEmail, sentName, sentPassword]

    //Query to execute the sql statement stated above
    db.query(SQL, Values, (err, results)=>{
        if(err){
            res.send(err)
        }
        else{
            console.log("User inserted successfully!")
            res.send({message: 'User added!'})
            //Let try and see
            //user has not been submitted, we need to use Express and cors
            //SUCCESSFULL
        }
    })
})

// Now we need to Login with these crefentials from a registered User
//Lets create another route
app.post('/login', (req, res)=>{
    // we need to get variables sent from the form
    const sentLoginName = req.body.LoginName
    const sentLoginPassword = req.body.LoginPassword

    //Lets create SQL statement to insert the user to the Database table Users
    // const SQL = 'SELECT * FROM users WHERE username = ?  && password = ?'
    const SQL = 'SELECT * FROM users WHERE name = ?  && password = ?'

    const Values = [sentLoginName, sentLoginPassword]

    //Query to execute the sql statement stated above
    db.query(SQL, Values, (err, results)=>{
        if(err){
            console.error("Database error:", err);
            return res.status(500).send({ error: 'Database error' });
            // res.send({error: err})
        }
        if(results.length > 0){

            console.log(results[0]);  // Додаємо лог для перевірки результату з бази
            // res.send(results)
            // res.send({ message: 'Login successful', user: results[0].username });
            res.send({
                message: 'Login successful',
                user: results[0].name,
                userID: results[0].userID  // Припускаємо, що в таблиці є поле `id`
            });
        }
        else{
            res.send({message: `Credentials Don't Match!`})
            // This should be good, lets try to login
        }
    })
})

app.get('/recommendations/:userID', (req, res) => {
    const userID = parseInt(req.params.userID);

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
        // const { P: finalP, Q: finalQ, e: finalE } = matrixFactorization(R, P, Q, K);
        const { P: finalP, Q: finalQ } = matrixFactorization(R, P, Q, K);


        const userIndex = userID - 1; // Індекс у матриці P
        const userVector = finalP[userIndex];

        const dotProduct = (a, b) => a.reduce((sum, val, idx) => sum + val * b[idx], 0);


        // Фільтрація місць, які користувач ще не оцінив (де в R значення 0)
         const predictedRatings = finalQ
         .map((placeVector, index) => ({
             placeID: index + 1,
             rating: dotProduct(userVector, placeVector),
             visited: R[userIndex][index] > 0 // Перевірка, чи місце було відвідане
         }))
         .filter(item => !item.visited) // Залишаємо лише невідвідані місця
         .sort((a, b) => b.rating - a.rating); // Сортування за спаданням рейтингу
        //! СТАРА ВЕРСІЯ
        // const predictedRatings = finalQ.map((placeVector, index) => ({
        //     placeID: index + 1,
        //     rating: dotProduct(userVector, placeVector)
        // }));
        // predictedRatings.sort((a, b) => b.rating - a.rating); // Сортування за спаданням рейтингу

        const placeIDsToFetch = predictedRatings.map(item => item.placeID);

        //! ДЛЯ ПЕРЕВІРКИ (ПРОГНОЗУВАННЯ МАТРИЦЬ)
        // // Виправлений розрахунок повної матриці передбачення
        // const resultMatrix = finalP.map(rowP => finalQ.map(colQ => dotProduct(rowP, colQ))
        // );
        // // Округлення всіх значень у матриці до трьох знаків після коми
        // const roundedMatrix = resultMatrix.map(row =>
        //     row.map(value => Number(value.toFixed(2)))
        // );
        // console.log('Predicted rating matrix:');
        // // Виведення матриці у консоль
        // console.table(roundedMatrix);
        // console.table(resultMatrix);
        //! ДЛЯ ПЕРЕВІРКИ (МАТРИЦЬ P та Q)
        // console.log('Factorized Matrices:');
        // console.log('P:', finalP);
        // console.log('Q:', finalQ);
        // console.log("Error", finalE);

        // Отримуємо назви місць
        db.query(
            'SELECT placeID, name FROM places WHERE placeID IN (?)',
            [placeIDsToFetch],
            (err, places) => {
                if (err) {
                    console.error('Error fetching places:', err);
                    return res.status(500).send('Database error');
                }

                const recommendations = predictedRatings.map(item => {
                    const place = places.find(p => p.placeID === item.placeID);
                    return {
                        placeID: item.placeID,
                        name: place ? place.name : 'Unknown Place',
                        predictedRating: Number(item.rating.toFixed(2))
                    };
                });

                res.json(recommendations);
            }
        );
    });
});
