import { Module } from '@nestjs/common';
import { ApiConfigModule } from '../config';
import { ConvertUtil, DynamicModuleUtils } from '../utils';
import { StatsService } from './stats.service';

@Module({})
export class StatsModule {
  static forRoot(configuration: () => Record<string, any>) {
    return {
      module: StatsModule,
      imports: [
        ApiConfigModule.forRoot(configuration),
        DynamicModuleUtils.getApiModule(configuration),
        DynamicModuleUtils.getCachingModule(configuration),
        ConvertUtil,
      ],
      providers: [StatsService],
      exports: [StatsService],
    };
  }
}
