import { lotes as lotesApi, produtos as produtosApi } from "@/api";
import { initialLots, products as demoProducts } from "@/data/demo";

function normalizeProduct(product) {
  return {
    id: product.id,
    name: product.nome || "Produto sem nome",
    barcode: product.codigoBarras || "sem código",
    category: product.categoria || "Sem categoria",
    cost: Number(product.custo || 0),
    price: Number(product.precoVenda || 0),
    units: Number(product.unidades || 0),
  };
}

function normalizeLot(lot, products) {
  const product = products.find((item) => item.id === lot.produtoId);
  const days = Number(lot.diasRestantes ?? 0);
  return {
    id: lot.id,
    productId: lot.produtoId || "",
    productName: lot.produtoNome || product?.name || "Produto sem nome",
    category: product?.category || "Sem categoria",
    batch: lot.codigoLote || "sem lote",
    expires: lot.dataValidade || "sem data",
    days,
    quantity: Number(lot.quantidadeAtual || 0),
    price: product?.price || 0,
    cost: product?.cost || 0,
    urgency: days < 0 ? "vencido" : days <= 7 ? "ate7" : days <= 15 ? "ate15" : "ate30",
  };
}

export function subscribeInventory({ onProducts, onLots, onError }) {
  let ativo = true;
  Promise.all([produtosApi.listar(), lotesApi.listar("?ativos=true")])
    .then(([productsData, lotsData]) => {
      if (!ativo) return;
      const products = productsData.map(normalizeProduct);
      onProducts(products);
      onLots(lotsData.map((lot) => normalizeLot(lot, products)));
    })
    .catch((error) => {
      if (!ativo) return;
      onProducts(demoProducts);
      onLots(initialLots);
      onError?.(error);
    });
  return () => {
    ativo = false;
  };
}

export async function registerLot(lot) {
  return lotesApi.criar({
    produtoId: lot.productId,
    codigoLote: lot.batch,
    dataValidade: lot.expires,
    quantidade: Number(lot.quantity),
  });
}

export async function registerLotAction(lotId, action) {
  return lotesApi.baixa(lotId, {
    tipo: action === "promotion" ? "promocao" : action,
    quantidade: 1,
  });
}
