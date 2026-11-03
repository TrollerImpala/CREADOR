import {
  Delete,
  Controller,
  Query,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../guards/auth.guard';
import { GeneralPostsService } from './general_posts.service';

@Controller('GeneralPosts')
export class generalPostscontroller {
  constructor(private readonly generalpostservice: GeneralPostsService) {}

  @Delete('Deleteposts/:id')
  @UseGuards(SupabaseAuthGuard)
  async deletpost(
    @Query('tipo') tipo: string,
    @Param('id') id_post: string,
    @Req() req: Record<string, any>,
  ) {
    const user = req.user;
    return await this.generalpostservice.DeletPost(id_post, tipo, user);
  }
}
