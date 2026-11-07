import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';
import { api } from './api';

// Cadastro: cria o usuário no Firebase e já cria o estabelecimento na API
export async function cadastrar({ email, senha, nomeEstabelecimento, tipo = 'mercadinho' }) {
  await createUserWithEmailAndPassword(auth, email, senha);
  return api('/estabelecimentos', { method: 'POST', body: { nome: nomeEstabelecimento, tipo } });
}

export const entrar = (email, senha) => signInWithEmailAndPassword(auth, email, senha);
export const sair = () => signOut(auth);

// Para saber se há usuário logado: onAuthStateChanged(auth, (user) => ...)
