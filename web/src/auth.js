import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

function exigirFirebase() {
  if (!auth) throw new Error('Firebase Web não configurado. Copie web/.env.example para web/.env.local e preencha os valores do Console do Firebase.');
  return auth;
}

export async function cadastrar({ email, senha, nomeEstabelecimento, tipo = 'mercadinho' }) {
  const firebaseAuth = exigirFirebase();
  await createUserWithEmailAndPassword(firebaseAuth, email, senha);
  return api('/estabelecimentos', { method: 'POST', body: { nome: nomeEstabelecimento, tipo } });
}

export const entrar = (email, senha) => signInWithEmailAndPassword(exigirFirebase(), email, senha);
export const sair = () => signOut(exigirFirebase());
