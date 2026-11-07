const router = require('express').Router();
const { z } = require('zod');
const { db, FieldValue } = require('../config/firebase');
const { HttpError, asyncHandler } = require('../utils/erros');
const { carregarEstabelecimento } = require('../middleware/auth');

const schema = z.object({
  nome: z.string().min(2),
  tipo: z.enum(['mercadinho', 'padaria', 'restaurante', 'outro']).default('outro'),
  cnpj: z.string().optional(),
});


router.post('/', asyncHandler(async (req, res) => {
  const dados = schema.parse(req.body);
  const usuarioRef = db.collection('usuarios').doc(req.uid);
  const usuario = await usuarioRef.get();
  if (usuario.exists && usuario.data().estabelecimentoId) {
    throw new HttpError(409, 'Este usuário já possui um estabelecimento.');
  }
  const estRef = db.collection('estabelecimentos').doc();
  const batch = db.batch();
  batch.set(estRef, { ...dados, donoUid: req.uid, plano: 'gratis', criadoEm: FieldValue.serverTimestamp() });
  batch.set(usuarioRef, { email: req.email, estabelecimentoId: estRef.id }, { merge: true });
  await batch.commit();
  res.status(201).json({ id: estRef.id, ...dados, plano: 'gratis' });
}));

router.get('/meu', carregarEstabelecimento, asyncHandler(async (req, res) => {
  const snap = await req.estRef.get();
  res.json({ id: snap.id, ...snap.data() });
}));

router.put('/meu', carregarEstabelecimento, asyncHandler(async (req, res) => {
  const dados = schema.partial().parse(req.body);
  await req.estRef.update(dados);
  res.json({ id: req.estabelecimentoId, ...dados });
}));

module.exports = router;
