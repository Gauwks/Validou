
const FAIXAS = [
  { ate: 1, desconto: 0.5 },
  { ate: 3, desconto: 0.4 },
  { ate: 7, desconto: 0.3 },
  { ate: 15, desconto: 0.15 },
];

function sugerirPromocao({ diasRestantes, precoVenda, custo }) {
  if (diasRestantes < 0) {
    return { acao: 'descartar', motivo: 'Lote vencido: retirar da venda e registrar baixa de descarte.' };
  }
  const faixa = FAIXAS.find((f) => diasRestantes <= f.ate);
  if (!faixa || !precoVenda) {
    return { acao: 'monitorar', motivo: 'Ainda há tempo; sem promoção por enquanto.' };
  }
  const bruto = precoVenda * (1 - faixa.desconto);
  const preco = Math.max(bruto, custo || 0);
  const descontoReal = 1 - preco / precoVenda;
  return {
    acao: 'promocao',
    descontoPercentual: Math.round(descontoReal * 100),
    precoSugerido: Number(preco.toFixed(2)),
    motivo: `Vence em ${diasRestantes} dia(s). ` +
      (preco > bruto ? 'Desconto limitado para não vender abaixo do custo.' : 'Desconto sugerido pela faixa de vencimento.'),
  };
}

function faixaDeAlerta(diasRestantes) {
  if (diasRestantes < 0) return 'vencido';
  if (diasRestantes <= 7) return '7';
  if (diasRestantes <= 15) return '15';
  if (diasRestantes <= 30) return '30';
  return null;
}

module.exports = { sugerirPromocao, faixaDeAlerta };
