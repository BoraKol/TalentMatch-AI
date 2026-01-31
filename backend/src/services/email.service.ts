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
}

export default new EmailService();
