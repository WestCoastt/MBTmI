import React from "react";
import GoogleButton from "./GoogleButton";

export default function Register() {
  return (
    <div
      style={{
        top: "0",
        position: "fixed",
        width: "100%",
        height: "100%",
        zIndex: "1031",
        background: "white",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <GoogleButton login={"가입하기"} register={true}></GoogleButton>
      </div>
    </div>
  );
}
