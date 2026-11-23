const router = require('express').Router();
const { db, FieldValue } = require('../config/firebase');
const { asyncHandler, HttpError } = require('../utils/erros');
const { hoje, diasAte } = require('../utils/datas');
const { faixaDeAlerta } = require('../services/promocao');


router.get('/', asyncHandler(async (req, res) => {
  const snap = await req.estRef.collection('alertas').get();
  let alertas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (req.query.lido !== undefined) alertas = alertas.filter((a) => a.lido === (req.query.lido === 'true'));
  alertas.sort((a, b) => a.diasRestantes - b.diasRestantes);
  res.json(alertas);
}));

router.post('/gerar', asyncHandler(async (req, res) => {
  const base = hoje();
  const snap = await req.estRef.collection('lotes').get();
  const batch = db.batch();
  let criados = 0;

  for (const doc of snap.docs) {
    const l = doc.data();
    if (!(l.quantidadeAtual > 0)) continue;
    const dias = diasAte(l.dataValidade, base);
    const faixa = faixaDeAlerta(dias);
    if (!faixa) continue;
    const ref = req.estRef.collection('alertas').doc(`${doc.id}_${faixa}`);
    const existente = await ref.get();
    if (existente.exists) {
      batch.update(ref, { diasRestantes: dias });
    } else {
      criados++;
      batch.set(ref, {
        loteId: doc.id,
        produtoId: l.produtoId,
        produtoNome: l.produtoNome,
        dataValidade: l.dataValidade,
        faixa,
        diasRestantes: dias,
        lido: false,
        criadoEm: FieldValue.serverTimestamp(),
      });
    }
  }
  await batch.commit();
  res.json({ criados });
}));

router.patch('/:id/lido', asyncHandler(async (req, res) => {
  const ref = req.estRef.collection('alertas').doc(req.params.id);
  if (!(await ref.get()).exists) throw new HttpError(404, 'Alerta não encontrado.');
  await ref.update({ lido: true });
  res.json({ id: ref.id, lido: true });
}));

module.exports = router;
