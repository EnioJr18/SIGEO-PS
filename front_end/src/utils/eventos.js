export function getLinkComprovacao(evento) {
  const link = (
    evento?.link_comprovacao ||
    evento?.linkComprovacao ||
    evento?.comprovacao ||
    evento?.link ||
    ''
  );

  return String(link).trim();
}
