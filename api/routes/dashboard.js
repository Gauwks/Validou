const router = require('express').Router();
const { asyncHandler } = require('../utils/erros');
const { hoje, diasAte, somarDias } = require('../utils/datas');
const { sugerirPromocao } = require('../services/promocao');


router.get('/vencimentos', asyncHandler(async (req, res) => {
  const base = hoje();
  const limite = somarDias(base, 30);

  
  const [lotesSnap, produtosSnap] = await Promise.all([
    req.estRef.collection('lotes').where('dataValidade', '<=', limite).get(),
    req.estRef.collection('produtos').get(),
  ]);
  const produtos = Object.fromEntries(produtosSnap.docs.map((d) => [d.id, d.data()]));

  const grupos = { vencidos: [], ate7: [], ate15: [], ate30: [] };
  for (const doc of lotesSnap.docs) {
    const l = doc.data();
    if (!(l.quantidadeAtual > 0)) continue;
    const dias = diasAte(l.dataValidade, base);
    const p = produtos[l.produtoId] || {};
    const item = {
      loteId: doc.id,
      produtoId: l.produtoId,
      produtoNome: l.produtoNome,
      codigoLote: l.codigoLote || null,
      dataValidade: l.dataValidade,
      diasRestantes: dias,
      quantidadeAtual: l.quantidadeAtual,
      sugestao: sugerirPromocao({ diasRestantes: dias, precoVenda: p.precoVenda, custo: p.custo }),
    };
    if (dias < 0) grupos.vencidos.push(item);
    else if (dias <= 7) grupos.ate7.push(item);
    else if (dias <= 15) grupos.ate15.push(item);
    else grupos.ate30.push(item);
  }
  Object.values(grupos).forEach((g) => g.sort((a, b) => a.diasRestantes - b.diasRestantes));

  res.json({
    geradoEm: base,
    totais: Object.fromEntries(Object.entries(grupos).map(([k, v]) => [k, v.length])),
    ...grupos,
  });
}));

module.exports = router;
