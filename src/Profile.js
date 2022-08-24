import React, { useEffect, useState } from "react";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min";
import { Col, Row, Button, Form, Nav } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

import { db } from "./index.js";
import { Link, Route } from "react-router-dom";
import { FaRegTrashAlt } from "react-icons/fa";
import PostsTab from "./PostsTab.js";
import CommentsTab from "./CommentsTab.js";
import LikesTab from "./LikesTab.js";
import RepliesTab from "./RepliesTab.js";
import { signOut, getAuth, deleteUser } from "firebase/auth";

export default function Profile() {
  const uid = window.localStorage.getItem("uid");
  const nickname = window.localStorage.getItem("nickname");
  const history = useHistory();
  const [birthday, setBirthday] = useState();
  const location = useLocation();

  const [male, setMale] = useState();
  const [female, setFemale] = useState();

  const [gender, setGender] = useState("");

  const [mbti, setMbti] = useState();

  const [modalShow, setModalShow] = React.useState(false);

  if (uid) {
    db.collection("user-info")
      .doc(uid)
      .get()
      .then((result) => {
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
    if (gender === "남") {
      setMale(true);
    } else if (gender === "여") {
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
            프로필
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/posts`}
            eventKey={`/${nickname}/posts`}
            className="px-1 mx-1"
          >
            게시글
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/comments`}
            eventKey={`/${nickname}/comments`}
            className="px-1 mx-1"
          >
            댓글
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/replies`}
            eventKey={`/${nickname}/replies`}
            className="px-1 mx-1"
          >
            답글
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/likes`}
            eventKey={`/${nickname}/likes`}
            className="px-1 mx-1"
          >
            좋아요
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
            onClick={() => setModalShow(true)}
          >
            <FaRegTrashAlt
              size="17"
              style={{ marginRight: "4px" }}
            ></FaRegTrashAlt>
            계정삭제
          </button>

          <MyVerticallyCenteredModal
            show={modalShow}
            onHide={() => setModalShow(false)}
          />
        </div>
      </Route>

      <Route path={`/${nickname}/posts`}>
        <PostsTab></PostsTab>
      </Route>
      <Route path={`/${nickname}/comments`}>
        <CommentsTab></CommentsTab>
      </Route>
      <Route path={`/${nickname}/replies`}>
        <RepliesTab></RepliesTab>
      </Route>
      <Route path={`/${nickname}/likes`}>
        <LikesTab></LikesTab>
      </Route>
    </div>
  );
}

function MyVerticallyCenteredModal(props) {
  const uid = window.localStorage.getItem("uid");
  const history = useHistory();
  const auth = getAuth();
  const user = auth.currentUser;
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton style={{ border: "none" }}>
        <Modal.Title id="contained-modal-title-vcenter">
          <h3>계정 삭제</h3>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h6>
          해당 계정의 게시글과 댓글 등 모든 정보가 삭제되며 삭제된 정보는 복구할
          수 없습니다.
        </h6>
      </Modal.Body>
      <Modal.Footer style={{ border: "none" }}>
        <Button
          onClick={() => {
            const posts = db.collection("post").where("uid", "==", uid);
            const comments = db
              .collectionGroup("comment")
              .where("uid", "==", uid);
            const replies = db.collectionGroup("reply").where("uid", "==", uid);

            posts.get().then((snapshot) => {
              snapshot.docs.forEach((doc) => {
                doc.ref.delete();
              });
            });
            comments.get().then((snapshot) => {
              snapshot.docs.forEach((doc) => {
                if (doc.data().reply === 0) {
                  doc.ref.delete();
                  db.collection("post")
                    .doc(doc.data().docId)
                    .get()
                    .then((result) => {
                      if (result.exists) {
                        db.collection("post")
                          .doc(doc.data().docId)
                          .update({
                            comments: result.data().comments - 1,
                            totalScore: result.data().totalScore - 0.6,
                          });
                      }
                    });
                } else {
                  doc.ref.update({
                    comment: null,
                    mbti: null,
                    nickname: null,
                    uid: null,
                  });
                  db.collection("post")
                    .doc(doc.data().docId)
                    .get()
                    .then((result) => {
                      if (result.exists) {
                        db.collection("post")
                          .doc(doc.data().docId)
                          .update({
                            comments: result.data().comments - 1,
                            totalScore: result.data().totalScore - 0.6,
                          });
                      }
                    });
                }
              });
            });
            replies.get().then((snapshot) => {
              snapshot.docs.forEach((doc) => {
                doc.ref.delete();

                db.collection("post")
                  .doc(doc.data().docId)
                  .collection("comment")
                  .doc(doc.data().commentId)
                  .get()
                  .then((result) => {
                    if (result.exists) {
                      db.collection("post")
                        .doc(doc.data().docId)
                        .collection("comment")
                        .doc(doc.data().commentId)
                        .update({
                          reply: result.data().reply - 1,
                        });
                    }
                  });
              });
            });

            db.collection("user-info")
              .doc(uid)
              .delete();

            deleteUser(user)
              .then(() => {
                history.push("/");
              })
              .catch((error) => {
                console.log(error);
                signOut(auth).then(() => {
                  history.push("/");
                });
              });
          }}
        >
          계정 삭제
        </Button>
        <Button variant="outline-dark" onClick={props.onHide}>
          취소
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
