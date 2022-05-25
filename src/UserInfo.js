/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { useBeforeunload } from "react-beforeunload";
import { Col, Row, Button, Form } from "react-bootstrap";
import { db } from "./index.js";
import { getAuth } from "firebase/auth";

export default function UserInfo() {
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
  const [nickError, setNickError] = useState("");
  const [nickname, setNickname] = useState("");
  const [mbti, setMBTI] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [date, setDate] = useState("");
  const [gender, setGender] = useState("");
  const birthDay = `${year}-${month}-${date}`;

  //제로베이스 리액트 강의 (리스트와 Key/폼과 이벤트제어하기) 8.폼 - 다중 입력 다루기
  // const [userBirthday, setUserBirthday] = useState({
  //   year: "",
  //   month: "",
  //   date: "",
  // })
  // const handleChange = (e) => {
  //  setUserBirthday({...userBirthday, [e.target.name]: e.target.value})
  // }
  //인풋에 name설정해줘야함

  // useBeforeunload((event) => {
  //   event.preventDefault();
  // });

  // const preventGoBack = () => {
  //   history.pushState(null, "", location.href);
  // };
  // useEffect(() => {
  //   history.pushState(null, "", location.href);
  //   window.addEventListener("popstate", preventGoBack);

  //   return () => {
  //     window.removeEventListener("popstate", preventGoBack);
  //   };
  // });

  useEffect(() => {
    let regExp = /^[a-zA-Z가-힣0-9_]{2,12}$/;
    if (regExp.test(nickname) == true) {
      db.collection("user-info")
        .where("nickname", "!=", nickname)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setNickError("사용 가능한 닉네임입니다");
          });
        });
      db.collection("user-info")
        .where("nickname", "==", nickname)
        .get()
        .then((querySnapshot) => {
          querySnapshot.forEach((doc) => {
            setNickError("이미 사용중 입니다");
          });
        });
    } else if (regExp.test(nickname) == false) {
      setNickError("2~12자의 한글, 영문, 숫자, 언더바( _ )만 가능");
    }
  }, [nickname]);

  //코멘트 collection에서 where 닉네임 == 닉네임으로 업데이트
  // db.collection("post")
  // .collection("comment")
  // .where("nickname", "==", nickname)
  // .get()
  // .then((querySnapshot) => {
  //   querySnapshot.forEach((doc) => {
  //     console.log(doc);
  //   });
  // });

  // let 날짜 = year + "-" + month + "-" + date;

  // console.log(birthDay);

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
                type="text"
                placeholder="닉네임을 입력하세요"
                autoComplete="off"
                minLength="2"
                maxLength="12"
                onChange={(e) => setNickname(e.target.value)}
              />
            </Col>
            <span
              style={
                nickError == "이미 사용중 입니다"
                  ? {
                      color: "red",
                      fontSize: "15px",
                      textAlign: "center",
                      margin: "10px 20px",
                    }
                  : {
                      fontSize: "15px",
                      textAlign: "center",
                      margin: "10px 20px",
                    }
              }
            >
              {nickError}
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
                  console.log(e.target.value);
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
        <Button
          className="rounded-pill float-end mt-5 me-2"
          variant="outline-dark"
          type="submit"
          onClick={() => {
            db.collection("user-info")
              .doc(user.uid)
              .set({
                nickname: nickname,
                gender: gender,
                birthday: birthDay,
                MBTI: mbti,
              })
              .then(() => {
                // db.collection("comment")
                // .where("nickname", "==", nickname)

                history.push("/");
                location.reload();
              });
          }}
        >
          Submit
        </Button>
      </Form>
    </div>
  );
}

// {gender.map((gender, i) => (
//   <div key={i} className="mt-2">
//     <Form.Check
//       key={i}
//       inline
//       label={gender}
//       value={gender}
//       name="group1"
//       type="radio"
//       // id={`inline-${gender}-1`}
//       onChange={(e) => setSex(e.target.value)}
//     />
//   </div>
// ))}

// const date = new Date();
// const month = ("0" + (date.getMonth() + 1)).slice(-2);
// const day = ("0" + date.getDate()).slice(-2);
// const fullDate = year + "-" + month + "-" + day;
// const minDate = year - 80 + "-" + month + "-" + day;

{
  /* <Form.Group as={Row} className="mt-4" controlId="formPlaintextEmail">
            <Form.Label column sm="3">
              생년월일
            </Form.Label>
            <Col sm="5" className="ms-1">
              <Form.Control
                type="text"
                placeholder="YYYY-MM-DD"
                autoComplete="off"
                onChange={(e) => setValue()}
              />
            </Col>
            <span
              style={{
                fontSize: "15px",
                textAlign: "center",
                margin: "10px 0",
              }}
            >
              {}
            </span>
          </Form.Group> */
}
