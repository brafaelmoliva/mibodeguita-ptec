const express = require('express');
const router = express.Router();
const authUser = require('../middlewares/authUser');
const { getDeudas, pagarDeuda } = require('../controllers/deudasController');

router.get('/', authUser, getDeudas);
router.put('/:id/pagar', authUser, pagarDeuda);

module.exports = router;
