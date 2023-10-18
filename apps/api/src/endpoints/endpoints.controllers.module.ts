import { Module } from '@nestjs/common';
import { DynamicModuleUtils } from '@mvx-monorepo/common';
import { AuthController } from './auth/auth.controller';
import { EndpointsServicesModule } from './endpoints.services.module';
import { ExampleController, HealthCheckController } from '@mvx-monorepo/common';
import { TokensController } from './tokens/token.controller';
import { UsersController } from './users/user.controller';
import { CreatorsController } from './creators/creators.controller';
import { DonationsController } from './donations/donations.controller';
import { StatsController } from './stats/stats.controller';
import { XcoffeeController } from './xcoffee.abi/xcoffee.controller';

@Module({
  imports: [EndpointsServicesModule],
  providers: [DynamicModuleUtils.getNestJsApiConfigService()],
  controllers: [
    AuthController,
    ExampleController,
    HealthCheckController,
    UsersController,
    CreatorsController,
    DonationsController,
    TokensController,
    StatsController,
    XcoffeeController,
  ],
})
export class EndpointsControllersModule {}
