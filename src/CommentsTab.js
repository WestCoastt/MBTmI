import React, { useEffect, useState } from "react";
import { Container, ListGroup, Dropdown, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import parse from "html-react-parser";
import { FiMoreHorizontal } from "react-icons/fi";

export default function CommentsTab() {
  const uid = window.localStorage.getItem("uid");

  const [comments, setComments] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState();

  const commentList = db
    .collection("user-info")
    .doc(uid)
    .collection("comments")
    .orderBy("timeStamp");

  useEffect(() => {
    commentList.limit(10).onSnapshot((snapshot) => {
      const commentArr = snapshot.docs.map((doc) => ({
        data: doc.data(),
      }));
      setComments(commentArr);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    });
    commentList.onSnapshot((snapshot) => {
      setPages(Math.ceil(snapshot.docs.length / 10));
      if (snapshot.docs.length != 0) {
        setCurrentPage(1);
      }
    });
  }, []);

  function prevPage() {
    if (currentPage > 2) {
      commentList
        .endBefore(lastVisible)
        .limitToLast(10)
        .onSnapshot((snapshot) => {
          const prevArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setComments(prevArr);
          setLastVisible(snapshot.docs[0]);
        });
    } else if (currentPage == 2) {
      commentList.limit(10).onSnapshot((snapshot) => {
        const commentArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setComments(commentArr);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      });
    }
  }

  function nextPage() {
    if (currentPage !== pages) {
      commentList
        .startAfter(lastVisible)
        .limit(10)
        .onSnapshot((snapshot) => {
          const nextArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setComments(nextArr);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        });
    }
  }

  return (
    <div className="user">
      <ListGroup variant="flush" style={{ marginTop: "10px", height: "500px" }}>
        {comments.map((a, i) => (
          <ListGroup.Item key={a.data.commentId}>
            {/* <div style={{ display: "flex", justifyContent: "space-between" }}> */}

            <Link to={`/comments?docId=${a.data.docId}`} className="tab-items">
              <span
                className="posts"
                style={{ lineHeight: "36px", width: "70%" }}
              >
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
                  {/* <Dropdown.Item
                    onClick={() => {
                      // history.push(`/edit?docId=${a.data.docId}`);
                    }}
                  >
                    Edit
                  </Dropdown.Item> */}
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

                        db.collection("post")
                          .doc(a.data.docId)
                          .get()
                          .then((doc) => {
                            db.collection("post")
                              .doc(a.data.docId)
                              .update({
                                comments: doc.data().comments - 1,
                                totalScore: doc.data().totalScore - 0.6,
                              });
                          });
                      }
                    }}
                  >
                    삭제하기
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
            {pages && currentPage + " / " + pages}
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
