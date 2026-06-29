export const minutosDesdeHora = (hora: string) => {
  const [horas, minutos] = hora.split(":").map(Number);
  return horas * 60 + minutos;
};

export const horaDesdeMinutos = (totalMinutos: number) => {
  const horas = Math.floor(totalMinutos / 60)
    .toString()
    .padStart(2, "0");
  const minutos = (totalMinutos % 60).toString().padStart(2, "0");

  return `${horas}:${minutos}`;
};

export const haySuperposicion = (
  inicioA: number,
  finA: number,
  inicioB: number,
  finB: number
) => inicioA < finB && finA > inicioB;

export const esRangoHorarioValido = (horaInicio: string, horaFin: string) =>
  minutosDesdeHora(horaInicio) < minutosDesdeHora(horaFin);
