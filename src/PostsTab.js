import React, { useEffect, useState } from "react";
import { ListGroup, Dropdown, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import { FiMoreHorizontal } from "react-icons/fi";

export default function PostsTab() {
  const uid = window.localStorage.getItem("uid");

  const [posts, setPosts] = useState([]);

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

  return (
    <div className="user">
      <ListGroup variant="flush" style={{ marginTop: "10px" }}>
        {posts.map((a, i) => (
          <ListGroup.Item key={a.data.docId}>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}

            <Link to={`/comments?docId=${a.data.docId}`} className="tab-items">
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
                  <Dropdown.Item as={Link} to={`/edit?docId=${a.data.docId}`}>
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
