import { useState } from 'react';
import { ActivityIndicator, Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { api } from './src/api';
import { cadastrar, entrar, sair } from './src/auth';
import { auth } from './src/firebase';

export default function App() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [usuario, setUsuario] = useState(auth.currentUser);
  const [resultado, setResultado] = useState('');
  const [carregando, setCarregando] = useState(false);

  async function autenticar() {
    if (!email || !senha || (modoCadastro && !nome)) {
      Alert.alert('Preencha os campos obrigatórios.');
      return;
    }
    setCarregando(true);
    try {
      if (modoCadastro) {
        await cadastrar({ email, senha, nomeEstabelecimento: nome });
      } else {
        await entrar(email, senha);
      }
      setUsuario(auth.currentUser);
      Alert.alert('Tudo certo', modoCadastro ? 'Conta e estabelecimento criados.' : 'Login realizado.');
    } catch (error) {
      Alert.alert('Não foi possível entrar', error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function carregarProdutos() {
    setCarregando(true);
    try {
      const produtos = await api('/produtos');
      setResultado(`${produtos.length} produto(s) encontrado(s).`);
    } catch (error) {
      Alert.alert('Erro na API', error.message);
    } finally {
      setCarregando(false);
    }
  }

  async function desconectar() {
    await sair();
    setUsuario(null);
    setResultado('');
  }

  if (usuario) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Valida</Text>
        <Text style={styles.subtitle}>Conectado como {usuario.email}</Text>
        <View style={styles.button}><Button title="Carregar produtos" onPress={carregarProdutos} /></View>
        {!!resultado && <Text style={styles.result}>{resultado}</Text>}
        <View style={styles.button}><Button title="Sair" color="#b64032" onPress={desconectar} /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Valida</Text>
      <Text style={styles.subtitle}>{modoCadastro ? 'Criar conta' : 'Entrar'}</Text>
      {modoCadastro && <TextInput style={styles.input} placeholder="Nome do estabelecimento" value={nome} onChangeText={setNome} />}
      <TextInput style={styles.input} placeholder="E-mail" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} />
      <TextInput style={styles.input} placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      <View style={styles.button}>{carregando ? <ActivityIndicator /> : <Button title={modoCadastro ? 'Cadastrar' : 'Entrar'} onPress={autenticar} />}</View>
      <Button title={modoCadastro ? 'Já tenho uma conta' : 'Criar uma conta'} onPress={() => setModoCadastro(!modoCadastro)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8f6f1' },
  title: { fontSize: 38, fontWeight: '800', color: '#20231f', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#5c625a', marginBottom: 24 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#d8ddd4', borderRadius: 10, padding: 14, marginBottom: 12 },
  button: { marginVertical: 8 },
  result: { textAlign: 'center', color: '#25734b', marginVertical: 12 },
});
