import { sendEmail } from "../utils/email.js";
import nodemailer from "nodemailer";

beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
  jest.spyOn(console, "log").mockImplementation(() => {});
});

jest.mock("nodemailer");

describe("sendEmail()", () => {
  let mockSendMail;

  beforeAll(() => {
    process.env.EMAIL_USER = "testuser@example.com";
    process.env.EMAIL_PASSWORD = "testpassword";
    process.env.SUPPORT_EMAIL = "support@example.com";
  });

  beforeEach(() => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: "12345" });

    nodemailer.createTransport.mockReturnValue({
      sendMail: mockSendMail
    });
  });

  it("Envoie un email correctement", async () => {
    const to = "client@example.com";
    const subject = "Sujet test";
    const text = "Votre code de vérification est : 123456";

    const result = await sendEmail(to, subject, text);

    // Vérifie que createTransport a été appelé avec la bonne config
    expect(nodemailer.createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    }));

    // Vérifie que sendMail a été appelé
    expect(mockSendMail).toHaveBeenCalled();

    // Vérifie les champs envoyés
    const mailOptions = mockSendMail.mock.calls[0][0];

    expect(mailOptions.to).toBe(to);
    expect(mailOptions.subject).toBe(subject);
    expect(mailOptions.text).toBe(text);
    expect(mailOptions.from.address).toBe(process.env.SUPPORT_EMAIL);

    expect(result).toHaveProperty("messageId", "12345");
  });

  it("Lève une erreur si sendMail échoue", async () => {
    const error = new Error("SMTP ERROR");

    mockSendMail.mockRejectedValueOnce(error);

    await expect(
      sendEmail("client@example.com", "Erreur test", "Message")
    ).rejects.toThrow("SMTP ERROR");
  });
});
