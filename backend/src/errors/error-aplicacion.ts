export class ErrorAplicacion extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly errores: string[] = []
  ) {
    super(message);
    this.name = "ErrorAplicacion";
  }
}
