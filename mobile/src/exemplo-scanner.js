// Exemplo do fluxo do mobile: escanear -> buscar produto -> registrar lote.
// Instalar: npx expo install expo-camera
import { useState } from 'react';
import { View, Text, Button, TextInput, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { produtos, lotes } from './api';

export default function ScannerLote() {
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [produto, setProduto] = useState(null);
  const [validade, setValidade] = useState(''); // YYYY-MM-DD
  const [quantidade, setQuantidade] = useState('');
  const [lido, setLido] = useState(false);

  if (!permissao?.granted) return <Button title="Permitir câmera" onPress={pedirPermissao} />;

  async function aoEscanear({ data: codigo }) {
    if (lido) return;
    setLido(true);
    try {
      setProduto(await produtos.porCodigo(codigo));
    } catch (e) {
      if (e.status === 404) Alert.alert('Produto novo', `Cadastre o código ${codigo} antes de continuar.`);
      else Alert.alert('Erro', e.message);
      setLido(false);
    }
  }

  async function salvar() {
    try {
      await lotes.criar({
        produtoId: produto.id,
        dataValidade: validade,
        quantidade: Number(quantidade),
      });
      Alert.alert('Lote registrado!');
      setProduto(null); setLido(false); setValidade(''); setQuantidade('');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  if (!produto) {
    return <CameraView style={{ flex: 1 }} onBarcodeScanned={aoEscanear} />;
  }
  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>{produto.nome}</Text>
      <TextInput placeholder="Validade (AAAA-MM-DD)" value={validade} onChangeText={setValidade} />
      <TextInput placeholder="Quantidade" keyboardType="numeric" value={quantidade} onChangeText={setQuantidade} />
      <Button title="Salvar lote" onPress={salvar} />
    </View>
  );
}
