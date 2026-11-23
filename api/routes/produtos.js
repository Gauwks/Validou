const router = require('express').Router();
const { z } = require('zod');
const { FieldValue } = require('../config/firebase');
const { HttpError, asyncHandler } = require('../utils/erros');

const schema = z.object({
  nome: z.string().min(1),
  codigoBarras: z.string().min(1).optional(), 
  categoria: z.string().optional(),
  custo: z.number().nonnegative().default(0),
  precoVenda: z.number().nonnegative().default(0),
});

const col = (req) => req.estRef.collection('produtos');

router.get('/', asyncHandler(async (req, res) => {
  const snap = await col(req).orderBy('nome').get();
  res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
}));


router.get('/codigo/:codigoBarras', asyncHandler(async (req, res) => {
  const snap = await col(req).where('codigoBarras', '==', req.params.codigoBarras).limit(1).get();
  if (snap.empty) throw new HttpError(404, 'Produto não cadastrado para este código de barras.');
  const d = snap.docs[0];
  res.json({ id: d.id, ...d.data() });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const snap = await col(req).doc(req.params.id).get();
  if (!snap.exists) throw new HttpError(404, 'Produto não encontrado.');
  res.json({ id: snap.id, ...snap.data() });
}));

router.post('/', asyncHandler(async (req, res) => {
  const dados = schema.parse(req.body);
  if (dados.codigoBarras) {
    const dup = await col(req).where('codigoBarras', '==', dados.codigoBarras).limit(1).get();
    if (!dup.empty) throw new HttpError(409, 'Já existe produto com este código de barras.');
  }
  const ref = await col(req).add({ ...dados, criadoEm: FieldValue.serverTimestamp() });
  res.status(201).json({ id: ref.id, ...dados });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const dados = schema.partial().parse(req.body);
  const ref = col(req).doc(req.params.id);
  if (!(await ref.get()).exists) throw new HttpError(404, 'Produto não encontrado.');
  await ref.update(dados);
  res.json({ id: ref.id, ...dados });
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  const lotes = await req.estRef.collection('lotes').where('produtoId', '==', req.params.id).limit(1).get();
  if (!lotes.empty) throw new HttpError(409, 'Produto possui lotes; não pode ser excluído.');
  await col(req).doc(req.params.id).delete();
  res.status(204).end();
}));

module.exports = router;
