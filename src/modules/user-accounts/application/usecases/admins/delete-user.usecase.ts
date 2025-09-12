import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { UsersRepository } from "../../../../user-accounts/infrastructure/users.repository";

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase
  implements ICommandHandler<DeleteUserCommand, void>
{
  constructor(private usersRepository: UsersRepository) {
    //console.log('DeleteUserUseCase created');
  }

  async execute({ userId }: DeleteUserCommand): Promise<void> {
    const user = await this.usersRepository.findOrNotFoundFail(userId);

    user.makeDeleted();

    await this.usersRepository.save(user);
  }
}
