/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Col, Row, Button, Form, Container } from "react-bootstrap";
import { db } from "./index.js";
import { getAuth } from "firebase/auth";

export default function UserInfo(props) {
  const history = useHistory();
  const fullYear = new Date().getFullYear();

  const yearOptions = [...Array(80)].map((v, i) => fullYear - 79 + i);
  const monthOptions = [...Array(12)].map((v, i) => 1 + i);
  const dateOptions = [...Array(31)].map((v, i) => 1 + i);

  const MBTI = [
    "ISTJ",
    "ISFJ",
    "ISTP",
    "ISFP",
    "INTJ",
    "INFJ",
    "INTP",
    "INFP",
    "ESTJ",
    "ESFJ",
    "ESTP",
    "ESFP",
    "ENTJ",
    "ENFJ",
    "ENTP",
    "ENFP",
  ];

  const sex = ["남", "여"];

  const auth = getAuth();
  const user = auth.currentUser;
  const [nickCheck, setNickCheck] = useState("");
  const [nickname, setNickname] = useState("");
  const [mbti, setMBTI] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [gender, setGender] = useState("");
  const [color, setColor] = useState("");
  const birthDay = `${year}-${month}-${date}`;

  useEffect(() => {
    let regExp = /^[a-zA-Z가-힣0-9_]{2,16}$/;
    if (regExp.test(nickname) === true) {
      db.collection("user-info")
        .where("nickname", "!=", nickname)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setNickCheck("사용 가능한 닉네임입니다");
          });
        });
      db.collection("user-info")
        .where("nickname", "==", nickname)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setNickCheck("이미 사용중 입니다");
          });
        });
    } else if (regExp.test(nickname) === false) {
      setNickCheck("2~16자의 한글, 영문, 숫자, 언더바( _ )만 가능");
    }
  }, [nickname]);

  useEffect(() => {
    if (nickCheck === "사용 가능한 닉네임입니다") {
      setColor("#006eff");
    } else if (nickCheck === "이미 사용중 입니다") {
      setColor("red");
    } else {
      setColor("inherit");
    }
  }, [nickCheck]);

  return (
    <div className="user">
      <Form style={{ width: "85%", margin: "auto", marginTop: "20px" }}>
        <Form.Group as={Row} className="mt-1" controlId="formPlaintextEmail">
          <Form.Group as={Row} className="mt-3" controlId="formPlaintextEmail">
            <Form.Label column sm="3">
              닉네임
            </Form.Label>
            <Col sm="7" className="pe-4">
              <Form.Control
                className="ms-1"
                style={{ fontSize: "18px" }}
                type="text"
                placeholder="닉네임을 입력하세요"
                autoComplete="off"
                minLength="2"
                maxLength="16"
                onChange={(e) => setNickname(e.target.value)}
              />
            </Col>
            <span
              style={{
                fontSize: "15px",
                textAlign: "center",
                margin: "10px 20px",
                color: color,
              }}
            >
              {nickCheck}
            </span>
          </Form.Group>

          <Form.Group as={Row} className="mt-3" controlId="formPlaintextEmail">
            <Form.Label column sm="3">
              성별
            </Form.Label>
            <Col sm="8">
              {sex.map((sex, i) => (
                <Form.Check
                  style={{ margin: "10px 40px 10px 0" }}
                  key={i}
                  inline
                  label={sex}
                  value={sex}
                  name="group1"
                  type="radio"
                  onChange={(e) => setGender(e.target.value)}
                />
              ))}
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mt-3" controlId="formPlaintextEmail">
            <Form.Label column sm="3">
              생년월일
            </Form.Label>
            <Col sm="3" className="ps-2 ms-1">
              <Form.Select
                className="ms-1"
                aria-label="Default select example"
                onChange={(e) => {
                  setYear(e.target.value);
                  // console.log(e.target.value);
                }}
              >
                <option>년</option>
                {yearOptions.map((a, i) => (
                  <option value={a} key={i}>
                    {a}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col sm="2" className="ps-2 ms-1">
              <Form.Select
                className="ms-1"
                aria-label="Default select example"
                onChange={(e) => {
                  setMonth(e.target.value);
                }}
              >
                <option>월</option>
                {monthOptions.map((a, i) => (
                  <option value={a} key={i}>
                    {a}
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col sm="2" className="ps-2 ms-1">
              <Form.Select
                className="ms-1"
                aria-label="Default select example"
                onChange={(e) => {
                  setDate(e.target.value);
                }}
              >
                <option>일</option>
                {dateOptions.map((a, i) => (
                  <option value={a} key={i}>
                    {a}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mt-4" controlId="formPlaintextEmail">
            <Form.Label column sm="3">
              MBTI
            </Form.Label>
            <Col sm="7" className="pe-4">
              <Form.Select
                className="ms-1"
                aria-label="Default select example"
                onChange={(e) => {
                  setMBTI(e.target.value);
                }}
              >
                <option>MBTI를 선택하세요</option>
                {MBTI.map((a, i) => (
                  <option value={a} key={i}>
                    {a}
                  </option>
                ))}
              </Form.Select>
            </Col>
          </Form.Group>
        </Form.Group>
        <Container className="d-flex justify-content-end mt-5 mb-3">
          <Button
            className="rounded-pill me-2"
            variant="primary"
            onClick={() => {
              nickCheck !== "사용 가능한 닉네임입니다"
                ? alert("닉네임을 확인하세요.")
                : gender.length === 0
                ? alert("성별을 선택하세요.")
                : birthDay.length < 8
                ? alert("생년월일을 입력하세요.")
                : mbti.length === 0
                ? alert("MBTI를 입력하세요.")
                : db
                    .collection("user-info")
                    .doc(user.uid)
                    .set({
                      nickname: nickname,
                      gender: gender,
                      birthday: birthDay,
                      MBTI: mbti,
                    })
                    .then(() => {
                      history.push("/");
                    });
            }}
          >
            저장
          </Button>
          <Button
            className="rounded-pill me-2"
            variant="outline-dark"
            onClick={() => {
              props.nickname ? history.goBack() : history.push("/");
            }}
          >
            취소
          </Button>
        </Container>
      </Form>
    </div>
  );
}
