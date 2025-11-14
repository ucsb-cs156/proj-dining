import { Container } from "react-bootstrap";

export const space = " ";

export default function Footer() {
  return (
    <footer className="bg-light pt-3 pt-md-4 pb-4 pb-md-5" data-testid="Footer">
      <Container>
        <p>
          This app is a class project of{space}
          <a href="https://ucsb-cs156.github.io/">CMPSC 156</a> at{space}
          <a href="https://ucsb.edu/">UCSB</a>. Check out the source code on
          {space}
          <a href="https://github.com/ucsb-cs156/proj-dining">GitHub</a>! This
          is not an official source of UCSB dining commons information. An
          official source can be found{space}
          <a href="https://apps.dining.ucsb.edu/menu/day">here</a>.
        </p>
      </Container>
    </footer>
  );
}
