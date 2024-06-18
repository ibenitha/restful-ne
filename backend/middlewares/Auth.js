import jwt from 'jsonwebtoken'

export  const auth = async (req, res, next) => {
    //Check if the header contains the authorization

    const {authorization } = req.headers;
    if(!authorization) res.status(403).json({error:"not authorized"});
    const token = authorization.split(" ")[1];
    
    try {
        //decode the token
        const id = jwt.verify(token,"kdfjkakhhfuweg")
        
        //Check if the user exists
        const user = db.query("SELECT * FROM users WHERE userId=?",id,(err, result) =>{
            if(err) return res.status(500).json({error:"internal server error"});
            if(result.length === 0) return res.status(403).json({error:"not authorized"});
            req.user = result;
            next();
        })
    } catch (error) {
        
    }
}