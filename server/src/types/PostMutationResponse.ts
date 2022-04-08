import { FieldError } from "./FieldError";
import { Post } from "../entities/Post";
import { Field, ObjectType } from "type-graphql";
import { IMutationResponse } from "./IMutationResponse";

@ObjectType({ implements: IMutationResponse })
export class PostMutationResponse implements IMutationResponse {
  code: number;
  message?: string | undefined;
  success: boolean;

  @Field({ nullable: true })
  post?: Post;

  @Field((_type) => [FieldError], { nullable: true })
  errors?: FieldError[];
}
