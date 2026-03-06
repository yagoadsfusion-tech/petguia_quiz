export function getVarianteIntro(): 'A' | 'B' {
  const stored = sessionStorage.getItem('variante_intro');
  if (stored === 'A' || stored === 'B') return stored;

  const variante: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
  sessionStorage.setItem('variante_intro', variante);
  return variante;
}

export function getVariantePay(): 'A' | 'B' {
  const stored = sessionStorage.getItem('variante_pay');
  if (stored === 'A' || stored === 'B') return stored;

  const variante: 'A' | 'B' = Math.random() < 0.5 ? 'A' : 'B';
  sessionStorage.setItem('variante_pay', variante);
  return variante;
}
