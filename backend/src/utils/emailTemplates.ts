export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  tempPassword: string;
  role: string;
  loginUrl: string;
  appName?: string;
}

/**
 * Returns a clean, professional HTML email for new user welcome.
 */
export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const { userName, userEmail, tempPassword, role, loginUrl, appName = 'GestPro' } = data;

  const roleLabel =
    role === 'ADMIN' ? 'Administrateur' :
    role === 'LEAD'  ? 'Chef d\'équipe' :
    role === 'DEV'   ? 'Développeur' : role;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue sur ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f4f4f5; color: #18181b; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; }
    .header { background: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .content { padding: 32px 24px; }
    .greeting { font-size: 18px; font-weight: 600; margin-bottom: 16px; }
    .text { font-size: 15px; line-height: 1.6; color: #3f3f46; margin-bottom: 24px; }
    .credentials-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 20px; margin-bottom: 24px; }
    .cred-row { display: flex; justify-content: space-between; margin-bottom: 12px; }
    .cred-row:last-child { margin-bottom: 0; }
    .cred-label { font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px; }
    .cred-value { font-size: 15px; font-weight: 600; color: #18181b; }
    .cred-value.password { font-family: monospace; font-size: 16px; letter-spacing: 1px; }
    .button-container { text-align: center; margin: 32px 0; }
    .button { display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 15px; }
    .footer { text-align: center; padding: 24px; border-top: 1px solid #e4e4e7; background: #fafafa; color: #71717a; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <div class="greeting">Bonjour ${userName},</div>
      <div class="text">
        Votre compte ${appName} a été créé avec succès par un administrateur. Vous êtes assigné au rôle de <strong>${roleLabel}</strong>.
      </div>
      
      <div class="credentials-box">
        <div class="cred-row">
          <span class="cred-label">Identifiant</span>
          <span class="cred-value">${userEmail}</span>
        </div>
        <div class="cred-row">
          <span class="cred-label">Mot de passe temporaire</span>
          <span class="cred-value password">${tempPassword}</span>
        </div>
      </div>

      <div class="text" style="font-size: 13px; color: #52525b;">
        Pour des raisons de sécurité, veuillez modifier ce mot de passe temporaire dès votre première connexion.
      </div>

      <div class="button-container">
        <a href="${loginUrl}" class="button">Accéder à mon espace</a>
      </div>
    </div>
    <div class="footer">
      Cet e-mail est généré automatiquement, merci de ne pas y répondre.<br/>
      &copy; ${new Date().getFullYear()} ${appName}. Tous droits réservés.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Returns a clean, professional HTML email for OTP verification.
 */
export function buildOtpEmailHtml(otpCode: string, appName: string = 'GestPro'): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérification de connexion - ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f4f4f5; color: #18181b; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; }
    .header { background: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { font-size: 24px; font-weight: 700; margin: 0; }
    .content { padding: 32px 24px; text-align: center; }
    .text { font-size: 15px; line-height: 1.6; color: #3f3f46; margin-bottom: 24px; }
    .otp-box { background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 24px; margin: 24px auto; max-width: 300px; }
    .otp-code { font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: 8px; font-family: monospace; margin: 0; }
    .footer { text-align: center; padding: 24px; border-top: 1px solid #e4e4e7; background: #fafafa; color: #71717a; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${appName}</h1>
    </div>
    <div class="content">
      <div class="text">
        Voici votre code de vérification à usage unique pour vous connecter à votre compte.
      </div>
      
      <div class="otp-box">
        <p class="otp-code">${otpCode}</p>
      </div>

      <div class="text" style="font-size: 13px; color: #52525b;">
        Ce code expirera dans 5 minutes. Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.
      </div>
    </div>
    <div class="footer">
      Cet e-mail est généré automatiquement, merci de ne pas y répondre.<br/>
      &copy; ${new Date().getFullYear()} ${appName}. Tous droits réservés.
    </div>
  </div>
</body>
</html>`;
}
