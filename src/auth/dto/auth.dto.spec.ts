import { AuthResponseDto, UserResponseDto } from './auth.dto';

describe('Auth DTO defaults', () => {
  it('creates an empty user response by default', () => {
    expect(new UserResponseDto()).toEqual({
      id: '',
      email: '',
      firstName: '',
      lastName: '',
      isVerified: false,
    });
  });

  it('creates an auth response with an empty token and user', () => {
    expect(new AuthResponseDto()).toEqual({
      accessToken: '',
      user: new UserResponseDto(),
    });
  });
});
