export const products = [
  { id: "p1", name: "Iogurte natural 170g", category: "Laticínios", barcode: "7891234567890", cost: 2.1, price: 4.5, units: 42 },
  { id: "p2", name: "Pão francês", category: "Padaria", barcode: "7891234567891", cost: 0.45, price: 0.9, units: 86 },
  { id: "p3", name: "Queijo minas fatiado", category: "Frios", barcode: "7891234567892", cost: 18.4, price: 29.9, units: 16 },
  { id: "p4", name: "Suco de laranja 1L", category: "Bebidas", barcode: "7891234567893", cost: 5.2, price: 9.9, units: 28 },
  { id: "p5", name: "Bolo de cenoura", category: "Confeitaria", barcode: "7891234567894", cost: 12.5, price: 24.9, units: 8 },
];

export const initialLots = [
  { id: "l1", productId: "p5", productName: "Bolo de cenoura", category: "Confeitaria", batch: "BC-2211", expires: "19 nov", days: -4, quantity: 3, price: 24.9, cost: 12.5, urgency: "vencido" },
  { id: "l2", productId: "p1", productName: "Iogurte natural 170g", category: "Laticínios", batch: "IO-8472", expires: "23 nov", days: 0, quantity: 12, price: 4.5, cost: 2.1, urgency: "ate7" },
  { id: "l3", productId: "p3", productName: "Queijo minas fatiado", category: "Frios", batch: "QM-1098", expires: "26 nov", days: 3, quantity: 8, price: 29.9, cost: 18.4, urgency: "ate7" },
  { id: "l4", productId: "p4", productName: "Suco de laranja 1L", category: "Bebidas", batch: "SL-3421", expires: "02 dez", days: 9, quantity: 18, price: 9.9, cost: 5.2, urgency: "ate15" },
  { id: "l5", productId: "p2", productName: "Pão francês", category: "Padaria", batch: "PF-5510", expires: "05 dez", days: 12, quantity: 38, price: 0.9, cost: 0.45, urgency: "ate15" },
  { id: "l6", productId: "p1", productName: "Iogurte natural 170g", category: "Laticínios", batch: "IO-8501", expires: "14 dez", days: 21, quantity: 30, price: 4.5, cost: 2.1, urgency: "ate30" },
];

export const lossData = [
  { label: "jun", value: 68 },
  { label: "jul", value: 46 },
  { label: "ago", value: 57 },
  { label: "set", value: 39 },
  { label: "out", value: 31 },
  { label: "nov", value: 22 },
];

export const apiMapping = {
  dashboard: "/api/dashboard/vencimentos",
  products: "/api/produtos",
  lots: "/api/lotes?ativos=true",
  alerts: "/api/alertas?lido=false",
  report: "/api/relatorios/perdas?mes=2026-11",
};
