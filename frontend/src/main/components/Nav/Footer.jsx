import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-light pt-3 pt-md-4 pb-4 pb-md-5" data-testid="Footer">
      <Container>
        This app is a class project of{" "}
        <a
          data-testid="footer-class-website-link"
          href="https://ucsb-cs156.github.io"
          target="_blank"
          rel="noopener noreferrer"
        >
          CMPSC 156
        </a>{" "}
        at{" "}
        <a
          data-testid="footer-ucsb-link"
          href="https://ucsb.edu"
          target="_blank"
          rel="noopener noreferrer"
        >
          UCSB
        </a>
        . Check out the source code on{" "}
        <a
          data-testid="footer-source-code-link"
          href={"https://github.com/ucsb-cs156/proj-dining"}
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        ! This is not an official source of UCSB dining commons information. An
        official source can be found{" "}
        <a
          data-testid="footer-dining-search-link"
          href="https://apps.dining.ucsb.edu/menu/day"
          target="_blank"
          rel="noopener noreferrer"
        >
          here
        </a>
        .
      </Container>
    </footer>
  );
}
