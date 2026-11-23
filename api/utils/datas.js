
const FUSO = 'America/Sao_Paulo';

function hoje() {
  return new Date().toLocaleDateString('en-CA', { timeZone: FUSO }); // YYYY-MM-DD
}

function paraUTC(dataStr) {
  const [a, m, d] = dataStr.split('-').map(Number);
  return Date.UTC(a, m - 1, d);
}


function diasAte(dataStr, base = hoje()) {
  return Math.round((paraUTC(dataStr) - paraUTC(base)) / 86400000);
}

function somarDias(dataStr, dias) {
  const d = new Date(paraUTC(dataStr) + dias * 86400000);
  return d.toISOString().slice(0, 10);
}

module.exports = { hoje, diasAte, somarDias };
