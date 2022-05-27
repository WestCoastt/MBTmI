import React, { useEffect, useState } from "react";
import { ListGroup, Dropdown, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import parse from "html-react-parser";
import { FiMoreHorizontal } from "react-icons/fi";

export default function CommentsTab() {
  const uid = window.localStorage.getItem("uid");
  const nickname = window.localStorage.getItem("nickname");

  const [comments, setComments] = useState([]);

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

  return (
    <div className="user">
      <Nav
        activeKey="link-2"
        style={{
          margin: "6px 0 6px 10px",
        }}
      >
        <Nav.Item>
          <Nav.Link
            as={Link}
            to={`/${nickname}/myprofile`}
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
                          .delete();
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
    </div>
  );
}
