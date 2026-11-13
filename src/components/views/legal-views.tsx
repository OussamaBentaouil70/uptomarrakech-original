import Link from "next/link";
import type { ReactNode } from "react";
import type { Lang } from "@/lib/types";
import { LEGAL, LEGAL_PATHS, SITE } from "@/lib/site";
import { CookieSettingsLink } from "@/components/cookie-consent";

/* ------------------------------------------------------------------ */
/* Layout                                                              */
/* ------------------------------------------------------------------ */

function LegalLayout({ lang, title, intro, children }: { lang: Lang; title: string; intro: ReactNode; children: ReactNode }) {
  const fr = lang === "fr";
  const updated = new Date(LEGAL.lastUpdated).toLocaleDateString(fr ? "fr-FR" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 sm:py-16">
      <header className="mb-10 space-y-4 border-b border-border/60 pb-8">
        <p className="ui-eyebrow">{fr ? "Informations légales" : "Legal information"}</p>
        <h1 className="ui-section-title">{title}</h1>
        <p className="text-sm text-muted-foreground">{fr ? `Dernière mise à jour : ${updated}` : `Last updated: ${updated}`}</p>
        <div className="ui-prose text-base">{intro}</div>
      </header>
      <div className="prose max-w-none text-base leading-relaxed [&_h2]:mt-10 [&_table]:w-full">{children}</div>
    </div>
  );
}

