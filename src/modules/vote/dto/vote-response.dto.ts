import { ObjectType } from '@nestjs/graphql';

import { DeleteResponse, SingleResponse } from '../../../common/types/response.types';
import { VoteModel, VoteStatusModel } from '../models/vote.model';

@ObjectType()
export class VoteResponse extends SingleResponse(VoteModel) {}

@ObjectType()
export class VoteStatusResponse extends SingleResponse(VoteStatusModel) {}

@ObjectType()
export class RemoveVoteResponse extends DeleteResponse {}
