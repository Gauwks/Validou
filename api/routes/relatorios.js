const router = require('express').Router();
const { asyncHandler, HttpError } = require('../utils/erros');
const { hoje } = require('../utils/datas');

router.get('/perdas', asyncHandler(async (req, res) => {
  const mes = req.query.mes || hoje().slice(0, 7);
  if (!/^\d{4}-\d{2}$/.test(mes)) throw new HttpError(400, 'Use mes=YYYY-MM.');

  const snap = await req.estRef.collection('baixas').where('mes', '==', mes).get();
  const baixas = snap.docs.map((d) => d.data());

  const resumo = {
    venda: { quantidade: 0, valor: 0 },
    promocao: { quantidade: 0, valor: 0 },
    descarte: { quantidade: 0, valor: 0 },
  };
  const porProduto = {};

  for (const b of baixas) {
    const r = resumo[b.tipo];
    r.quantidade += b.quantidade;
    r.valor += b.tipo === 'descarte' ? b.valorPerdido : b.quantidade * b.precoUnitario;
    if (b.tipo === 'descarte') {
      const p = (porProduto[b.produtoId] ||= { produtoId: b.produtoId, produtoNome: b.produtoNome, quantidade: 0, valorPerdido: 0 });
      p.quantidade += b.quantidade;
      p.valorPerdido += b.valorPerdido;
    }
  }
  const arred = (n) => Number(n.toFixed(2));
  Object.values(resumo).forEach((r) => (r.valor = arred(r.valor)));

  const totalMovimentado = resumo.venda.quantidade + resumo.promocao.quantidade + resumo.descarte.quantidade;
  res.json({
    mes,
    perdaTotal: resumo.descarte.valor,
    percentualDescarte: totalMovimentado ? arred((resumo.descarte.quantidade / totalMovimentado) * 100) : 0,
    resumoPorTipo: resumo,
    maioresPerdas: Object.values(porProduto)
      .map((p) => ({ ...p, valorPerdido: arred(p.valorPerdido) }))
      .sort((a, b) => b.valorPerdido - a.valorPerdido)
      .slice(0, 10),
  });
}));

module.exports = router;
