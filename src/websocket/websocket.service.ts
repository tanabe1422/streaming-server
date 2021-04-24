import { Injectable } from '@nestjs/common';
import { User } from 'src/user/User';
import { Room } from 'src/room/Room';

@Injectable()
export class WebsocketService {
  getUsers(room: Room | undefined): { name: string; id: string }[] {
    // ルームが存在しない場合return
    if (!room) return [];

    return room.userList;
  }
}
