import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { Col, Row, Button, Form, Nav } from "react-bootstrap";
import { db } from "./index.js";
import { Link, Route } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import PostsTab from "./PostsTab.js";
import CommentsTab from "./CommentsTab.js";
import { getAuth, deleteUser } from "firebase/auth";

export default function Profile() {
  const uid = window.localStorage.getItem("uid");
  const nickname = window.localStorage.getItem("nickname");
  const auth = getAuth();
  const user = auth.currentUser;
  const history = useHistory();
  const [birthday, setBirthday] = useState();
  const location = useLocation();
  // const [nickname, setNickname] = useState();

  const [male, setMale] = useState();
  const [female, setFemale] = useState();

  const [gender, setGender] = useState("");

  const [mbti, setMbti] = useState();

  if (uid != null) {
    db.collection("user-info")
      .doc(uid)
      .get()
      .then((result) => {
        // setNickname(result.data().nickname);
        setMbti(result.data().MBTI);
        setBirthday(result.data().birthday);
        setGender(result.data().gender);
      })
      .catch(() => {
        setMbti();
        setBirthday();
        setGender();
      });
  }

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
        activeKey={location.pathname}
        style={{
          margin: "6px 0 6px 10px",
        }}
      >
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}`}
            eventKey={`/${nickname}`}
            className="px-1 mx-1"
          >
            My Profile
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/posts`}
            eventKey={`/${nickname}/posts`}
            className="px-1 mx-1"
          >
            Posts
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/comments`}
            eventKey={`/${nickname}/comments`}
            className="px-1 mx-1"
          >
            Comments
          </Nav.Link>
        </Nav.Item>
      </Nav>

      <Route exact path={`/${nickname}`}>
        <Form className="mt-0" style={{ width: "85%", margin: "auto" }}>
          <fieldset disabled>
            <Form.Group
              as={Row}
              className="mt-4"
              controlId="formPlaintextEmail"
            >
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
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <Button
              className="rounded-pill mt-5 mb-5 me-2"
              variant="outline-dark"
              type="submit"
              onClick={() => {
                history.push("/user?uid=" + uid);
              }}
            >
              수정
            </Button>
          </div>
        </Form>
        <div className="account">
          <button
            className="delete-account"
            variant="outline-danger"
            onClick={() => {
              if (window.confirm("계정을 삭제하시겠습니까?")) {
                const posts = db.collection("post").where("uid", "==", uid);
                const comments = db
                  .collectionGroup("comment")
                  .where("uid", "==", uid);

                posts.get().then((snapshot) => {
                  snapshot.docs.forEach((doc) => {
                    doc.ref.delete();
                  });
                });
                comments.get().then((snapshot) => {
                  snapshot.docs.forEach((doc) => {
                    doc.ref.delete();
                  });
                });

                db.collection("user-info")
                  .doc(uid)
                  .delete();

                deleteUser(user)
                  .then(() => {
                    history.push("/");
                  })
                  .catch((error) => {});
              }
            }}
          >
            <FaRegTrashAlt
              size="17"
              style={{ marginRight: "4px" }}
            ></FaRegTrashAlt>
            계정삭제
          </button>
        </div>
      </Route>

      <Route path={`/${nickname}/comments`}>
        <CommentsTab></CommentsTab>
      </Route>

      <Route path={`/${nickname}/posts`}>
        <PostsTab></PostsTab>
      </Route>
    </div>
  );
}
