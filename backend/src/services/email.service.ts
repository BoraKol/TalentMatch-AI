import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter | null = null;

    constructor() {
        // Initialize with Environment Variables if present
        if (process.env.SMTP_HOST && process.env.SMTP_USER) {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                },
                // Timeouts to prevent hanging
                connectionTimeout: 5000, // 5 seconds
                greetingTimeout: 5000,   // 5 seconds
                socketTimeout: 10000,    // 10 seconds
            });
            console.log(`📧 Email Service: Configured with SMTP (${process.env.SMTP_HOST})`);
        } else {
            console.log('⚠️ Email Service: No SMTP configuration found. Emails will be MOCKED (logged to console).');
            this.transporter = null;
        }
    }

    private async sendMailWithTimeout(mailOptions: any): Promise<any> {
        if (!this.transporter) throw new Error('No transporter');

        const timeoutMs = 5000; // Hard 5 second limit

        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(`Email sending timed out after ${timeoutMs}ms`));
            }, timeoutMs);
        });

        const sendPromise = this.transporter.sendMail(mailOptions);

        return Promise.race([sendPromise, timeoutPromise]);
    }

    async sendContactEmail(options: {
        to: string;
        candidateName: string;
        subject: string;
        message: string;
        senderName: string;
        senderEmail: string;
        companyName: string;
        jobTitle: string;
    }) {
        console.log(`📧 Preparing to send email to ${options.to}`);

        // MOCK MODE check
        if (!this.transporter) {
            this.logMockEmail(options);
            return { messageId: 'mock-id-' + Date.now() };
        }

        try {
            const mailOptions = {
                from: `"${options.companyName}" <${process.env.SMTP_USER || 'noreply@talentmatch.ai'}>`,
                to: options.to,
                replyTo: options.senderEmail,
                subject: options.subject,
                text: `Hello ${options.candidateName},\n\n${options.message}\n\n---\nSent via TalentMatch AI\n${options.senderName} | ${options.companyName}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                        <h2 style="color: #0f172a;">New Message from ${options.companyName}</h2>
                        <p><strong>RE: ${options.jobTitle}</strong></p>
                        <hr style="border: 1px solid #e2e8f0; margin: 20px 0;">
                        <p style="white-space: pre-wrap; color: #334155;">${options.message}</p>
                        <br>
                        <p style="color: #64748b; font-size: 14px;">Reply directly to this email to contact <strong>${options.senderName}</strong> (${options.senderEmail}).</p>
                    </div>
                `
            };

            const info = await this.sendMailWithTimeout(mailOptions);

            console.log(`📧 Email sent: ${info.messageId}`);
            return info;
        } catch (error) {
            console.error('❌ Error sending contact email (Real SMTP failed or Timed out):', error);
            console.warn('⚠️ Falling back to MOCK mode.');
            this.logMockEmail(options);
            return { messageId: 'mock-fallback-' + Date.now() };
        }
    }

    async sendInterviewInvite(to: string, candidateName: string, jobTitle: string) {
        console.log(`📧 Preparing to send interview invite to ${to}`);

        if (!this.transporter) {
            this.logMockInvite(to, jobTitle);
            return { messageId: 'mock-id-' + Date.now() };
        }

        try {
            const mailOptions = {
                from: '"TalentMatch AI" <recruit@talentmatch.ai>',
                to: to,
                subject: `Interview Invitation: ${jobTitle}`,
                text: `Hello ${candidateName},\n\nWe were impressed by your profile and would like to invite you to an interview for the ${jobTitle} position.\n\nBest,\nTalentMatch AI Team`,
                html: `
                    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                        <h2 style="color: #2563eb;">Interview Invitation</h2>
                        <p>Hello <strong>${candidateName}</strong>,</p>
                        <p>We are excited to invite you to an interview for the <strong>${jobTitle}</strong> position.</p>
                        <p>Our AI matching algorithm identified you as a top candidate!</p>
                        <br/>
                        <a href="#" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Accept Invitation</a>
                        <br/><br/>
                        <p>Best regards,<br/>TalentMatch AI Recruiting Team</p>
                    </div>
                `
            };

            const info = await this.sendMailWithTimeout(mailOptions);

            console.log(`📧 Email sent: ${info.messageId}`);
            if (nodemailer.getTestMessageUrl(info)) {
                console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return info;
        } catch (error) {
            console.error('❌ Error sending interview invite (Real SMTP failed or Timed out):', error);
            console.warn('⚠️ Falling back to MOCK mode.');
            this.logMockInvite(to, jobTitle);
            return { messageId: 'mock-fallback-' + Date.now() };
        }
    }

    private logMockEmail(options: any) {
        console.log('---------------------------------------------------');
        console.log('📧 [MOCK EMAIL SENT]');
        console.log(`To: ${options.to}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`From: ${options.senderName} (${options.senderEmail})`);
        console.log(`Message: \n${options.message}`);
        console.log('---------------------------------------------------');
    }

    private logMockInvite(to: string, jobTitle: string) {
        console.log('---------------------------------------------------');
        console.log('📧 [MOCK EMAIL SENT - INTERVIEW INVITE]');
        console.log(`To: ${to}`);
        console.log(`Subject: Interview Invitation: ${jobTitle}`);
        console.log('---------------------------------------------------');
    }
}

export default new EmailService();

