const mockSendMail = jest.fn();
const mockVerify = jest.fn();
const mockCreateTransport = jest.fn(() => ({
  verify: mockVerify,
  sendMail: mockSendMail
}));
const mockCreateTestAccount = jest.fn(async () => ({ user: 'ethereal-user', pass: 'ethereal-pass' }));
const mockGetTestMessageUrl = jest.fn(() => 'http://preview.local/email');
const mockResendSend = jest.fn();

jest.mock('nodemailer', () => ({
  createTransport: (...args) => mockCreateTransport(...args),
  createTestAccount: (...args) => mockCreateTestAccount(...args),
  getTestMessageUrl: (...args) => mockGetTestMessageUrl(...args)
}));

jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: (...args) => mockResendSend(...args)
    }
  }))
}));

describe('emailService', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    mockSendMail.mockResolvedValue({ messageId: 'm1' });
    mockVerify.mockResolvedValue(true);
    mockResendSend.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    process.env.RESEND_API_KEY = '';
    process.env.RESEND_FROM = '';
  });

  test('sends email via Resend when RESEND config exists', async () => {
    process.env.RESEND_API_KEY = 're_test_key';
    process.env.RESEND_FROM = 'NutraCore <onboarding@resend.dev>';

    const { sendVerificationEmail } = require('../../services/emailService');
    await sendVerificationEmail({ toEmail: 'a@a.com', userName: 'A', verifyUrl: 'http://x/verify' });

    expect(mockResendSend).toHaveBeenCalled();
    expect(mockCreateTransport).not.toHaveBeenCalled();
  });

  test('sends email using real smtp transporter when smtp config exists', async () => {
    process.env.SMTP_HOST = 'smtp.example.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_USER = 'user@example.com';
    process.env.SMTP_PASS = 'secret';
    process.env.SMTP_FROM = 'Nutra <no-reply@example.com>';
    process.env.SMTP_SECURE = 'false';

    const { sendVerificationEmail } = require('../../services/emailService');
    await sendVerificationEmail({ toEmail: 'a@a.com', userName: 'A', verifyUrl: 'http://x/verify' });
    expect(mockCreateTransport).toHaveBeenCalled();
    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
  });

  test('falls back to ethereal mode when smtp config is missing', async () => {
    process.env.SMTP_HOST = '';
    process.env.SMTP_PORT = '';
    process.env.SMTP_USER = '';
    process.env.SMTP_PASS = '';
    process.env.SMTP_FROM = '';

    const { sendVerificationEmail } = require('../../services/emailService');
    await sendVerificationEmail({ toEmail: 'b@b.com', userName: 'B', verifyUrl: 'http://x/verify' });
    expect(mockCreateTestAccount).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalled();
    expect(mockGetTestMessageUrl).toHaveBeenCalled();
  });
});
