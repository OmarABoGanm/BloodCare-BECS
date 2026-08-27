const router=require('express').Router(); const c=require('../controllers/emergencyController'); const v=require('./validators'); const validate=require('../middleware/validate');
router.get('/',c.list); router.post('/simulate',v.emergency,validate,c.simulate); router.post('/confirm',v.emergencyConfirm,validate,c.confirm); router.get('/:id',v.mongoId,validate,c.get); module.exports=router;
