export const passwordChecks = (password: string, confirmPassword: string) => [
  { text: "Al menos 8 caracteres", valid: password.length >= 8 },
  { text: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
  { text: "Una letra minúscula", valid: /[a-z]/.test(password) },
  { text: "Un número", valid: /\d/.test(password) },
  {
    text: "Un carácter especial (!@#$%^&*()-_=+[]{}|\\;:'\",<.>/?)",
    valid: /[!@#$%^&*()\-_=\+\[\]{}|\\;:'",<.>\/?]/.test(password),
  },
  {
    text: "Las contraseñas deben coincidir",
    valid: confirmPassword === password && confirmPassword.length > 0,
  },
];
