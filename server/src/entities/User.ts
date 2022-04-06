import { Field, ID, ObjectType } from "type-graphql"
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm"

@ObjectType() //Giao tiếp giữa graphql và type-graphql
@Entity() //Giao tiếp giữa typescript và postgresql
export class User extends BaseEntity {
    @Field(_type => ID)//@Field là để cho graphql biết là column này có được trả về hay không
    @PrimaryGeneratedColumn()
    id!: number

    @Field()
    @Column({ unique: true })
    email!: string

    @Field()
    @Column({ unique: true })
    username!: string

    @Column()
    password: string

    @Field()
    @CreateDateColumn()
    createdAt: Date

    @Field()
    @UpdateDateColumn()
    updatedAt: number
}