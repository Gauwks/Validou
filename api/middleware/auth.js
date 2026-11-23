const { auth, db } = require('../config/firebase');
const { HttpError, asyncHandler } = require('../utils/erros');

const autenticar = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new HttpError(401, 'Token ausente.');

  try {
    const decoded = await auth.verifyIdToken(token);
    req.uid = decoded.uid;
    req.email = decoded.email || null;
  } catch {
    throw new HttpError(401, 'Token inválido ou expirado.');
  }
  next();
});


const carregarEstabelecimento = asyncHandler(async (req, res, next) => {
  const snap = await db.collection('usuarios').doc(req.uid).get();
  if (!snap.exists || !snap.data().estabelecimentoId) {
    throw new HttpError(403, 'Usuário sem estabelecimento. Crie um em POST /estabelecimentos.');
  }
  req.estabelecimentoId = snap.data().estabelecimentoId;
  req.estRef = db.collection('estabelecimentos').doc(req.estabelecimentoId);
  next();
});

module.exports = { autenticar, carregarEstabelecimento };
