import "../styles/footer.css";
import {
  Facebook,
  Email,
  Phone,
  Language,
  LocationOn,
} from "@mui/icons-material";

// ===============================
// College details (edit here)
// Source: afcollege.edu.au
// ===============================
const COLLEGE = {
  name: "Australian Federation College",
  description:
    "A registered training organisation with campuses in Launceston, Tasmania and Melbourne, Victoria, delivering industry-relevant vocational education and training.",
  website: "https://www.afcollege.edu.au",
  websiteLabel: "www.afcollege.edu.au",
  phone: "+61 3 6393 3225",
  phoneLink: "+61363933225",
  email: "info@afcollege.edu.au",
  cricos: "03854G",
  rto: "45616",
  campuses: [
    {
      name: "Launceston campus",
      address: "Level 1, 126 Charles St, Launceston TAS 7250",
    },
    {
      name: "Melbourne campus",
      address: "Level 5, 250 Collins St, Melbourne VIC 3000",
    },
  ],
  // Add LinkedIn / Instagram here once you have the official URLs
  social: [
    {
      label: "Facebook",
      href: "https://www.facebook.com/CollegeinLaunceston/",
      Icon: Facebook,
    },
  ],
};

const mapLink = (address) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${COLLEGE.name}, ${address}`,
  )}`;

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        {/* ================= COLLEGE ================= */}
        <div className="footer-col">
          <div className="footer-brand">
            {/* one logo per theme */}
            <img
              src="/assets/afc-logo.svg"
              alt={COLLEGE.name}
              className="footer-logo footer-logo-light"
            />
            <img
              src="/assets/afc-logo-white.svg"
              alt={COLLEGE.name}
              className="footer-logo footer-logo-dark"
            />
          </div>

          <p className="desc">{COLLEGE.description}</p>

          <a href={COLLEGE.website} target="_blank" rel="noreferrer">
            <Language /> {COLLEGE.websiteLabel}
          </a>

          {COLLEGE.social.map(({ label, href, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer">
              <Icon /> {label}
            </a>
          ))}
        </div>

        {/* ================= CAMPUSES ================= */}
        <div className="footer-col">
          <h3>Our campuses</h3>

          {COLLEGE.campuses.map((campus) => (
            <a
              key={campus.name}
              className="footer-address"
              href={mapLink(campus.address)}
              target="_blank"
              rel="noreferrer"
            >
              <LocationOn />
              <span>
                <strong>{campus.name}</strong>
                <br />
                {campus.address}
              </span>
            </a>
          ))}
        </div>

        {/* ================= CONTACT ================= */}
        <div className="footer-col">
          <h3>Contact us</h3>

          <a href={`tel:${COLLEGE.phoneLink}`}>
            <Phone /> {COLLEGE.phone}
          </a>

          <a href={`mailto:${COLLEGE.email}`}>
            <Email /> {COLLEGE.email}
          </a>
        </div>
      </div>

      <div className="footer-bottom">
        © {new Date().getFullYear()} {COLLEGE.name} · CRICOS Provider No.{" "}
        {COLLEGE.cricos} · RTO Code {COLLEGE.rto}
      </div>
    </footer>
  );
};

export default Footer;
