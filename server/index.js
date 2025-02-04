//our dependecies

const express = require('express')
const app = express()
const mysql = require('mysql')
const cors = require('cors')

app.use(express.json())
app.use(cors())

// Let us run the server

app.listen(3002, ()=>{
    console.log("Server is running on port 3002")
})

// let us create our database(mysql)

const db = mysql.createConnection({
    user: 'root',
    host: 'localhost',
    password: '',
    // database: 'plantdb',
    database: 'advicedb',

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