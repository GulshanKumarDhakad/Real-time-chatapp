import amqp from 'amqplib';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
export const startSendOtpConsumer = async () => {
    console.log("SMTP USERsss =", process.env.User);
    // console.log("SMTP PASS length =", process.env.PASSWORD);
    try {
        const connection = await amqp.connect({
            protocol: "amqp",
            hostname: process.env.Rabbitmq_Host,
            port: 5672,
            username: process.env.Rabbitmq_Username,
            password: process.env.Rabbitmq_Password
        });
        const channel = await connection.createChannel();
        const queueName = "send-otp";
        await channel.assertQueue(queueName, { durable: true });
        console.log("✅ mail service started, listening for otp emails");
        channel.consume(queueName, async (msg) => {
            if (msg) {
                try {
                    const { to, subject, body } = JSON.parse(msg.content.toString());
                    const transporter = nodemailer.createTransport({
                        host: "smtp.gmail.com",
                        port: 465,
                        auth: {
                            user: process.env.User,
                            pass: process.env.PASSWORD,
                        }
                    });
                    await transporter.sendMail({
                        from: "Chat app",
                        to,
                        subject,
                        text: body,
                    });
                    console.log(`OTP mail send to ${to}`);
                    channel.ack(msg);
                }
                catch (err) {
                    console.log("Failed to sned OTP ", err);
                }
            }
        });
    }
    catch (err) {
        console.log("Failed to start rabbitmq consumer ", err);
    }
};
//# sourceMappingURL=consumer.js.map