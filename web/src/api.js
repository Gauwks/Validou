import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL;

export async function api(caminho, { method = 'GET', body } = {}) {
  const token = await auth.currentUser?.getIdToken();
  const res = await fetch(`${API_URL}${caminho}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (res.status === 204) return null;
  const dados = await res.json().catch(() => ({}));
  if (!res.ok) {
    const erro = new Error(dados.erro || 'Erro na requisição');
    erro.status = res.status;
    erro.detalhes = dados.detalhes;
    throw erro;
  }
  return dados;
}


export const produtos = {
  listar: () => api('/produtos'),
  porCodigo: (codigo) => api(`/produtos/codigo/${codigo}`),
  criar: (dados) => api('/produtos', { method: 'POST', body: dados }),
};
export const lotes = {
  listar: (query = '') => api(`/lotes${query}`),
  criar: (dados) => api('/lotes', { method: 'POST', body: dados }),
  baixa: (id, dados) => api(`/lotes/${id}/baixas`, { method: 'POST', body: dados }),
};
export const dashboard = { vencimentos: () => api('/dashboard/vencimentos') };
export const relatorios = { perdas: (mes = '') => api(`/relatorios/perdas${mes ? `?mes=${mes}` : ''}`) };
export const alertas = {
  listar: () => api('/alertas'),
  gerar: () => api('/alertas/gerar', { method: 'POST' }),
};