function Controller({ lang }: { lang: Lang }) {
  const fr = lang === "fr";
  return (
    <ul>
      <li>
        <strong>{fr ? "Raison sociale" : "Company"} :</strong> {LEGAL.companyName}
        {LEGAL.legalForm && ` (${LEGAL.legalForm})`}
      </li>
      <li>
        <strong>{fr ? "Adresse" : "Address"} :</strong> {LEGAL.address}
      </li>
      {LEGAL.rc && (
        <li>
          <strong>{fr ? "Registre du commerce" : "Trade register"} :</strong> {LEGAL.rc}
        </li>
      )}
      {LEGAL.ice && (
        <li>
          <strong>ICE :</strong> {LEGAL.ice}
        </li>
      )}
      <li>
        <strong>Email :</strong> <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a>
      </li>
      <li>
        <strong>{fr ? "Téléphone" : "Phone"} :</strong> <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>
      </li>
      {LEGAL.cndpDeclaration && (
        <li>
          <strong>{fr ? "Déclaration CNDP" : "CNDP declaration"} :</strong> {LEGAL.cndpDeclaration}
        </li>
      )}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Privacy policy                                                      */
/* ------------------------------------------------------------------ */

export function PrivacyView({ lang }: { lang: Lang }) {
  return lang === "fr" ? <PrivacyFr /> : <PrivacyEn />;
}

function PrivacyFr() {
  return (
    <LegalLayout
      lang="fr"
      title="Politique de confidentialité"
      intro={
        <p>
          Cette politique explique quelles données personnelles {LEGAL.companyName} collecte via le site {SITE.url.replace("https://", "")}, pourquoi, combien de
          temps elles sont conservées et comment exercer vos droits. Elle est établie conformément à la loi marocaine n° 09-08 relative à la protection des
          personnes physiques à l’égard du traitement des données à caractère personnel et à son décret d’application n° 2-09-165, ainsi qu’au Règlement
          (UE) 2016/679 (RGPD) lorsque celui-ci s’applique, notamment aux visiteurs situés dans l’Union européenne.
        </p>
      }
    >
      <h2>1. Responsable du traitement</h2>
      <Controller lang="fr" />

      <h2>2. Données que nous collectons</h2>
      <h3>Données que vous nous transmettez</h3>
      <ul>
        <li>
          <strong>Formulaires de contact, de réservation, de devis transport et de vol en montgolfière :</strong> nom, prénom, adresse email, numéro de
          téléphone, date et heure souhaitées, nombre de personnes, type de prestation ou de vol, lieu de séjour, prestation concernée et contenu de votre
          message.
        </li>
        <li>
          <strong>Emails</strong> que vous envoyez à nos adresses (par exemple {LEGAL.privacyEmail}) et leur contenu.
        </li>
        <li>
          <strong>WhatsApp :</strong> si vous nous contactez via WhatsApp, votre numéro et vos messages sont traités via ce service (politique de
          confidentialité de WhatsApp / Meta).
        </li>
      </ul>
      <h3>Données collectées automatiquement</h3>
      <ul>
        <li>
          <strong>Données techniques et de sécurité :</strong> adresse IP, type de navigateur, pages demandées, date et heure, traitées par notre hébergeur
          Cloudflare pour diffuser le site, le protéger contre les attaques et filtrer les envois automatisés (Cloudflare Turnstile sur les formulaires).
        </li>
        <li>
          <strong>Mesure d’audience (uniquement avec votre consentement) :</strong> pages consultées, durée de visite, type d’appareil, localisation
          approximative et identifiants stockés dans des cookies Google Analytics.
        </li>
        <li>
          <strong>Votre choix en matière de cookies</strong>, enregistré dans votre navigateur.
        </li>
      </ul>
      <p>Nous ne collectons pas de données sensibles et ne vendons aucune donnée personnelle.</p>

      <h2>3. Finalités et bases légales</h2>
      <table>
        <thead>
          <tr>
            <th>Finalité</th>
            <th>Base légale</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Répondre à vos demandes, établir des devis, organiser et confirmer vos réservations, vous envoyer un email de confirmation</td>
            <td>Mesures précontractuelles et exécution du contrat (art. 4 loi 09-08 ; art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Transmettre votre réservation à l’établissement partenaire concerné (restaurant, villa, club, loueur, prestataire d’activité…)</td>
            <td>Exécution du contrat (art. 4 loi 09-08 ; art. 6.1.b RGPD)</td>
          </tr>
          <tr>
            <td>Sécuriser le site et les formulaires, prévenir le spam et les abus</td>
            <td>Intérêt légitime de {LEGAL.companyName} (art. 6.1.f RGPD)</td>
          </tr>
          <tr>
            <td>Mesurer l’audience du site pour l’améliorer</td>
            <td>Votre consentement, retirable à tout moment (art. 4 loi 09-08 ; art. 6.1.a RGPD)</td>
          </tr>
          <tr>
            <td>Respecter nos obligations légales, comptables et fiscales</td>
            <td>Obligation légale (art. 6.1.c RGPD)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Destinataires des données</h2>
      <ul>
        <li>L’équipe de {LEGAL.companyName}, dans la limite de ses attributions.</li>
        <li>
          Les établissements et prestataires partenaires concernés par votre demande, uniquement pour les données nécessaires à la réservation (nom, date,
          nombre de personnes, coordonnées).
        </li>
        <li>
          Nos sous-traitants techniques : <strong>Cloudflare, Inc.</strong> (hébergement, sécurité, routage des emails, Turnstile),{" "}
          <strong>Brevo (Sendinblue SAS, France)</strong> (envoi des emails liés aux formulaires), <strong>Google LLC / Google Ireland Ltd</strong> (messagerie
          Gmail et, avec votre consentement, Google Analytics).
        </li>
        <li>Les autorités administratives ou judiciaires, lorsque la loi l’exige.</li>
      </ul>

      <h2>5. Transferts de données hors du Maroc et de l’Union européenne</h2>
      <p>
        Certains de nos prestataires traitent des données en dehors du Maroc : dans l’Union européenne (Brevo, France) et aux États-Unis (Cloudflare,
        Google). Ces transferts sont effectués conformément aux articles 43 et 44 de la loi 09-08 (vers des pays assurant un niveau de protection suffisant,
        sur autorisation de la CNDP ou avec le consentement de la personne concernée). Pour les personnes relevant du RGPD, les transferts vers les
        États-Unis reposent sur le cadre de protection des données UE–États-Unis (Data Privacy Framework), auquel Cloudflare et Google sont certifiés, et/ou
        sur les clauses contractuelles types de la Commission européenne.
      </p>

      <h2>6. Durées de conservation</h2>
      <ul>
        <li>Demandes de contact ou de réservation sans suite : 3 ans à compter du dernier échange.</li>
        <li>Réservations réalisées : pendant la relation commerciale, puis le temps des délais légaux (10 ans pour les pièces comptables).</li>
        <li>Cookies de mesure d’audience : 13 mois maximum ; données Google Analytics associées : 14 mois.</li>
        <li>Votre choix en matière de cookies : 6 mois, après quoi nous vous redemandons votre accord.</li>
        <li>Journaux techniques de sécurité : durée limitée fixée par notre hébergeur.</li>
      </ul>

      <h2>7. Cookies et traceurs</h2>
      <table>
        <thead>
          <tr>
            <th>Catégorie</th>
            <th>Exemples</th>
            <th>Consentement</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Strictement nécessaires (sécurité, mémorisation de votre choix)</td>
            <td>Enregistrement local « upto-consent », cookies de sécurité Cloudflare (__cf_bm, cf_clearance)</td>
            <td>Non requis</td>
          </tr>
          <tr>
            <td>Mesure d’audience</td>
            <td>Google Analytics (_ga, _ga_*)</td>
            <td>Requis : déposés uniquement si vous acceptez</td>
          </tr>
        </tbody>
      </table>
      <p>
        Aucun cookie non essentiel n’est déposé avant votre choix. Vous pouvez modifier votre choix à tout moment : <CookieSettingsLink lang="fr" />.
      </p>

      <h2>8. Vos droits</h2>
      <p>Conformément à la loi 09-08 (articles 7 à 9) et, le cas échéant, au RGPD (articles 15 à 22), vous disposez des droits suivants :</p>
      <ul>
        <li>
          <strong>Accès</strong> : obtenir la confirmation que vos données sont traitées et en recevoir une copie.
        </li>
        <li>
          <strong>Rectification</strong> : faire corriger des données inexactes ou incomplètes.
        </li>
        <li>
          <strong>Effacement</strong> : demander la suppression de vos données, sauf obligation légale de conservation.
        </li>
        <li>
          <strong>Opposition</strong> : vous opposer, pour des motifs légitimes, à un traitement, et sans motif à toute prospection.
        </li>
        <li>
          <strong>Limitation</strong> : demander le gel temporaire d’un traitement (RGPD).
        </li>
        <li>
          <strong>Portabilité</strong> : recevoir les données que vous nous avez fournies dans un format structuré et lisible par machine (RGPD).
        </li>
        <li>
          <strong>Retrait du consentement</strong> à tout moment, sans remettre en cause les traitements déjà effectués.
        </li>
      </ul>
      <h3>Comment exercer vos droits</h3>
      <p>
        Écrivez-nous à <a href={`mailto:${LEGAL.privacyEmail}?subject=Données personnelles`}>{LEGAL.privacyEmail}</a> (objet : « Données personnelles ») ou
        par courrier à l’adresse indiquée à l’article 1. En cas de doute raisonnable sur votre identité, nous pourrons vous demander un justificatif. Nous
        répondons dans un délai d’un mois, prolongeable de deux mois pour les demandes complexes.
      </p>

      <h2>9. Réclamation auprès d’une autorité de contrôle</h2>
      <ul>
        <li>
          <strong>Au Maroc :</strong> la Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP), Angle Boulevard
          Annakhil et Avenue Mehdi Ben Barka, Immeuble Les Patios, Hay Riad, Rabat –{" "}
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">
            www.cndp.ma
          </a>
          .
        </li>
        <li>
          <strong>Dans l’Union européenne :</strong> l’autorité de protection des données de votre pays de résidence, de travail ou du lieu de la violation
          (par exemple la CNIL en France,{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </a>
          ). La liste des autorités européennes est disponible sur{" "}
          <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_fr" target="_blank" rel="noopener noreferrer">
            edpb.europa.eu
          </a>
          .
        </li>
      </ul>

      <h2>10. Sécurité</h2>
      <p>
        Le site est servi exclusivement en HTTPS. L’accès aux données est limité aux personnes qui en ont besoin, et nos prestataires sont sélectionnés
        pour leurs garanties de sécurité et de confidentialité.
      </p>

      <h2>11. Mineurs</h2>
      <p>Nos services s’adressent aux personnes majeures. Les mineurs de moins de 16 ans ne doivent pas nous transmettre de données sans l’accord de leurs parents.</p>

      <h2>12. Modifications</h2>
      <p>
        Nous pouvons mettre à jour cette politique ; la date de dernière mise à jour figure en haut de la page. Voir aussi nos{" "}
        <Link href={LEGAL_PATHS.terms.fr}>conditions générales d’utilisation</Link>.
      </p>
    </LegalLayout>
  );
}

function PrivacyEn() {
  return (
    <LegalLayout
      lang="en"
      title="Privacy policy"
      intro={
        <p>
          This policy explains what personal data {LEGAL.companyName} collects through {SITE.url.replace("https://", "")}, why, how long it is kept and how
          to exercise your rights. It complies with Moroccan Law No. 09-08 on the protection of individuals with regard to the processing of personal data
          and its implementing Decree No. 2-09-165, and with Regulation (EU) 2016/679 (GDPR) where it applies, in particular to visitors located in the
          European Union.
        </p>
      }
    >
      <h2>1. Data controller</h2>
      <Controller lang="en" />

      <h2>2. Data we collect</h2>
      <h3>Data you provide</h3>
      <ul>
        <li>
          <strong>Contact, booking, transport quote and hot air balloon forms:</strong> first and last name, email address, phone number, preferred date
          and time, number of people, type of service or flight, place of stay, the service concerned and the content of your message.
        </li>
        <li>
          <strong>Emails</strong> you send to our addresses (for example {LEGAL.privacyEmail}) and their content.
        </li>
        <li>
          <strong>WhatsApp:</strong> if you contact us via WhatsApp, your number and messages are processed through that service (WhatsApp / Meta privacy
          policy).
        </li>
      </ul>
      <h3>Data collected automatically</h3>
      <ul>
        <li>
          <strong>Technical and security data:</strong> IP address, browser type, requested pages, date and time, processed by our host Cloudflare to serve
          the site, protect it against attacks and filter automated submissions (Cloudflare Turnstile on forms).
        </li>
        <li>
          <strong>Audience measurement (only with your consent):</strong> pages viewed, visit duration, device type, approximate location and identifiers
          stored in Google Analytics cookies.
        </li>
        <li>
          <strong>Your cookie choice</strong>, stored in your browser.
        </li>
      </ul>
      <p>We do not collect sensitive data and we never sell personal data.</p>

      <h2>3. Purposes and legal bases</h2>
      <table>
        <thead>
          <tr>
            <th>Purpose</th>
            <th>Legal basis</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Answering your requests, preparing quotes, organising and confirming your bookings, sending you a confirmation email</td>
            <td>Pre-contractual steps and performance of a contract (art. 4 Law 09-08; art. 6(1)(b) GDPR)</td>
          </tr>
          <tr>
            <td>Passing your booking on to the partner establishment concerned (restaurant, villa, club, car rental, activity provider…)</td>
            <td>Performance of a contract (art. 4 Law 09-08; art. 6(1)(b) GDPR)</td>
          </tr>
          <tr>
            <td>Securing the site and forms, preventing spam and abuse</td>
            <td>Legitimate interest of {LEGAL.companyName} (art. 6(1)(f) GDPR)</td>
          </tr>
          <tr>
            <td>Measuring site audience to improve it</td>
            <td>Your consent, which you can withdraw at any time (art. 4 Law 09-08; art. 6(1)(a) GDPR)</td>
          </tr>
          <tr>
            <td>Complying with legal, accounting and tax obligations</td>
            <td>Legal obligation (art. 6(1)(c) GDPR)</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Recipients</h2>
      <ul>
        <li>The {LEGAL.companyName} team, within the limits of their duties.</li>
        <li>
          The partner establishments and providers involved in your request, only for the data needed for the booking (name, date, number of people,
          contact details).
        </li>
        <li>
          Our technical processors: <strong>Cloudflare, Inc.</strong> (hosting, security, email routing, Turnstile),{" "}
          <strong>Brevo (Sendinblue SAS, France)</strong> (sending form-related emails), <strong>Google LLC / Google Ireland Ltd</strong> (Gmail mailbox and,
          with your consent, Google Analytics).
        </li>
        <li>Administrative or judicial authorities where required by law.</li>
      </ul>

      <h2>5. International transfers</h2>
      <p>
        Some of our providers process data outside Morocco: in the European Union (Brevo, France) and in the United States (Cloudflare, Google). These
        transfers are carried out in accordance with Articles 43 and 44 of Law 09-08 (to countries ensuring an adequate level of protection, with CNDP
        authorisation or with the data subject’s consent). For people covered by the GDPR, transfers to the United States rely on the EU–U.S. Data Privacy
        Framework, under which Cloudflare and Google are certified, and/or on the European Commission’s Standard Contractual Clauses.
      </p>

      <h2>6. Retention periods</h2>
      <ul>
        <li>Contact or booking requests that do not lead to a booking: 3 years from the last exchange.</li>
        <li>Completed bookings: for the duration of the business relationship, then for the statutory periods (10 years for accounting records).</li>
        <li>Audience measurement cookies: 13 months maximum; associated Google Analytics data: 14 months.</li>
        <li>Your cookie choice: 6 months, after which we ask you again.</li>
        <li>Technical security logs: a limited period set by our host.</li>
      </ul>

      <h2>7. Cookies and trackers</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Examples</th>
            <th>Consent</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Strictly necessary (security, remembering your choice)</td>
            <td>Local storage entry “upto-consent”, Cloudflare security cookies (__cf_bm, cf_clearance)</td>
            <td>Not required</td>
          </tr>
          <tr>
            <td>Audience measurement</td>
            <td>Google Analytics (_ga, _ga_*)</td>
            <td>Required: only set if you accept</td>
          </tr>
        </tbody>
      </table>
      <p>
        No non-essential cookie is set before you make a choice. You can change your choice at any time: <CookieSettingsLink lang="en" />.
      </p>

      <h2>8. Your rights</h2>
      <p>Under Law 09-08 (Articles 7 to 9) and, where applicable, the GDPR (Articles 15 to 22), you have the following rights:</p>
      <ul>
        <li>
          <strong>Access</strong>: confirmation that your data is processed and a copy of it.
        </li>
        <li>
          <strong>Rectification</strong>: correction of inaccurate or incomplete data.
        </li>
        <li>
          <strong>Erasure</strong>: deletion of your data, unless we must keep it by law.
        </li>
        <li>
          <strong>Objection</strong>: to object to processing on legitimate grounds, and to any direct marketing without giving a reason.
        </li>
        <li>
          <strong>Restriction</strong>: temporary freezing of processing (GDPR).
        </li>
        <li>
          <strong>Portability</strong>: receiving the data you provided in a structured, machine-readable format (GDPR).
        </li>
        <li>
          <strong>Withdrawal of consent</strong> at any time, without affecting processing already carried out.
        </li>
      </ul>
      <h3>How to exercise your rights</h3>
      <p>
        Email <a href={`mailto:${LEGAL.privacyEmail}?subject=Personal data`}>{LEGAL.privacyEmail}</a> (subject: “Personal data”) or write to the address in
        section 1. If we have reasonable doubts about your identity, we may ask for proof. We reply within one month, which may be extended by two months
        for complex requests.
      </p>

      <h2>9. Complaints to a supervisory authority</h2>
      <ul>
        <li>
          <strong>In Morocco:</strong> the Commission Nationale de contrôle de la protection des Données à caractère Personnel (CNDP), Angle Boulevard
          Annakhil et Avenue Mehdi Ben Barka, Immeuble Les Patios, Hay Riad, Rabat –{" "}
          <a href="https://www.cndp.ma" target="_blank" rel="noopener noreferrer">
            www.cndp.ma
          </a>
          .
        </li>
        <li>
          <strong>In the European Union:</strong> the data protection authority of your country of residence, place of work or place of the alleged
          infringement (for example the CNIL in France,{" "}
          <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">
            www.cnil.fr
          </a>
          ). The list of EU authorities is available at{" "}
          <a href="https://edpb.europa.eu/about-edpb/about-edpb/members_en" target="_blank" rel="noopener noreferrer">
            edpb.europa.eu
          </a>
          .
        </li>
      </ul>

      <h2>10. Security</h2>
      <p>
        The site is served over HTTPS only. Access to data is limited to those who need it, and our providers are chosen for their security and
        confidentiality guarantees.
      </p>

      <h2>11. Minors</h2>
      <p>Our services are intended for adults. Children under 16 should not send us personal data without their parents’ consent.</p>

      <h2>12. Changes</h2>
      <p>
        We may update this policy; the date of the last update is shown at the top of the page. See also our <Link href={LEGAL_PATHS.terms.en}>terms of use</Link>.
      </p>
    </LegalLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Terms of use (CGU)                                                  */
/* ------------------------------------------------------------------ */

export function TermsView({ lang }: { lang: Lang }) {
  return lang === "fr" ? <TermsFr /> : <TermsEn />;
}

function TermsFr() {
  return (
    <LegalLayout
      lang="fr"
      title="Conditions générales d’utilisation"
      intro={
        <p>
          Les présentes conditions générales d’utilisation (CGU) encadrent l’accès et l’utilisation du site {SITE.url.replace("https://", "")}. En naviguant
          sur le site ou en utilisant ses formulaires, vous acceptez ces CGU.
        </p>
      }
    >
      <h2>1. Éditeur et hébergeur</h2>
      <Controller lang="fr" />
      <p>
        <strong>Hébergement :</strong> {LEGAL.hosting}.
      </p>

      <h2>2. Objet du site</h2>
      <p>
        {LEGAL.companyName} est un service de conciergerie à Marrakech. Le site présente une sélection d’hébergements, de restaurants, de boîtes de nuit, de
        beach clubs, de spas, d’activités, de solutions de transport et d’organisation d’événements, et permet de nous envoyer des demandes d’information,
        de devis ou de réservation.
      </p>

      <h2>3. Demandes de réservation</h2>
      <ul>
        <li>L’envoi d’un formulaire constitue une demande et non une réservation ferme. La réservation n’est confirmée qu’après accord écrit de notre équipe.</li>
        <li>Les prix affichés (« à partir de ») sont indicatifs et peuvent varier selon la date, la saison, la durée et le nombre de personnes.</li>
        <li>
          Les prestations sont exécutées par les établissements partenaires selon leurs propres conditions (horaires, acompte, annulation, règlement
          intérieur), qui vous sont communiquées avant confirmation. Sauf mention contraire, le paiement s’effectue sur place auprès de l’établissement.
        </li>
        <li>Les photos et descriptions sont fournies à titre illustratif et ne sont pas contractuelles.</li>
      </ul>

      <h2>4. Accès au site</h2>
      <p>
        Le site est accessible gratuitement. Nous nous efforçons d’en assurer la disponibilité, sans pouvoir la garantir ; l’accès peut être interrompu
        pour maintenance, mise à jour ou en cas de force majeure.
      </p>

      <h2>5. Utilisation des formulaires</h2>
      <ul>
        <li>Vous vous engagez à fournir des informations exactes et à ne pas utiliser l’identité d’un tiers.</li>
        <li>
          Sont interdits l’envoi de messages automatisés, de contenus illicites, injurieux ou publicitaires non sollicités, ainsi que toute tentative de
          perturber le fonctionnement du site. Les formulaires sont protégés par un dispositif anti-robot (Cloudflare Turnstile).
        </li>
      </ul>

      <h2>6. Responsabilité</h2>
      <p>
        Les informations du site sont fournies de bonne foi et mises à jour régulièrement, mais peuvent comporter des inexactitudes. {LEGAL.companyName} ne
        saurait être tenue responsable de l’exécution des prestations par les établissements partenaires, au-delà de ses propres engagements de conseil, de
        mise en relation et de suivi de votre demande, ni des dommages résultant d’une utilisation du site non conforme aux présentes CGU.
      </p>

      <h2>7. Propriété intellectuelle</h2>
      <p>
        Les textes, logos, photographies, graphismes et la structure du site sont protégés par la loi n° 2-00 relative aux droits d’auteur et droits
        voisins et appartiennent à {LEGAL.companyName} ou à leurs titulaires respectifs (notamment les établissements partenaires). Toute reproduction ou
        réutilisation sans autorisation écrite préalable est interdite.
      </p>

      <h2>8. Liens externes</h2>
      <p>
        Le site peut contenir des liens vers des sites tiers (réseaux sociaux, WhatsApp, sites des établissements). Nous n’exerçons aucun contrôle sur ces
        sites et déclinons toute responsabilité quant à leur contenu.
      </p>

      <h2>9. Données personnelles</h2>
      <p>
        Le traitement de vos données est décrit dans notre <Link href={LEGAL_PATHS.privacy.fr}>politique de confidentialité</Link>.
      </p>

      <h2>10. Modification des CGU</h2>
      <p>Nous pouvons modifier les présentes CGU à tout moment. La version applicable est celle en ligne au moment de votre visite.</p>

      <h2>11. Droit applicable et litiges</h2>
      <p>
        Les présentes CGU sont régies par le droit marocain. En cas de litige, une solution amiable sera recherchée en priorité ; à défaut, les tribunaux
        compétents de Marrakech seront saisis. Ces dispositions ne privent pas le consommateur de la protection que lui accordent les règles impératives de
        la loi n° 31-08 édictant des mesures de protection du consommateur ou, pour les consommateurs résidant dans l’Union européenne, celles de leur pays
        de résidence.
      </p>

      <h2>12. Contact</h2>
      <p>
        Pour toute question : <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> ou <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>.
      </p>
    </LegalLayout>
  );
}

function TermsEn() {
  return (
    <LegalLayout
      lang="en"
      title="Terms of use"
      intro={
        <p>
          These terms of use govern access to and use of {SITE.url.replace("https://", "")}. By browsing the site or using its forms, you accept these
          terms.
        </p>
      }
    >
      <h2>1. Publisher and host</h2>
      <Controller lang="en" />
      <p>
        <strong>Hosting:</strong> {LEGAL.hosting.replace("États-Unis", "United States")}.
      </p>

      <h2>2. Purpose of the site</h2>
      <p>
        {LEGAL.companyName} is a concierge service in Marrakech. The site presents a selection of accommodation, restaurants, nightclubs, beach clubs, spas,
        activities, transport solutions and event planning, and lets you send us requests for information, quotes or bookings.
      </p>

      <h2>3. Booking requests</h2>
      <ul>
        <li>Submitting a form is a request, not a firm booking. A booking is only confirmed after written agreement from our team.</li>
        <li>Prices shown (“from”) are indicative and may vary with the date, season, length of stay and number of people.</li>
        <li>
          Services are provided by partner establishments under their own conditions (opening hours, deposit, cancellation, house rules), which are
          communicated to you before confirmation. Unless stated otherwise, payment is made on site to the establishment.
        </li>
        <li>Photos and descriptions are for illustration only and are not contractual.</li>
      </ul>

      <h2>4. Access to the site</h2>
      <p>
        The site is free to access. We do our best to keep it available but cannot guarantee it; access may be interrupted for maintenance, updates or in
        case of force majeure.
      </p>

      <h2>5. Use of the forms</h2>
      <ul>
        <li>You agree to provide accurate information and not to use another person’s identity.</li>
        <li>
          Automated messages, unlawful, abusive or unsolicited advertising content, and any attempt to disrupt the site are prohibited. Forms are protected
          by an anti-bot system (Cloudflare Turnstile).
        </li>
      </ul>

      <h2>6. Liability</h2>
      <p>
        Information on the site is provided in good faith and updated regularly but may contain inaccuracies. {LEGAL.companyName} cannot be held liable for
        the performance of services by partner establishments beyond its own commitments to advise, connect and follow up on your request, nor for damage
        resulting from use of the site contrary to these terms.
      </p>

      <h2>7. Intellectual property</h2>
      <p>
        The texts, logos, photographs, graphics and structure of the site are protected by Moroccan Law No. 2-00 on copyright and related rights and belong
        to {LEGAL.companyName} or their respective owners (in particular partner establishments). Any reproduction or reuse without prior written
        permission is prohibited.
      </p>

      <h2>8. External links</h2>
      <p>
        The site may contain links to third-party sites (social networks, WhatsApp, establishments’ websites). We have no control over these sites and
        accept no liability for their content.
      </p>

      <h2>9. Personal data</h2>
      <p>
        How we process your data is described in our <Link href={LEGAL_PATHS.privacy.en}>privacy policy</Link>.
      </p>

      <h2>10. Changes to these terms</h2>
      <p>We may change these terms at any time. The applicable version is the one online at the time of your visit.</p>

      <h2>11. Governing law and disputes</h2>
      <p>
        These terms are governed by Moroccan law. In the event of a dispute, an amicable solution will be sought first; failing that, the competent courts
        of Marrakech will have jurisdiction. This does not deprive consumers of the protection afforded by the mandatory rules of Law No. 31-08 on consumer
        protection or, for consumers residing in the European Union, by those of their country of residence.
      </p>

      <h2>12. Contact</h2>
      <p>
        For any question: <a href={`mailto:${LEGAL.privacyEmail}`}>{LEGAL.privacyEmail}</a> or <a href={SITE.phoneHref}>{SITE.phoneDisplay}</a>.
      </p>
    </LegalLayout>
  );
}
