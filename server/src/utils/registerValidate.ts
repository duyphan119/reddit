import { RegisterInput } from "../types/RegisterInput";

export const registerValidate = (registerInput: RegisterInput) => {
  if (!registerInput.email.includes("@")) {
    return {
      message: "Invalid Email",
      errors: [{ field: "email", message: "Email must include @" }],
    };
  }

  if (registerInput.username.includes("@")) {
    return {
      message: "Invalid Username",
      errors: [{ field: "username", message: "Username mustn't include @" }],
    };
  }

  if (registerInput.username.length <= 2) {
    return {
      message: "Invalid Username",
      errors: [{ field: "username", message: "Length must be greater than 2" }],
    };
  }

  if (registerInput.password.length <= 2) {
    return {
      message: "Invalid Password",
      errors: [{ field: "password", message: "Length must be greater than 2" }],
    };
  }
  return null;
};
