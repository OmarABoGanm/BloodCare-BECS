const router=require('express').Router(); const c=require('../controllers/compatibilityController'); const v=require('./validators'); const validate=require('../middleware/validate');
router.get('/recipient/:bloodType',v.bloodParam,validate,c.forRecipient); router.get('/donor/:bloodType',v.bloodParam,validate,c.forDonor); module.exports=router;
