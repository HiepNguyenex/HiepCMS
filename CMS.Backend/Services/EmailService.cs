using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace CMS.Backend.Services
{
    public class EmailSettings
    {
        public string SmtpServer { get; set; } = "smtp.gmail.com";
        public int SmtpPort { get; set; } = 587;
        public string SenderName { get; set; } = "HiepCMS Perfume Shop";
        public string SenderEmail { get; set; } = "";
        public string SenderPassword { get; set; } = ""; // Mật khẩu ứng dụng Gmail (App Password)
        public bool EnableSsl { get; set; } = true;
    }

    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string htmlMessage)
        {
            try
            {
                if (string.IsNullOrEmpty(_settings.SenderEmail) || string.IsNullOrEmpty(_settings.SenderPassword))
                {
                    _logger.LogWarning("Email settings are not configured. Skipping sending email.");
                    return;
                }

                using var mail = new MailMessage();
                mail.From = new MailAddress(_settings.SenderEmail, _settings.SenderName);
                mail.To.Add(new MailAddress(toEmail));
                mail.Subject = subject;
                mail.Body = htmlMessage;
                mail.IsBodyHtml = true;

                using var smtp = new SmtpClient(_settings.SmtpServer, _settings.SmtpPort);
                smtp.Credentials = new NetworkCredential(_settings.SenderEmail, _settings.SenderPassword);
                smtp.EnableSsl = _settings.EnableSsl;

                await smtp.SendMailAsync(mail);
                _logger.LogInformation($"Email sent to {toEmail} successfully!");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send email to {toEmail}");
            }
        }
    }
}
