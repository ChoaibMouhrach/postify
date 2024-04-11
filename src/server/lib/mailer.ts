import { env } from "@/common/env.mjs";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_TOKEN);

type SendMailProps = {
  to: string;
  from: string;
  subject: string;
} & ({ html: string } | { text: string });

export const sendMail = async (input: SendMailProps) => {
  await resend.emails.send({
    to: input.to,
    from: `${input.from}@${env.RESEND_DOMAIN}`,
    subject: input.subject,
    ...("html" in input ? { html: input.html } : { text: input.text }),
  });
};
