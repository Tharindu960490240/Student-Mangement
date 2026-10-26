import "../styles/footer.css";
import {
  Facebook,
  YouTube,
  LinkedIn,
  Email,
  Phone,
  Language,
} from "@mui/icons-material";

import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* ================= COMPANY ================= */}
        <div className="footer-col">
          <div className="footer-brand">
            <img
              src="/assets/footerlogo.png"
              alt=""
              className="footer-logo"
            />
            <h3>{t("footer.companyName")}</h3>
          </div>

          <p className="desc">
            {t("footer.companyDesc")}
          </p>

          <a
            href="https://agrilinkservices.com/"
            target="_blank"
            rel="noreferrer"
          >
            <Language /> {t("footer.website")}
          </a>
        </div>

        {/* ================= CONTACT ================= */}
        <div className="footer-col">
          <h3>{t("footer.contact")}</h3>

          <a href="tel:+94773782149">
            <Phone /> +94 77 378 2149
          </a>

          <a href="tel:+94332310145">
            <Phone /> +94 33 231 0145
          </a>

          <a href="mailto:info@agrilinkservices.com">
            <Email /> info@agrilinkservices.com
          </a>
        </div>

        {/* ================= SOCIAL ================= */}
        <div className="footer-col">
          <h3>{t("footer.followUs")}</h3>

          <a
            href="https://www.youtube.com/@Agri_Link"
            target="_blank"
            rel="noreferrer"
          >
            <YouTube /> {t("footer.youtube")}
          </a>

          <a
            href="https://www.facebook.com/profile.php?id=100085256541352"
            target="_blank"
            rel="noreferrer"
          >
            <Facebook /> {t("footer.facebook")}
          </a>

          <a
            href="https://www.linkedin.com/company/agri-link-services/"
            target="_blank"
            rel="noreferrer"
          >
            <LinkedIn /> {t("footer.linkedin")}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        {t("footer.copyright")}
      </div>
    </footer>
  );
};

export default Footer;
