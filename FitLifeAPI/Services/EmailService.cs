using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using FitLifeAPI.Services.Interfaces;

namespace FitLifeAPI.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(
                _configuration["EmailSettings:FromName"],
                _configuration["EmailSettings:Username"]!
            ));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;
            email.Body = new TextPart("html") { Text = body };

            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(
                _configuration["EmailSettings:Host"]!,
                int.Parse(_configuration["EmailSettings:Port"]!),
                SecureSocketOptions.StartTls
            );
            await smtp.AuthenticateAsync(
                _configuration["EmailSettings:Username"]!,
                _configuration["EmailSettings:Password"]!
            );
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
    }
}