import { FieldError } from "./FieldError";
import { User } from "../entities/User";
import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class UserMutationResponse implements IMutationResponse {
  code: number;
  message?: string | undefined;
  success: boolean;

  @Field({ nullable: true })
  user?: User;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
