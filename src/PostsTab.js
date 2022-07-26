import React, { useEffect, useState } from "react";
import { ListGroup, Dropdown, Pagination, Container } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import { FiMoreHorizontal } from "react-icons/fi";

export default function PostsTab() {
  const uid = window.localStorage.getItem("uid");

  const [posts, setPosts] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState();

  const postList = db
    .collection("user-info")
    .doc(uid)
    .collection("posts")
    .orderBy("timeStamp");

  useEffect(() => {
    postList.onSnapshot((snapshot) => {
      const postArr = snapshot.docs.map((doc) => ({
        data: doc.data(),
      }));
      setPosts(postArr);
    });
    postList.onSnapshot((snapshot) => {
      setPages(Math.ceil(snapshot.docs.length / 10));
      if (snapshot.docs.length != 0) {
        setCurrentPage(1);
      }
    });
  }, []);

  function prevPage() {
    if (currentPage > 2) {
      postList
        .endBefore(lastVisible)
        .limitToLast(10)
        .onSnapshot((snapshot) => {
          const prevArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setPosts(prevArr);
          setLastVisible(snapshot.docs[0]);
        });
    } else if (currentPage == 2) {
      postList.limit(10).onSnapshot((snapshot) => {
        const postArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setPosts(postArr);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      });
    }
  }

  function nextPage() {
    if (currentPage !== pages) {
      postList
        .startAfter(lastVisible)
        .limit(10)
        .onSnapshot((snapshot) => {
          const nextArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setPosts(nextArr);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        });
    }
  }

  return (
    <div className="user">
      <ListGroup variant="flush" style={{ marginTop: "10px", height: "500px" }}>
        {posts.map((a, i) => (
          <ListGroup.Item key={a.data.docId}>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}

            <Link to={`/comments?docId=${a.data.docId}`} className="tab-items">
              <span
                className="posts"
                style={{ lineHeight: "36px", width: "70%" }}
              >
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
      <Container className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev
            onClick={() => {
              {
                currentPage > 1 && setCurrentPage(currentPage - 1);
              }
              prevPage();
            }}
          />
          <Pagination.Item disabled>
            {currentPage & pages ? currentPage + " / " + pages : null}
          </Pagination.Item>
          <Pagination.Next
            onClick={() => {
              {
                currentPage < pages && setCurrentPage(currentPage + 1);
              }
              nextPage();
            }}
          />
        </Pagination>
      </Container>
    </div>
  );
}
