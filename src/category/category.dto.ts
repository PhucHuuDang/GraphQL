import { Field, InputType } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType()
export class CreateCategory {
  @Field()
  @IsString()
  name: string;
}
