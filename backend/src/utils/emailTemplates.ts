export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  tempPassword: string;
  role: string;
  loginUrl: string;
  appName?: string;
}

/**
 * Returns a premium, responsive HTML email for new user welcome.
 */
export function buildWelcomeEmailHtml(data: WelcomeEmailData): string {
  const { userName, userEmail, tempPassword, role, loginUrl, appName = 'GestPro' } = data;

  const roleLabel =
    role === 'ADMIN' ? 'Administrateur' :
    role === 'LEAD'  ? 'Chef d\'équipe' :
    role === 'DEV'   ? 'Développeur' : role;

  const roleColor =
    role === 'ADMIN' ? '#6366f1' :
    role === 'LEAD'  ? '#f59e0b' :
    role === 'DEV'   ? '#10b981' : '#6366f1';

  const roleIcon =
    role === 'ADMIN' ? '🛡️' :
    role === 'LEAD'  ? '🏆' :
    role === 'DEV'   ? '💻' : '👤';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bienvenue sur ${appName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #f1f5f9; }
  </style>
</head>
<body>
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9; padding: 40px 16px; min-height: 100vh;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

          <!-- LOGO / HEADER -->
          <tr>
            <td style="text-align:center; padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); border-radius:16px; padding:14px 28px;">
                    <span style="font-size:26px; font-weight:800; color:#ffffff; letter-spacing:-0.5px;">${appName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- MAIN CARD -->
          <tr>
            <td style="background:#ffffff; border-radius:24px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">

              <!-- TOP GRADIENT BANNER -->
              <tr>
                <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #6366f1 100%); padding: 48px 48px 64px; position:relative;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <p style="font-size:13px; font-weight:600; color:rgba(255,255,255,0.7); text-transform:uppercase; letter-spacing:1.5px; margin-bottom:12px;">Bienvenue sur ${appName}</p>
                        <h1 style="font-size:32px; font-weight:800; color:#ffffff; line-height:1.2; margin-bottom:16px;">
                          Bonjour, ${userName} ! 👋
                        </h1>
                        <p style="font-size:16px; color:rgba(255,255,255,0.85); line-height:1.6; max-width:440px;">
                          Votre compte a été créé par un administrateur. Vous pouvez dès maintenant vous connecter à la plateforme.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- BODY CONTENT -->
              <tr>
                <td style="padding: 0 48px 48px; margin-top:-24px; background:#ffffff;">

                  <!-- ROLE BADGE (overlap effect) -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:-28px; margin-bottom:32px;">
                    <tr>
                      <td>
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="background:#ffffff; border:2px solid ${roleColor}33; border-radius:14px; padding:14px 20px; box-shadow:0 4px 16px rgba(0,0,0,0.08);">
                              <table cellpadding="0" cellspacing="0">
                                <tr>
                                  <td style="padding-right:12px; font-size:22px;">${roleIcon}</td>
                                  <td>
                                    <p style="font-size:11px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:1px; margin-bottom:3px;">Votre rôle</p>
                                    <p style="font-size:15px; font-weight:700; color:${roleColor};">${roleLabel}</p>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CREDENTIALS BOX -->
                  <p style="font-size:14px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:1px; margin-bottom:14px;">Vos identifiants de connexion</p>

                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; overflow:hidden; margin-bottom:28px;">
                    <tr>
                      <td style="padding:20px 24px; border-bottom:1px solid #e2e8f0;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">Adresse e-mail</p>
                              <p style="font-size:15px; font-weight:600; color:#1e293b;">${userEmail}</p>
                            </td>
                            <td align="right">
                              <span style="font-size:20px;">📧</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:20px 24px;">
                        <table width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td>
                              <p style="font-size:12px; font-weight:600; color:#94a3b8; text-transform:uppercase; letter-spacing:0.8px; margin-bottom:4px;">Mot de passe temporaire</p>
                              <p style="font-size:18px; font-weight:800; color:#1e293b; font-family:monospace; letter-spacing:2px;">${tempPassword}</p>
                            </td>
                            <td align="right">
                              <span style="font-size:20px;">🔐</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- WARNING -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fffbeb; border:1px solid #fde68a; border-radius:12px; margin-bottom:32px;">
                    <tr>
                      <td style="padding:14px 18px;">
                        <table cellpadding="0" cellspacing="0">
                          <tr>
                            <td style="padding-right:10px; font-size:16px;">⚠️</td>
                            <td style="font-size:13px; color:#92400e; line-height:1.5;">
                              Ce mot de passe est <strong>temporaire</strong>. Veuillez le modifier dès votre première connexion depuis votre profil.
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>

                  <!-- CTA BUTTON -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                    <tr>
                      <td align="center">
                        <a href="${loginUrl}" target="_blank"
                          style="display:inline-block; background:linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color:#ffffff; font-size:16px; font-weight:700; text-decoration:none; padding:16px 40px; border-radius:14px; letter-spacing:0.3px; box-shadow:0 4px 14px rgba(79,70,229,0.4);">
                          Se connecter à ${appName} →
                        </a>
                      </td>
                    </tr>
                  </table>

                  <!-- DIVIDER -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                    <tr>
                      <td style="border-top:1px solid #e2e8f0;"></td>
                    </tr>
                  </table>

                  <!-- FOOTER NOTE -->
                  <p style="font-size:13px; color:#94a3b8; line-height:1.7; text-align:center;">
                    Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail.<br />
                    Des questions ? Contactez votre administrateur.
                  </p>
                </td>
              </tr>

            </td>
          </tr>

          <!-- EMAIL FOOTER -->
          <tr>
            <td style="text-align:center; padding-top:28px;">
              <p style="font-size:12px; color:#94a3b8; margin-bottom:6px;">${appName} — Gestion de projets & équipes</p>
              <p style="font-size:12px; color:#cbd5e1;">© ${new Date().getFullYear()} ${appName}. Tous droits réservés.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
