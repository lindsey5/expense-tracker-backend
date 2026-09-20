import { ROUTE_ARGS_METADATA } from '@nestjs/common/constants';
import { ExecutionContext } from '@nestjs/common';
import { CurrentUserId } from './current-user.decorator';

type RouteArgMetadata = {
  factory: (data: unknown, ctx: ExecutionContext) => unknown;
};

class TestController {
  test(@CurrentUserId() userId: string | undefined) {
    void userId;
    return undefined;
  }
}

const getDecoratorFactory = () => {
  const metadata = Reflect.getMetadata(
    ROUTE_ARGS_METADATA,
    TestController,
    'test',
  ) as Record<string, RouteArgMetadata>;

  return Object.values(metadata)[0].factory;
};

const createContext = (user?: { sub?: string }) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as ExecutionContext;

describe('CurrentUserId', () => {
  it('returns the authenticated user subject', () => {
    const factory = getDecoratorFactory();

    expect(factory(undefined, createContext({ sub: 'user-123' }))).toBe(
      'user-123',
    );
  });

  it('returns undefined when the request has no user', () => {
    const factory = getDecoratorFactory();

    expect(factory(undefined, createContext())).toBeUndefined();
  });
});
