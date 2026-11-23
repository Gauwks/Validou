const router = require('express').Router();
const { asyncHandler } = require('../utils/erros');

router.get('/', asyncHandler(async (req, res) => {
  let q = req.estRef.collection('baixas');
  if (req.query.mes) q = q.where('mes', '==', req.query.mes);
  const snap = await q.get();
  let baixas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (req.query.tipo) baixas = baixas.filter((b) => b.tipo === req.query.tipo);
  baixas.sort((a, b) => (a.data < b.data ? 1 : -1));
  res.json(baixas);
}));

module.exports = router;
