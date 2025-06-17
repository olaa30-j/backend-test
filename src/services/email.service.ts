import nodemailer from "nodemailer";
import IUser from "../Interfaces/user.interface";
import User from "../models/user.model";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const primaryColor = "#2F80A2";
const secondaryColor = "#f5f5f5";
const emailTemplate = (content: string) => `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 0 auto; border: 2px solid ${primaryColor}; border-radius: 8px; overflow: hidden;">
    <div style="padding: 20px; text-align: center;">
      <img src="cid:logo" alt="Family Logo" style="max-width:150px; height:auto; display:block; margin:0 auto;">
    </div>
    
    <div style="padding: 30px; background-color: white; text-align: right;">
      ${content}
    </div>
    
    <div style="background-color: ${secondaryColor}; padding: 20px; text-align: center; font-size: 14px; color: #666;">
      <p>© ${new Date().getFullYear()} جميع الحقوق محفوظة</p>
      <p>هذه رسالة تلقائية، يرجى عدم الرد عليها</p>
    </div>
  </div>
</body>
</html>
`;

export const sendWelcomeEmail = async (user: IUser) => {
  try {
    const content = `
      <h2 style="color: ${primaryColor}; text-align: center;">!مرحباً بك في منصتنا</h2>
      <p style="margin: 10px 0;">،عزيزي/عزيزتي ${"المستخدم"}</p>
      <p style="margin: 10px 0;">.شكراً لتسجيلك معنا. لقد تم استلام طلب إنشاء حسابك وهو الآن قيد المراجعة</p>
      <p style="margin: 10px 0;">.سوف تتلقى إشعاراً بالبريد الإلكتروني بمجرد اكتمال مراجعة حسابك</p>
      
      <div style="border-top: 1px solid #eee; margin: 20px 0;"></div>
      
      <p style="margin: 10px 0;">:إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا</p>
      ${
        process.env.SUPPORT_EMAIL
          ? `<p style="margin: 10px 0;"><strong>:البريد الإلكتروني للدعم</strong> 
              <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: ${primaryColor}; text-decoration: none;">
                ${process.env.SUPPORT_EMAIL}
              </a>
            </p>`
          : ""
      }
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: user.email,
      subject: "مرحبًا بكم في منصتنا - الحساب قيد المراجعة",
      html: emailTemplate(content),
      attachments: [
        {
          filename: "logo.png",
          path: "https://res.cloudinary.com/dmhvfuuke/image/upload/v1748029147/family-logo_z54fug.png",
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending welcome email:", error);
  }
};

export const sendAccountStatusEmail = async (user: IUser) => {
  if (!user?.email || !user?.status) {
    console.error("Invalid user object - missing email or status");
    return;
  }

  if (!["مقبول", "مرفوض"].includes(user.status)) {
    console.log(`Skipping email for status: ${user.status}`);
    return;
  }

  try {
    const { subject, content } =
      user.status === "مقبول"
        ? {
            subject: "تم تفعيل حسابك بنجاح",
            content: `
            <h2 style="color: ${primaryColor}; text-align: center; margin-bottom: 20px;">!تم تفعيل حسابك بنجاح</h2>
            <p style="margin: 10px 0; font-size: 16px;">،عزيزي/عزيزتي ${"المستخدم"}</p>
            <p style="margin: 10px 0; font-size: 16px;">.يسرنا إعلامك بأنه تم الموافقة على حسابك بنجاح في منصتنا </p>
            <p style="margin: 10px 0; font-size: 16px;">.يمكنك الآن تسجيل الدخول والاستفادة من جميع الخدمات المقدمة</p>
            
            ${
              process.env.FRONTEND_LOGIN_URL
                ? `
            <div style="text-align: center; margin: 25px 0;">
              <a href="${process.env.FRONTEND_LOGIN_URL}" style="display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
                تسجيل الدخول الآن
              </a>
            </div>
            `
                : ""
            }
            
            <div style="border-top: 1px solid #eee; margin: 20px 0;"></div>
            
            <p style="margin: 10px 0; font-size: 16px;">:في حال واجهتك أي صعوبات، لا تتردد في التواصل مع فريق الدعم </p>
            ${
              process.env.SUPPORT_EMAIL
                ? `
            <p style="margin: 10px 0; font-size: 16px;"><strong>البريد الإلكتروني:</strong> <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: ${primaryColor}; text-decoration: none;">${process.env.SUPPORT_EMAIL}</a></p>
            `
                : ""
            }
          `,
          }
        : {
            subject: "حالة طلب التسجيل",
            content: `
            <h2 style="color: ${primaryColor}; text-align: center; margin-bottom: 20px;">حالة طلب التسجيل</h2>
            <p style="margin: 10px 0; font-size: 16px;">،عزيزي/عزيزتي ${"المستخدم"}</p>
            <p style="margin: 10px 0; font-size: 16px;">.نأسف لإعلامك بأنه لا يمكننا الموافقة على طلب التسجيل الخاص بك في هذا الوقت</p>
            <p style="margin: 10px 0; font-size: 16px;">.إذا كنت تعتقد أن هناك خطأ أو لديك أي استفسارات، يرجى التواصل مع فريق الدعم</p>
            
            <div style="border-top: 1px solid #eee; margin: 20px 0;"></div>
            
            ${
              process.env.SUPPORT_EMAIL
                ? `
            <p style="margin: 10px 0; font-size: 16px;"><strong>:للاتصال بفريق الدعم</strong></p>
            <p style="margin: 10px 0; font-size: 16px;"><a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: ${primaryColor}; text-decoration: none;">${process.env.SUPPORT_EMAIL}</a></p>
            `
                : ""
            }
          `,
          };

    const mailOptions = {
      from: process.env.EMAIL_FROM || "no-reply@example.com",
      to: user.email,
      subject,
      html: emailTemplate(content),
      attachments: [
        {
          filename: "logo.png",
          path: "https://res.cloudinary.com/dmhvfuuke/image/upload/v1748029147/family-logo_z54fug.png",
          cid: "logo",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Account status email sent to ${user.email}: ${info.messageId}`
    );
  } catch (error) {
    console.error("Error sending account status email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  try {
    const subject = "إعادة تعيين كلمة المرور الخاصة بك";

    const content = `
      <h2 style="color: ${primaryColor}; text-align: center; margin-bottom: 20px;">إعادة تعيين كلمة المرور</h2>
      <p style="margin: 10px 0; font-size: 16px;">،عزيزي المستخدم</p>
      <p style="margin: 10px 0; font-size: 16px;">.لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك </p>
      <p style="margin: 10px 0; font-size: 16px;">:لإكمال عملية إعادة التعيين، يرجى الضغط على الزر أدناه</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: ${primaryColor}; color: white; text-decoration: none; border-radius: 4px; font-weight: bold;">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      
      <p style="margin: 10px 0; font-size: 16px;">:أو يمكنك نسخ الرابط التالي ولصقه في متصفحك</p>
      <p style="margin: 10px 0; font-size: 16px; word-break: break-all;">
        <a href="${resetUrl}" style="color: ${primaryColor}; text-decoration: none;">${resetUrl}</a>
      </p>
      
      <div style="border-top: 1px solid #eee; margin: 20px 0;"></div>
      
      <p style="margin: 10px 0; font-size: 16px;">.إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان</p>
      <p style="margin: 10px 0; font-size: 16px;">.لحماية حسابك، لا تشارك هذا الرابط مع أي شخص</p>
      <p style="margin: 10px 0; font-size: 16px;">.ينتهي صلاحية هذا الرابط بعد 24 ساعة</p>
      
      ${
        process.env.SUPPORT_EMAIL
          ? `
      <div style="border-top: 1px solid #eee; margin: 20px 0;"></div>
      <p style="margin: 10px 0; font-size: 16px;">:إذا واجهتك أي مشكلة، يرجى التواصل مع فريق الدعم</p>
      <p style="margin: 10px 0; font-size: 16px;">
        <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: ${primaryColor}; text-decoration: none;">${process.env.SUPPORT_EMAIL}</a>
      </p>
      `
          : ""
      }
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: emailTemplate(content),
      attachments: [
        {
          filename: "logo.png",
          path: "https://res.cloudinary.com/dmhvfuuke/image/upload/v1748029147/family-logo_z54fug.png",
          cid: "logo",
        },
      ],
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

export const sendEmailToUsersWithPermission = async ({
  entity,
  action,
  subject,
  content,
}: {
  entity: string;
  action: "view" | "create" | "update" | "delete";
  subject: string;
  content: string;
}) => {
  try {
    const users = await User.find({
      permissions: {
        $elemMatch: {
          entity,
          [action]: true,
        },
      },
    });

    const emails = users.map((u) => u.email).filter(Boolean);

    if (emails.length === 0) {
      console.log(`No users found with permission to ${action} ${entity}`);
      return;
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emails, // Can be an array
      subject,
      html: emailTemplate(content),
      attachments: [
        {
          filename: "logo.png",
          path: "https://res.cloudinary.com/dmhvfuuke/image/upload/v1748029147/family-logo_z54fug.png",
          cid: "logo",
        },
      ],
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(
      `Email sent to users with '${action}' access on '${entity}':`,
      info.messageId
    );
  } catch (error) {
    console.error("Error sending email to permitted users:", error);
  }
};
