const router=require('express').Router();const c=require('../controllers/exportController');const v=require('./validators');const validate=require('../middleware/validate');
router.get('/becs-metadata',v.exportQuery,validate,c.metadata);router.get('/audit-trail',v.exportQuery,validate,c.audit);module.exports=router;
