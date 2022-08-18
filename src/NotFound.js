import React from "react";
import { Container } from "react-bootstrap";
import { BsExclamationTriangle } from "react-icons/bs";

export default function NotFound() {
  return (
    <Container
      className="d-flex flex-column align-items-center"
      style={{ marginTop: "80px" }}
    >
      <BsExclamationTriangle size="80"></BsExclamationTriangle>
      <p style={{ fontSize: "24px", margin: "16px 0" }}>
        요청하신 페이지를 찾을 수 없습니다.
      </p>
    </Container>
  );
}
