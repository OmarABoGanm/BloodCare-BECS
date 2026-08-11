const router=require('express').Router(); const c=require('../controllers/requestController'); const v=require('./validators'); const validate=require('../middleware/validate');
router.route('/').get(c.list).post(v.request,validate,c.create); router.get('/:id',c.get); module.exports=router;
