import express from "express";
import mysql from "mysql2";
import cors from "cors";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import {auth} from './middlewares/Auth.js'
import {specs} from "./swaggerConfig.js";
import swaggerUi from "swagger-ui-express";


const app = express();

//receive json and prevent cors
app.use(express.json());
app.use(cors());

//connect to database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "bookManagement",
});

//checking connection 
db.connect((error)=>{
  if(error) console.log(error);
  console.log("connected to database");
})
//port to listen
app.listen(3000, () => {
  console.log("listening on port 3000");
});

// Swagger endpoint
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
// Register student endpoint - Example
/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new student
 *     tags: [Students]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               firstname:
 *                 type: string
 *               lastname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               id: 1
 *               firstname: John
 *               lastname: Doe
 *               email: john.doe@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Registration successful
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: All fields are required
 *       500:
 *         description: Internal server error
 */

//==================================== Register student ================================
app.post("/register", async (req, res) => {
  const { id, firstname, lastname, email, password } = req.body;
  //check if all field are not empty
  if (!id|| !firstname|| !lastname|| !email, !password) 
    return res.status(403).json({ error: "All field are required" });

  //Hash the password
  const salt = await bcrypt.genSalt();
  const hashPassword = await bcrypt.hash(password, salt);

  //user data
  const datas = [id, firstname,lastname, email,hashPassword];
  //save the user
  const q = "INSERT INTO students(`id`, `firstname`, `lastname`, `email`, `password`) VALUES (?,?,?,?,?)";

  db.query(q, datas, (error, data) => {
    if (error) return res.status(403).json({ error: "Internal server error" });
    res.status(200).json(data);
  });

});

//==================================== Login Student ================================
/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login to the application
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: john.doe@example.com
 *               password: password123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: integer
 *                     firstname:
 *                       type: string
 *                     lastname:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Invalid request body
 *       403:
 *         description: User not found or incorrect credentials
 *       500:
 *         description: Internal server error
 */
app.post("/login",async (req, res) => {

  const { email, password } = req.body;
  //check if all field are not empty
  if (!email || !password)
    return res.status(400).json({ error: "All field are required" });

  //Check if the user email is valid
  const user = `SELECT * FROM students WHERE email = ?`;

  //check user is available
  if (!user) return res.status(400).json({ error: "user is not found." });
  db.query(user, [email, password], async (error, data) => {
    if (error) return res.status(500).json({ error: " Internal server error" });

    //Check if there is user returned
    if (data.length === 0)
      return res.status(403).json({ error: "User not found" });
    const result = data[0];

    // check password matching
    const match = await bcrypt.compare(password, result.password);
    if (!match) return res.status(400).json({ error: "Incorrect credentials." });
    if (error) return res.status(500).json({ error: "Internal Server Error" });
    
    //Generate token & Return successful login 
    const token = jwt.sign({id: result.userId},"kdfjkakhhfuweg");
    console.log("information",data);
    res.status(200).json({data, token});
  });
});




//==================================== Display Books ================================
/**
 * @swagger
 * /books:
 *   get:
 *     summary: Get all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       author:
 *                         type: string
 *                       publisher:
 *                         type: string
 *                       publicationYear:
 *                         type: integer
 *                       subject:
 *                         type: string
 *       403:
 *         description: No books available
 *       500:
 *         description: Internal server error
 */
app.get("/books",(req, res) => {
  const books = `SELECT * FROM books`;

  db.query(books, (error, data) => {
    if (error) return res.status(500).json({ error: "internal error" });
    //check if there is available books
    if (data.length === 0)
      return res.status(403).json({ error: "No user available" });
    //send books
    res.status(200).json({ data });
  });
});

//==================================== Register books ================================

app.post("/book/create", auth ,(req, res) => {
 
  const {
    id,
    name,
    author,
    publisher,
    publicationYear,
    subject,
  } = req.body;
  //check if all field are not empty
  if (
    !id || !name || !publisher || !publicationYear
  )
    return res.status(404).json({ error: "All fields are required" });

  //store data into array
  const data = [
    id,
    name,
    author,
    publisher,
    publicationYear,
    subject,
  ];
  //save the employees
  const q =
    "INSERT INTO employees(`id`, `name`, `author`,`publisher`,`publicarionYear`,`subject`) VALUES (?,?,?,?,?,?)";

  //executing the command

  db.query(q, data, (error, result) => {
    if (error) return res.status(500).json({ error: error });
    res.status(200).json(result);
  });
});
