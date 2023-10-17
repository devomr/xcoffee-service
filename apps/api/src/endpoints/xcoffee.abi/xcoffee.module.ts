import { Module } from '@nestjs/common';
import { XcoffeeService } from './xcoffee.service';

@Module({
  imports: [],
  providers: [XcoffeeService],
  exports: [XcoffeeService],
})
export class XcoffeeModule {}
