import { UserMutationResponse } from "./../types/UserMutationResponse";
import { User } from "../entities/User";
import { Arg, Mutation, Resolver } from "type-graphql";
import { RegisterInput } from "../types/RegisterInput";
import argon2 from "argon2";
import { registerValidate } from "../utils/registerValidate";

@Resolver()
export class UserResolver {
  @Mutation((_return) => UserMutationResponse)
  async register(
    @Arg("registerInput") registerInput: RegisterInput
  ): Promise<UserMutationResponse> {
    const registerValidateErrors = registerValidate(registerInput);
    if (registerValidateErrors !== null)
      return { code: 400, success: false, ...registerValidateErrors };

    try {
      const { username, email, password } = registerInput;
      // Kiểm tra trùng email hoặc username
      const existingUser = await User.findOne({
        where: [{ username }, { email }],
      });

      if (existingUser)
        return {
          code: 400,
          success: false,
          message: "Duplicated username or email",
          errors: [
            {
              field: existingUser.username === username ? "username" : "email",
              message: `${
                existingUser.username === username ? "Username" : "Email"
              } is available`,
            },
          ],
        };

      // Hash mật khẩu bằng argon2
      const hashedPassword = await argon2.hash(password);

      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
      });

      return {
        code: 200,
        success: true,
        message: "Register new User successful",
        user: await newUser.save(),
      };
    } catch (error) {
      console.log(error);
      return {
        code: 500,
        success: false,
        message: `Internal Server Error ${error.message}`,
      };
    }
  }
}
