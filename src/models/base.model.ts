import { Field, Int, ObjectType } from '@nestjs/graphql';

/**
 * Base model with string ID and timestamp fields
 * Use this for models with UUID/string IDs that have both createdAt and updatedAt
 */
@ObjectType({ isAbstract: true })
export abstract class BaseModel {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

/**
 * Base model with integer ID and timestamp fields
 * Use this for models with auto-increment integer IDs that have both createdAt and updatedAt
 */
@ObjectType({ isAbstract: true })
export abstract class BaseModelWithIntId {
  @Field(() => Int)
  id: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

/**
 * Base model with string ID and only createdAt
 * Use this for immutable/append-only models that don't need updatedAt
 */
@ObjectType({ isAbstract: true })
export abstract class BaseTimestampModel {
  @Field(() => String)
  id: string;

  @Field(() => Date)
  createdAt: Date;
}

/**
 * Base model with integer ID and only createdAt
 * Use this for immutable/append-only models with integer IDs
 */
@ObjectType({ isAbstract: true })
export abstract class BaseTimestampModelWithIntId {
  @Field(() => Int)
  id: number;

  @Field(() => Date)
  createdAt: Date;
}
