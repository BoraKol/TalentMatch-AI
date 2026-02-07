import nodemailer from 'nodemailer';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor() {
        // Initialize with Environment Variables or Fallback to Ethereal
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.ethereal.email',
            port: parseInt(process.env.SMTP_PORT || '587'),
            auth: {
                user: process.env.SMTP_USER || 'ethereal_user',
                pass: process.env.SMTP_PASS || 'ethereal_pass'
            }
        });

        // If no env vars, generate a test account for demo purposes
        if (!process.env.SMTP_HOST) {
            this.createTestAccount();
        }
    }

    private async createTestAccount() {
        try {
            const testAccount = await nodemailer.createTestAccount();
            this.transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('📧 Ethereal Test Email Account Created');
            console.log(`📧 User: ${testAccount.user}`);
            console.log(`📧 Pass: ${testAccount.pass}`);
        } catch (err) {
            console.error('Failed to create Ethereal account', err);
        }
    }

    async sendInterviewInvite(to: string, candidateName: string, jobTitle: string) {
        try {
            const info = await this.transporter.sendMail({
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
            });

            console.log(`📧 Email sent: ${info.messageId}`);
            if (nodemailer.getTestMessageUrl(info)) {
                console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
            }
            return info;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
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
        try {
            const info = await this.transporter.sendMail({
                from: `"${options.companyName}" <recruit@talentmatch.ai>`,
                to: options.to,
                replyTo: options.senderEmail,
                subject: options.subject,
                text: `Hello ${options.candidateName},\n\n${options.message}\n\n---\nSent via TalentMatch AI\n${options.senderName} | ${options.companyName}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8fafc; padding: 20px;">
                        <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 24px; border-radius: 12px 12px 0 0;">
                            <h1 style="color: white; margin: 0; font-size: 24px;">🤝 You've Been Contacted!</h1>
                        </div>
                        <div style="background: white; padding: 24px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                            <p style="color: #64748b; font-size: 14px; margin-bottom: 4px;">Hello,</p>
                            <p style="color: #1e293b; font-size: 18px; font-weight: 600; margin-top: 0;">${options.candidateName}</p>
                            
                            <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #10b981;">
                                <p style="color: #475569; margin: 0; white-space: pre-wrap;">${options.message}</p>
                            </div>

                            <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                                <p style="color: #64748b; font-size: 12px; margin-bottom: 8px;">REGARDING POSITION</p>
                                <p style="color: #1e293b; font-size: 16px; font-weight: 600; margin: 0;">${options.jobTitle}</p>
                            </div>

                            <div style="margin-top: 16px; padding: 16px; background: #f8fafc; border-radius: 8px;">
                                <p style="color: #64748b; font-size: 12px; margin: 0 0 4px 0;">FROM</p>
                                <p style="color: #1e293b; font-weight: 600; margin: 0;">${options.senderName}</p>
                                <p style="color: #10b981; margin: 4px 0 0 0;">${options.companyName}</p>
                                <a href="mailto:${options.senderEmail}" style="color: #2563eb; text-decoration: none; font-size: 14px;">${options.senderEmail}</a>
                            </div>

                            <a href="mailto:${options.senderEmail}?subject=Re: ${options.subject}" 
                               style="display: block; text-align: center; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; margin-top: 20px;">
                                Reply to ${options.senderName}
                            </a>
                        </div>
                        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 16px;">
                            Sent via TalentMatch AI • AI-Powered Recruitment Platform
                        </p>
                    </div>
                `
            });

            console.log(`📧 Contact email sent: ${info.messageId}`);
            if (nodemailer.getTestMessageUrl(info)) {
                console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
                return { messageId: info.messageId, previewUrl: nodemailer.getTestMessageUrl(info) };
            }
            return { messageId: info.messageId };
        } catch (error) {
            console.error('Error sending contact email:', error);
            throw error;
        }
    }
}

export default new EmailService();

