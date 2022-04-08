import { UpdatePostInput } from "./../types/UpdatePostInput";
import { PostMutationResponse } from "../types/PostMutationResponse";
import { Arg, ID, Mutation, Query, Resolver } from "type-graphql";
import { CreatePostInput } from "../types/CreatePostInput";
import { Post } from "../entities/Post";

@Resolver()
export class PostResolver {
  @Mutation((_return) => PostMutationResponse)
  async create(
    @Arg("createPostInput") createPostInput: CreatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const { title, text } = createPostInput;
      const newPost = await Post.create({ title, text });

      await newPost.save();
      return {
        code: 200,
        success: true,
        message: "Post is created successfully",
        post: newPost,
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

  @Query((_return) => [Post])
  async posts(): Promise<Post[]> {
    return Post.find();
  }

  @Query((_return) => Post, { nullable: true })
  async post(@Arg("id", (_type) => ID) id: number): Promise<Post | null> {
    try {
      const post = await Post.findOne({
        where: {
          id: id,
        },
      });
      return post;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  @Mutation((_return) => PostMutationResponse)
  async updatePost(
    @Arg("updatePostInput") updatePostInput: UpdatePostInput
  ): Promise<PostMutationResponse> {
    try {
      const { id, title, text } = updatePostInput;
      const existingPost = await Post.findOne({
        where: { id: id },
      });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };
      }
      existingPost.title = title;
      existingPost.text = text;

      await existingPost.save();

      return {
        code: 200,
        success: true,
        message: "Post is updated successfully",
        post: existingPost,
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

  @Mutation((_return) => PostMutationResponse)
  async delete(
    @Arg("id", (_type) => ID) id: number
  ): Promise<PostMutationResponse> {
    try {
      const existingPost = await Post.findOne({
        where: { id: id },
      });
      if (!existingPost) {
        return {
          code: 400,
          success: false,
          message: "Post not found",
        };
      }

      await Post.delete({ id });

      return {
        code: 200,
        success: true,
        message: "Post is deleted successfully",
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
