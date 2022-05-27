import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Col, Row, Button, Form, Nav } from "react-bootstrap";
import { db } from "./index.js";
import { Link } from "react-router-dom";

export default function MyProfile() {
  const uid = window.localStorage.getItem("uid");
  const nickname = window.localStorage.getItem("nickname");
  const history = useHistory();
  const [birthday, setBirthday] = useState();

  const [male, setMale] = useState();
  const [female, setFemale] = useState();

  const [gender, setGender] = useState("");

  const [mbti, setMbti] = useState();

  db.collection("user-info")
    .doc(uid)
    .get()
    .then((result) => {
      setMbti(result.data().MBTI);
      setBirthday(result.data().birthday);
      setGender(result.data().gender);
    });

  useEffect(() => {
    if (gender == "남") {
      setMale(true);
    } else if (gender == "여") {
      setFemale(true);
    }
  }, [gender]);

  return (
    <div className="user">
      <Nav
        activeKey="link-0"
        style={{
          margin: "6px 0 6px 10px",
        }}
      >
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/myprofile`}
            eventKey="link-0"
            className="px-1 mx-1"
          >
            My Profile
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/posts`}
            eventKey="link-1"
            className="px-1 mx-1"
          >
            Posts
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/comments`}
            eventKey="link-2"
            className="px-1 mx-1"
          >
            Comments
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Form className="mt-0" style={{ width: "85%", margin: "auto" }}>
        <fieldset disabled>
          <Form.Group as={Row} className="mt-4" controlId="formPlaintextEmail">
            <Form.Group
              as={Row}
              className="mt-4"
              controlId="formPlaintextEmail"
            >
              <Form.Label column sm="3">
                닉네임
              </Form.Label>
              <Col sm="6" className="ps-3">
                <Form.Control type="text" placeholder={nickname} />
              </Col>
            </Form.Group>

            <Form.Group
              as={Row}
              className="mt-3"
              controlId="formPlaintextEmail"
            >
              <Form.Label column sm="3">
                성별
              </Form.Label>
              <Col sm="6" className="ps-4">
                <Form.Check
                  style={{ margin: "10px 40px 10px 0" }}
                  inline
                  label="남"
                  value="남"
                  name="group1"
                  type="radio"
                  defaultChecked={male}
                />
                <Form.Check
                  style={{ margin: "10px 40px 10px 0" }}
                  inline
                  label="여"
                  value="여"
                  name="group1"
                  type="radio"
                  defaultChecked={female}
                />
              </Col>
            </Form.Group>
            <Form.Group
              as={Row}
              className="mt-3"
              controlId="formPlaintextEmail"
            >
              <Form.Label column sm="3">
                생년월일
              </Form.Label>

              <Col sm="6" className="ps-3">
                <Form.Control type="text" placeholder={birthday} />
              </Col>
            </Form.Group>
            <Form.Group
              as={Row}
              className="mt-4"
              controlId="formPlaintextEmail"
            >
              <Form.Label column sm="3">
                MBTI
              </Form.Label>

              <Col sm="6" className="ps-3">
                <Form.Control type="text" placeholder={mbti} />
              </Col>
            </Form.Group>
          </Form.Group>
        </fieldset>
        <Button
          className="rounded-pill float-end mt-5 me-2"
          variant="outline-dark"
          type="submit"
          onClick={() => {
            history.push("/user?uid=" + uid);
          }}
        >
          수정
        </Button>
      </Form>
    </div>
  );
}
