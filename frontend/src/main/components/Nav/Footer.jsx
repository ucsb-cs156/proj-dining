import { Container } from "react-bootstrap";

export const space = " ";

export default function Footer(systemInfo) {
  return (
    <footer className="bg-light pt-3 pt-md-4 pb-4 pb-md-5" data-testid="Footer">
      <Container>
        <p>
          This app is a class project of{space}
          <a
            data-testid="footer-class-website-link"
            href="https://ucsb-cs156.github.io"
            target="_blank"
            rel="noopener noreferrer"
          >
            CMPSC 156
          </a>{" "}
          at{space}
          <a href="https://ucsb.edu/">UCSB</a>. Check out the source code on
          {space}
          {systemInfo.systemInfo && (
            <a
              data-testid="footer-source-code-link"
              href={systemInfo.systemInfo.sourceRepo}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          {!systemInfo.systemInfo && (
            <a
              data-testid="footer-source-code-link"
              href={"https://github.com/ucsb-cs156/proj-dining"}
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          )}
          ! This is not an official source of UCSB dining commons information.
          An official source can be found{space}
          <a
            data-testid="footer-course-search-link"
            href="https://apps.dining.ucsb.edu/menu/day"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </a>
          .
        </p>
      </Container>
    </footer>
  );
}
