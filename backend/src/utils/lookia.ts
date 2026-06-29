export const generarUrlResultadoLookIA = (idSimulacionLookIA: string, version?: number) => {
  const sufijo = version && version > 1 ? `-v${version}` : "";
  return `https://example.com/lookia/resultados/${idSimulacionLookIA}${sufijo}.jpg`;
};
