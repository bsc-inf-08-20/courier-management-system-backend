import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/User.entity';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PickupModule } from './pickup/pickup.module';
import { PickupRequest } from './entities/PickupRequest.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'courier',
      // entities: [__dirname + '/entities/*.ts'], // Path to your entity files
      entities: [User, PickupRequest],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    PickupModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
