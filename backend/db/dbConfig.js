import express from "express";
import mysql from "mysql2";
import cors from "cors";

const app = express();
//receive json and prevent cors
app.use(express.json());
app.use(cors());
//connect to database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ne",
});
db.connect((err)=>{
  if(err){
    console.log(err);
  }
  console.log("connected to database");
})
app.use(express.json());
//port to listen
app.listen(3000, () => {
  console.log("listening on port 3000");
});
