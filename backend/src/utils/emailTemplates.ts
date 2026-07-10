export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  tempPassword: string;
  role: string;
  loginUrl: string;
  appName?: string;
}

/**
 * Returns a clean, professional HTML email for new user welcome using inline styles.
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
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f4f4f5; color: #18181b;">
  <div style="background-color: #f4f4f5; padding: 40px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; border-collapse: collapse;">
      
      <!-- Header -->
      <tr>
        <td style="background: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">${appName}</h1>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding: 32px 24px;">
          <div style="font-size: 18px; font-weight: 600; margin-bottom: 16px;">Bonjour ${userName},</div>
          <div style="font-size: 15px; line-height: 1.6; color: #3f3f46; margin-bottom: 24px;">
            Votre compte ${appName} a été créé avec succès par un administrateur. Vous êtes assigné au rôle de <strong>${roleLabel}</strong>.
          </div>
          
          <!-- Credentials Box -->
          <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 20px; margin-bottom: 24px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              <tr>
                <td style="padding-bottom: 12px;">
                  <span style="font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Identifiant</span>
                </td>
                <td align="right" style="padding-bottom: 12px;">
                  <span style="font-size: 15px; font-weight: 600; color: #18181b;">${userEmail}</span>
                </td>
              </tr>
              <tr>
                <td>
                  <span style="font-size: 13px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.5px;">Mot de passe temporaire</span>
                </td>
                <td align="right">
                  <span style="font-family: monospace; font-size: 16px; font-weight: 600; color: #18181b; letter-spacing: 1px;">${tempPassword}</span>
                </td>
              </tr>
            </table>
          </div>

          <div style="font-size: 13px; color: #52525b; line-height: 1.5; margin-bottom: 32px;">
            Pour des raisons de sécurité, veuillez modifier ce mot de passe temporaire dès votre première connexion.
          </div>

          <!-- CTA Button -->
          <div style="text-align: center; margin-bottom: 16px;">
            <a href="${loginUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; font-weight: 600; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-size: 15px;">Accéder à mon espace</a>
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="text-align: center; padding: 24px; border-top: 1px solid #e4e4e7; background: #fafafa; color: #71717a; font-size: 13px; line-height: 1.5;">
          Cet e-mail est généré automatiquement, merci de ne pas y répondre.<br/>
          &copy; ${new Date().getFullYear()} ${appName}. Tous droits réservés.
        </td>
      </tr>

    </table>
  </div>
</body>
</html>`;
}

/**
 * Returns a clean, professional HTML email for OTP verification using inline styles.
 */
export function buildOtpEmailHtml(otpCode: string, appName: string = 'GestPro'): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vérification de connexion - ${appName}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f4f4f5; color: #18181b;">
  <div style="background-color: #f4f4f5; padding: 40px 16px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e4e4e7; overflow: hidden; border-collapse: collapse;">
      
      <!-- Header -->
      <tr>
        <td style="background: #4f46e5; padding: 32px 24px; text-align: center; color: #ffffff;">
          <h1 style="font-size: 24px; font-weight: 700; margin: 0;">${appName}</h1>
        </td>
      </tr>

      <!-- Content -->
      <tr>
        <td style="padding: 32px 24px; text-align: center;">
          <div style="font-size: 15px; line-height: 1.6; color: #3f3f46; margin-bottom: 24px;">
            Voici votre code de vérification à usage unique pour vous connecter à votre compte.
          </div>
          
          <!-- OTP Box -->
          <div style="background: #fafafa; border: 1px solid #e4e4e7; border-radius: 6px; padding: 24px; margin: 24px auto; max-width: 300px;">
            <p style="font-size: 32px; font-weight: 700; color: #4f46e5; letter-spacing: 8px; font-family: monospace; margin: 0; text-align: center;">${otpCode}</p>
          </div>

          <div style="font-size: 13px; color: #52525b; line-height: 1.5;">
            Ce code expirera dans 5 minutes. Si vous n'avez pas demandé ce code, vous pouvez ignorer cet e-mail.
          </div>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="text-align: center; padding: 24px; border-top: 1px solid #e4e4e7; background: #fafafa; color: #71717a; font-size: 13px; line-height: 1.5;">
          Cet e-mail est généré automatiquement, merci de ne pas y répondre.<br/>
          &copy; ${new Date().getFullYear()} ${appName}. Tous droits réservés.
        </td>
      </tr>

    </table>
  </div>
</body>
</html>`;
}
