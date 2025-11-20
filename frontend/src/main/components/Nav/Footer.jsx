import { Container } from "react-bootstrap";

export default function Footer() {
  return (
    <footer className="bg-light pt-3 pt-md-4 pb-4 pb-md-5" data-testid="Footer">
      <Container>
        <p>
          This app is a class project of{" "}
          <a href="https://ucsb-cs156.github.io/">CMPSC 156</a> at{" "}
          <a href="https://ucsb.edu/">UCSB</a>. Check out the source code on{" "}
          <a href="https://github.com/ucsb-cs156/proj-dining">GitHub</a>! This
          is not an official source of UCSB dining commons information. An
          official source can be found{" "}
          <a href="https://apps.dining.ucsb.edu/menu/day">here</a>.
        </p>
      </Container>
    </footer>
  );
}
