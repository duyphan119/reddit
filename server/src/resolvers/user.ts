import { LoginInput } from "./../types/LoginInput";
import { UserMutationResponse } from "./../types/UserMutationResponse";
import { User } from "../entities/User";
import { Arg, Ctx, Mutation, Resolver } from "type-graphql";
import { RegisterInput } from "../types/RegisterInput";
import argon2 from "argon2";
import { registerValidate } from "../utils/registerValidate";
import { Context } from "../types/Context";
import { COOKIE_NAME } from "../constants";

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

  @Mutation((_return) => UserMutationResponse)
  async login(
    @Arg("loginInput") loginInput: LoginInput,
    @Ctx() { req }: Context
  ): Promise<UserMutationResponse> {
    try {
      const { usernameOrEmail, password } = loginInput;

      const existingUser = await User.findOne({
        where: [{ email: usernameOrEmail }, { username: usernameOrEmail }],
      });

      if (!existingUser) {
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "usernameOrEmail",
              message: "Username or email is incorrect",
            },
          ],
        };
      }

      const checkedPassword = argon2.verify(existingUser.password, password);

      if (!checkedPassword) {
        return {
          code: 400,
          success: false,
          message: "User not found",
          errors: [
            {
              field: "password",
              message: "Password is incorrect",
            },
          ],
        };
      }

      req.session.userId = existingUser.id;

      return {
        code: 200,
        success: true,
        message: "Logged in successfully",
        user: existingUser,
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

  @Mutation((_return) => Boolean)
  logout(@Ctx() { req, res }: Context): Promise<boolean> {
    return new Promise((resolve, _reject) => {
      res.clearCookie(COOKIE_NAME);
      req.session.destroy((error) => {
        if (error) {
          console.log("Destroying Session Error", error);
          resolve(false);
        } else {
          resolve(true);
        }
      });
    });
  }
}
