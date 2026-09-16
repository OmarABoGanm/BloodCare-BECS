const express=require('express');const helmet=require('helmet');const cors=require('cors');const mongoose=require('mongoose');const {notFound,errorHandler}=require('./middleware/errorHandler');const {requireAuth,requireRole,requireSameSite}=require('./middleware/auth');const {ROLES,OPERATORS}=require('./config/roles');
const app=express();app.use(helmet());app.use(cors({origin:process.env.CLIENT_URL||'http://localhost:5174',credentials:true,allowedHeaders:['Content-Type','X-BloodCare-Request'],exposedHeaders:['Content-Disposition']}));app.use(express.json({limit:'50kb'}));app.use(requireSameSite);
app.get('/api/health',(req,res)=>res.json({success:true,data:{application:'ok',database:mongoose.connection.readyState===1?'connected':'disconnected'}}));
app.use('/api/auth',require('./routes/authRoutes'));
app.use('/api/compatibility',requireAuth,requireRole(...ROLES),require('./routes/compatibilityRoutes'));
app.use('/api/inventory',requireAuth,requireRole(...ROLES),require('./routes/inventoryRoutes'));
for(const [path,route]of [['donations','donationRoutes'],['requests','requestRoutes'],['emergency','emergencyRoutes']])app.use('/api/'+path,requireAuth,requireRole(...OPERATORS),require('./routes/'+route));
app.use('/api/audit',requireAuth,requireRole('ADMIN'),require('./routes/auditRoutes'));app.use('/api/exports',requireAuth,requireRole('ADMIN'),require('./routes/exportRoutes'));app.use('/api/admin',requireAuth,requireRole('ADMIN'),require('./routes/adminRoutes'));app.use('/api/research',requireAuth,requireRole(...ROLES),require('./routes/researchRoutes'));
app.use(notFound);app.use(errorHandler);module.exports=app;
