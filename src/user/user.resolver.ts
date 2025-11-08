import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { UserService } from './user.service';
import { User } from 'src/models/user.model';
import { CreateUser } from './dto/create-user';
import { UpdateUser } from './dto/update-user';

import {
  type UserSession,
  type BaseUserSession,
  Session,
} from '@thallesp/nestjs-better-auth';

import { Session as SessionModel } from 'src/models/session.model';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => User, { name: 'profile' })
  getProfile(@Session() session: UserSession) {
    return { user: session.user };
  }

  @Mutation(() => User)
  createUser(@Args('createUserInput') createUserInput: CreateUser) {
    return this.userService.create(createUserInput);
  }

  @Query(() => [User], { name: 'user' })
  findAll() {
    return this.userService.findAll();
  }

  @Query(() => User, { name: 'user' })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.userService.findOne(id);
  }

  @Mutation(() => User)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUser) {
    return this.userService.update(updateUserInput.id, updateUserInput);
  }

  @Mutation(() => User)
  removeUser(@Args('id', { type: () => Int }) id: number) {
    return this.userService.remove(id);
  }
}
