import React from "react";
import { Modal, Container } from "react-bootstrap";
import GoogleButton from "./GoogleButton";

export default function LoginModal(props) {
  return (
    <Modal {...props} aria-labelledby="contained-modal-title-vcenter" centered>
      <Modal.Header closeButton style={{ border: "none" }}></Modal.Header>
      <Modal.Body className="my-5">
        <Container className="d-flex justify-content-center" as="h5">
          로그인 후 이용이 가능합니다.
        </Container>
        <Container className="my-5 py-5 d-flex justify-content-center">
          <GoogleButton login={"계속하기"}></GoogleButton>
        </Container>
      </Modal.Body>
      <Modal.Footer style={{ border: "none" }}></Modal.Footer>
    </Modal>
  );
}
