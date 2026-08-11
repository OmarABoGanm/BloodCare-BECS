const router=require('express').Router(); const c=require('../controllers/inventoryController'); const v=require('./validators'); const validate=require('../middleware/validate');
router.get('/',c.list); router.get('/:bloodType',v.bloodParam,validate,c.get); module.exports=router;
