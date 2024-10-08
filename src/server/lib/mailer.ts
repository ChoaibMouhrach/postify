import { env } from "@/common/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_TOKEN);

type SendMailProps = {
  to: string;
  from: string;
  subject: string;
  html: string;
};

export const sendMail = async (input: SendMailProps) => {
  await resend.emails.send({
    to: input.to,
    from: `${input.from}@${env.RESEND_DOMAIN}`,
    subject: input.subject,
    html: input.html,
  });
};

export class Mailer {
  private email: string;

  public constructor(email: string) {
    this.email = email;
  }

  public async mail(email: Omit<SendMailProps, "to">): Promise<void> {
    await sendMail({
      from: email.from,
      to: this.email,
      subject: email.subject,
      html: email.html,
    });
  }
}
