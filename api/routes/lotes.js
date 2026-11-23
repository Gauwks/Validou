const router = require('express').Router();
const { z } = require('zod');
const { db, FieldValue } = require('../config/firebase');
const { HttpError, asyncHandler } = require('../utils/erros');
const { diasAte, hoje } = require('../utils/datas');

const data = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use o formato YYYY-MM-DD');

const schema = z.object({
  produtoId: z.string().min(1),
  codigoLote: z.string().optional(),
  dataValidade: data,
  quantidade: z.number().positive(),
});

const col = (req) => req.estRef.collection('lotes');


router.post('/', asyncHandler(async (req, res) => {
  const dados = schema.parse(req.body);
  const produto = await req.estRef.collection('produtos').doc(dados.produtoId).get();
  if (!produto.exists) throw new HttpError(404, 'Produto não encontrado.');

  const { quantidade, ...resto } = dados;
  const lote = {
    ...resto,
    produtoNome: produto.data().nome, 
    quantidadeInicial: quantidade,
    quantidadeAtual: quantidade,
  };
  const ref = await col(req).add({ ...lote, criadoEm: FieldValue.serverTimestamp() });
  res.status(201).json({ id: ref.id, ...lote });
}));

router.get('/', asyncHandler(async (req, res) => {
  let q = col(req).orderBy('dataValidade');
  if (req.query.produtoId) q = col(req).where('produtoId', '==', req.query.produtoId);
  const snap = await q.get();
  let lotes = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (req.query.ativos === 'true') lotes = lotes.filter((l) => l.quantidadeAtual > 0);
  const base = hoje();
  res.json(lotes.map((l) => ({ ...l, diasRestantes: diasAte(l.dataValidade, base) })));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const snap = await col(req).doc(req.params.id).get();
  if (!snap.exists) throw new HttpError(404, 'Lote não encontrado.');
  const l = snap.data();
  res.json({ id: snap.id, ...l, diasRestantes: diasAte(l.dataValidade) });
}));

router.put('/:id', asyncHandler(async (req, res) => {
  const dados = schema.pick({ codigoLote: true, dataValidade: true }).partial().parse(req.body);
  const ref = col(req).doc(req.params.id);
  if (!(await ref.get()).exists) throw new HttpError(404, 'Lote não encontrado.');
  await ref.update(dados);
  res.json({ id: ref.id, ...dados });
}));


const baixaSchema = z.object({
  tipo: z.enum(['venda', 'descarte', 'promocao']),
  quantidade: z.number().positive(),
  precoUnitario: z.number().nonnegative().optional(), 
  motivo: z.string().optional(),
});

router.post('/:id/baixas', asyncHandler(async (req, res) => {
  const dados = baixaSchema.parse(req.body);
  const loteRef = col(req).doc(req.params.id);
  const baixaRef = req.estRef.collection('baixas').doc();

  const resultado = await db.runTransaction(async (t) => {
    const loteSnap = await t.get(loteRef);
    if (!loteSnap.exists) throw new HttpError(404, 'Lote não encontrado.');
    const lote = loteSnap.data();
    if (dados.quantidade > lote.quantidadeAtual) {
      throw new HttpError(409, `Quantidade maior que o estoque do lote (${lote.quantidadeAtual}).`);
    }
    const produtoSnap = await t.get(req.estRef.collection('produtos').doc(lote.produtoId));
    const produto = produtoSnap.exists ? produtoSnap.data() : {};

    const custoUnitario = produto.custo || 0;
    const baixa = {
      loteId: loteRef.id,
      produtoId: lote.produtoId,
      produtoNome: lote.produtoNome,
      tipo: dados.tipo,
      quantidade: dados.quantidade,
      custoUnitario,
      precoUnitario: dados.precoUnitario ?? (dados.tipo === 'descarte' ? 0 : produto.precoVenda || 0),
      valorPerdido: dados.tipo === 'descarte' ? Number((dados.quantidade * custoUnitario).toFixed(2)) : 0,
      motivo: dados.motivo || null,
      data: hoje(),
      mes: hoje().slice(0, 7), // YYYY-MM, usado no relatório mensal
    };
    const restante = lote.quantidadeAtual - dados.quantidade;
    t.update(loteRef, { quantidadeAtual: restante });
    t.set(baixaRef, { ...baixa, criadoEm: FieldValue.serverTimestamp() });
    return { id: baixaRef.id, ...baixa, estoqueRestante: restante };
  });
  res.status(201).json(resultado);
}));

module.exports = router;
