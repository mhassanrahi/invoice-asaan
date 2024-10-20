import Container from "./Container";
import { APP_NAME } from "../constants";

const Footer = () => {
  return (
    <footer className="mt-12 mb-8">
      <Container className="flex justify-between gap-4">
        <p className="text-sm">
          {APP_NAME} &copy; {new Date().getFullYear()}
        </p>
        <p className="text-sm">Created by Mehmood</p>
      </Container>
    </footer>
  );
};

export default Footer;
