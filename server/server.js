require('dotenv').config(); const app=require('./app'); const connectDatabase=require('./config/database');
const port=process.env.PORT||5000; connectDatabase().then(()=>app.listen(port,()=>console.log(`BloodCare API listening on http://localhost:${port}`))).catch((error)=>{console.error(`Database connection failed: ${error.message}`);process.exit(1);});
