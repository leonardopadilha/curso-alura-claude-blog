/** Usuário como é guardado em memória. Nunca é serializado direto: veja `toUserResponse`. */
export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
};
