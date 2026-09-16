const router=require('express').Router();const c=require('../controllers/auditController');const v=require('./validators');const validate=require('../middleware/validate');
router.get('/',v.auditQuery,validate,c.list);router.get('/:id',v.mongoId,validate,c.get);module.exports=router;
