declare global {
  namespace Express {
    interface Request {
      usuario?: {
        idUsuario: string;
        rol: string;
      };
    }
  }
}

export {};
