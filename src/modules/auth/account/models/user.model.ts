import { User } from '@/generated/prisma'
import { Field, ID, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class UserModel implements User {
  @Field(() => ID)
  public id: string;

  @Field(() => String)
  public email: string;

  @Field(() => String)
  public password: string;

  @Field(() => String)
  public username: string;

  @Field(() => String)
  public displayName: string;

  @Field(() => Boolean)
  public isVerified: boolean;

  @Field(() => Boolean)
  public isEmailVerified: boolean;

  @Field(() => String, { nullable: true })
  public avatar: string | null;

  @Field(() => String, { nullable: true })
  public bio: string | null;

  @Field(() => Date)
  public createdAt: Date;

  @Field(() => Date)
  public updatedAt: Date;
}
