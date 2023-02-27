import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import * as DeviceDetector from 'device-detector-js';

const deviceDetector = new DeviceDetector();

export const DeviceName = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();

    const device = deviceDetector.parse(request.headers['user-agent']);

    const name = [device.device?.brand, device.os?.name]
      .reduce((item: string | undefined) => {
        if (item) {
          return item + ' ';
        }

        return '';
      })
      .trim();

    if (name.length > 1) {
      return name[0].toUpperCase() + name.slice(1);
    }

    return 'undefined';
  },
);
