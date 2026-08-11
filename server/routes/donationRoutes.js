const router=require('express').Router(); const c=require('../controllers/donationController'); const v=require('./validators'); const validate=require('../middleware/validate');
router.route('/').get(c.list).post(v.donation,validate,c.create); module.exports=router;
