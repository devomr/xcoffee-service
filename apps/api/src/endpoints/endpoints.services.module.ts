import { Module } from '@nestjs/common';
import { DynamicModuleUtils, ExampleModule } from '@mvx-monorepo/common';
import { TestSocketModule } from './test-sockets/test.socket.module';
import { TokenModule } from './tokens/token.module';
import { UsersModule } from './users/user.module';
import configuration from '../../config/configuration';
import { XcoffeeModule } from './xcoffee.abi/xcoffee.module';
import { CreatorsModule } from './creators/creators.module';
import { DonationsModule } from './donations/donations.module';
import { StatsModule } from '@mvx-monorepo/common/stats/stats.module';

@Module({
  imports: [
    XcoffeeModule,
    ExampleModule.forRoot(configuration),
    StatsModule.forRoot(configuration),
    TestSocketModule,
    UsersModule,
    CreatorsModule,
    DonationsModule,
    TokenModule,
  ],
  providers: [DynamicModuleUtils.getNestJsApiConfigService()],
  exports: [
    XcoffeeModule,
    ExampleModule,
    TestSocketModule,
    UsersModule,
    CreatorsModule,
    DonationsModule,
    TokenModule,
    StatsModule,
  ],
})
export class EndpointsServicesModule {}
