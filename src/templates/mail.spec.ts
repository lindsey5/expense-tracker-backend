import { verificationEmailTemplate } from './mail';

describe('verificationEmailTemplate', () => {
  it('renders the recipient name and verification code', () => {
    const html = verificationEmailTemplate('John', '123456');

    expect(html).toContain('Hi John,');
    expect(html).toContain('123456');
    expect(html).toContain('Gastador');
    expect(html).toContain('15 minutes');
  });
});
