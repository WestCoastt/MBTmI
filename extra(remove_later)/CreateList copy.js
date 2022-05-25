/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect } from "react";
import { Card, Button, Dropdown, DropdownButton } from "react-bootstrap";
import { Route } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./App.css";
import { db } from "./index.js";
import parse from "html-react-parser";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import { FiHeart, FiMoreHorizontal } from "react-icons/fi";
import { FaRegComment } from "react-icons/fa";

export default function CreateList(props) {
  let history = useHistory();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [like, setLike] = useState(false);
  const [cnt, setCnt] = useState();
  const [comment, setComment] = useState([]);

  db.collection("post")
    .doc(props.docId)
    .get()
    .then((doc) => {
      setCnt(doc.data().likes);
    });

  useEffect(() => {
    db.collection("post")
      .doc(props.docId)
      .collection("comment")
      .onSnapshot((snapshot) => {
        const commentArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setComment(commentArr);
      });
  }, []);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(auth.currentUser);
    } else {
      setUser(null);
    }
  });

  if (user != null) {
    db.collection("post")
      .where("likedUser", "array-contains", user.uid)
      .get()
      .then((result) => {
        result.forEach((a) => {
          if (a.data().docId == props.docId) {
            setLike(true);
          }
        });
      });
  }

  return (
    <div>
      <Card
        style={{
          width: "100%",
          minWidth: "360px",
          maxWidth: "768px",
          margin: "15px 0px",
        }}
      >
        <Card.Header className="d-flex justify-content-between" as="h5">
          {props.title}

          {user != null ? (
            user.uid == props.uid ? (
              <Dropdown>
                <Dropdown.Toggle
                  id="dropdown-basic"
                  size="sm"
                  variant="light"
                  style={{ lineHeight: "20px" }}
                  className="shadow-none rounded-pill px-1 py-1"
                >
                  <FiMoreHorizontal size="23"></FiMoreHorizontal>
                </Dropdown.Toggle>

                <Dropdown.Menu align="end">
                  <Dropdown.Item
                    onClick={() => {
                      history.push(`/edit?docId=${props.docId}`);
                    }}
                  >
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (window.confirm("삭제하시겠습니까?")) {
                        db.collection("post")
                          .doc(props.docId)
                          .delete()
                          .then(() => {
                            location.reload();
                          });
                      }
                    }}
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            ) : null
          ) : null}

          {user != null ? (
            user.uid == props.uid ? (
              <div style={{ minWidth: "150px" }}>
                <Button
                  className="rounded-pill mx-1"
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    history.push(`/edit?docId=${props.docId}`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  className="rounded-pill mx-1"
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("삭제하시겠습니까?")) {
                      db.collection("post")
                        .doc(props.docId)
                        .delete()
                        .then(() => {
                          location.reload();
                        });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : null
          ) : null}
        </Card.Header>
        <Card.Body>
          <Card.Text>{parse(props.content)}</Card.Text>
        </Card.Body>
        <Card.Footer className="text-muted d-flex px-2 py-1">
          <div style={{ width: "90px", display: "flex" }}>
            <Button
              className="shadow-none rounded-circle mx-0 px-2 pb-2"
              variant="light"
              size="sm"
              onClick={() => {
                {
                  user != null
                    ? like == false
                      ? db
                          .collection("post")
                          .doc(props.docId)
                          .update({
                            likes: cnt + 1,
                            likedUser: arrayUnion(user.uid),
                          })
                      : db
                          .collection("post")
                          .doc(props.docId)
                          .update({
                            likes: cnt - 1,
                            likedUser: arrayRemove(user.uid),
                          }) && setLike(false)
                    : signInWithPopup(auth, provider)
                        .then()
                        .catch(() => {
                          console.log("로그인필요");
                        });
                }
              }}
            >
              {like == false ? (
                <FiHeart size="21" color="#FF6C85"></FiHeart>
              ) : (
                <FiHeart size="21" color="#FF6C85" fill="#FF6C85"></FiHeart>
              )}
            </Button>
            <span
              style={{ lineHeight: "42px", color: "#FF6C85", fontSize: "19px" }}
            >
              {cnt}
            </span>
          </div>
          <div
            className="footer"
            style={{ maxWidth: "90px", display: "flex", cursor: "pointer" }}
            onClick={() => {
              history.push(`/comments?docId=${props.docId}`);
            }}
          >
            <Button
              className="shadow-none rounded-circle mx-0 px-2 pb-2"
              variant="light"
              size="sm"
            >
              <FaRegComment size="22" color="#777777"></FaRegComment>
            </Button>

            <span
              style={{
                lineHeight: "42px",
                color: "#777777",
                fontSize: "19px",
                margin: "0 6px 0 0",
              }}
            >
              {comment.length > 0 ? comment.length : null}
            </span>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}
