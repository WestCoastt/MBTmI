import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import {
  Col,
  Row,
  Button,
  Form,
  Nav,
  ListGroup,
  Dropdown,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import parse from "html-react-parser";
import { FiMoreHorizontal } from "react-icons/fi";

export default function Profile() {
  const uid = window.localStorage.getItem("uid");
  const history = useHistory();
  const [nickname, setNickname] = useState();
  const [birthday, setBirthday] = useState();

  const [male, setMale] = useState();
  const [female, setFemale] = useState();

  const [gender, setGender] = useState("");

  const [mbti, setMbti] = useState();

  const [tab, setTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);

  db.collection("user-info")
    .doc(uid)
    .get()
    .then((result) => {
      setMbti(result.data().MBTI);
      setNickname(result.data().nickname);
      setBirthday(result.data().birthday);
      setGender(result.data().gender);
    });

  useEffect(() => {
    db.collection("user-info")
      .doc(uid)
      .collection("posts")
      .orderBy("timeStamp")
      .onSnapshot((snapshot) => {
        const postArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setPosts(postArr);
      });
  }, []);

  useEffect(() => {
    db.collection("user-info")
      .doc(uid)
      .collection("comments")
      .orderBy("timeStamp")
      .onSnapshot((snapshot) => {
        const commentArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setComments(commentArr);
      });
  }, []);

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
        defaultActiveKey="link-0"
        style={{
          margin: "6px 0 6px 10px",
        }}
      >
        <Nav.Item>
          <Nav.Link
            className="px-1 mx-1"
            eventKey="link-0"
            onClick={() => {
              setTab(0);
            }}
          >
            My Profile
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className="px-1 mx-1"
            eventKey="link-1"
            onClick={() => {
              setTab(1);
            }}
          >
            Posts
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className="px-1 mx-1"
            eventKey="link-2"
            onClick={() => {
              setTab(2);
            }}
          >
            Comments
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {tab == 0 && (
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
      )}

      {tab == 1 && (
        <ListGroup variant="flush" style={{ marginTop: "10px" }}>
          {posts.map((a, i) => (
            <ListGroup.Item key={a.data.docId}>
              {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}

              <Link to={`/comments?docId=${a.data.docId}`}>
                <span style={{ lineHeight: "36px", width: "70%" }}>
                  <p>{a.data.title}</p>
                </span>
              </Link>

              <span
                style={{
                  lineHeight: "36px",
                  width: "30%",
                  textAlign: "center",
                }}
              >
                {new Date(a.data.timeStamp.toDate())
                  .toISOString()
                  .split("T")[0]
                  .replace(/-/g, ".")}
              </span>

              {uid != null && (
                <Dropdown>
                  <Dropdown.Toggle
                    size="sm"
                    variant="light"
                    style={{ lineHeight: "20px" }}
                    className="more shadow-none rounded-pill px-1 py-1"
                  >
                    <FiMoreHorizontal size="23"></FiMoreHorizontal>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    align="end"
                    variant="dark"
                    style={{ minWidth: "160px" }}
                  >
                    <Dropdown.Item
                      onClick={() => {
                        history.push(`/edit?docId=${a.data.docId}`);
                      }}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        if (window.confirm("삭제하시겠습니까?")) {
                          db.collection("post")
                            .doc(a.data.docId)
                            .delete();
                          db.collection("user-info")
                            .doc(uid)
                            .collection("posts")
                            .doc(a.data.docId)
                            .delete()
                            .then(() => {
                              history.push(`/profile/${nickname}`);
                            });
                        }
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {/* </div> */}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      {tab == 2 && (
        <ListGroup variant="flush" style={{ marginTop: "10px" }}>
          {comments.map((a, i) => (
            <ListGroup.Item key={a.data.commentId}>
              {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}

              <Link to={`/comments?docId=${a.data.docId}`}>
                <span style={{ lineHeight: "36px", width: "70%" }}>
                  {parse(a.data.comment)}
                </span>
              </Link>

              <span
                style={{
                  lineHeight: "36px",
                  width: "30%",
                  textAlign: "center",
                }}
              >
                {new Date(a.data.timeStamp.toDate())
                  .toISOString()
                  .split("T")[0]
                  .replace(/-/g, ".")}
              </span>

              {uid != null && (
                <Dropdown>
                  <Dropdown.Toggle
                    size="sm"
                    variant="light"
                    style={{ lineHeight: "20px" }}
                    className="more shadow-none rounded-pill px-1 py-1"
                  >
                    <FiMoreHorizontal size="23"></FiMoreHorizontal>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    align="end"
                    variant="dark"
                    style={{ minWidth: "160px" }}
                  >
                    <Dropdown.Item
                      onClick={() => {
                        // history.push(`/edit?docId=${a.data.docId}`);
                      }}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        if (window.confirm("댓글을 삭제하시겠습니까?")) {
                          db.collection("post")
                            .doc(a.data.docId)
                            .collection("comment")
                            .doc(a.data.commentId)
                            .delete();
                          db.collection("user-info")
                            .doc(uid)
                            .collection("comments")
                            .doc(a.data.commentId)
                            .delete()
                            .then(() => {
                              history.push(`/profile/${nickname}`);
                            });
                        }
                      }}
                    >
                      Delete
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
              {/* </div> */}
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
