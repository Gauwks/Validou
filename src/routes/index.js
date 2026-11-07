const router = require('express').Router();
const { autenticar, carregarEstabelecimento } = require('../middleware/auth');

router.get('/saude', (req, res) => res.json({ ok: true }));

router.use(autenticar);
router.use('/estabelecimentos', require('./estabelecimentos'));


router.use(carregarEstabelecimento);
router.use('/produtos', require('./produtos'));
router.use('/lotes', require('./lotes'));
router.use('/baixas', require('./baixas'));
router.use('/alertas', require('./alertas'));
router.use('/dashboard', require('./dashboard'));
router.use('/relatorios', require('./relatorios'));

module.exports = router;
