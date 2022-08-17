import React, { useEffect, useState } from "react";
import { Container, ListGroup, Dropdown, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import parse from "html-react-parser";
import { FiMoreHorizontal } from "react-icons/fi";

export default function RepliesTab() {
  const uid = window.localStorage.getItem("uid");

  const [replies, setReplies] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState();

  const repliesList = db
    .collection("user-info")
    .doc(uid)
    .collection("replies")
    .orderBy("timeStamp");

  useEffect(() => {
    repliesList.limit(10).onSnapshot((snapshot) => {
      const replyArr = snapshot.docs.map((doc) => ({
        data: doc.data(),
      }));
      setReplies(replyArr);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    });
    repliesList.onSnapshot((snapshot) => {
      setPages(Math.ceil(snapshot.docs.length / 10));
      if (snapshot.docs.length != 0) {
        setCurrentPage(1);
      }
    });
  }, []);

  function prevPage() {
    if (currentPage > 2) {
      repliesList
        .endBefore(lastVisible)
        .limitToLast(10)
        .onSnapshot((snapshot) => {
          const prevArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setReplies(prevArr);
          setLastVisible(snapshot.docs[0]);
        });
    } else if (currentPage == 2) {
      repliesList.limit(10).onSnapshot((snapshot) => {
        const replyArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setReplies(replyArr);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      });
    }
  }

  function nextPage() {
    if (currentPage !== pages) {
      repliesList
        .startAfter(lastVisible)
        .limit(10)
        .onSnapshot((snapshot) => {
          const nextArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setReplies(nextArr);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        });
    }
  }

  return (
    <div className="user">
      <ListGroup variant="flush" style={{ marginTop: "10px", height: "500px" }}>
        {replies.map((a, i) => (
          <ListGroup.Item key={a.data.replyId}>
            <Link
              to={`/comments?docId=${a.data.docId}`}
              className="tab-items"
              style={{ overflow: "hidden" }}
            >
              <span
                className="posts"
                style={{ lineHeight: "36px", width: "70%" }}
              >
                {parse(a.data.reply)}
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
                      if (window.confirm("답글을 삭제하시겠습니까?")) {
                        const commentDoc = db
                          .collection("post")
                          .doc(a.data.docId)
                          .collection("comment")
                          .doc(a.data.commentId);
                        commentDoc
                          .collection("reply")
                          .doc(a.data.replyId)
                          .delete();

                        db.collection("user-info")
                          .doc(uid)
                          .collection("replies")
                          .doc(a.data.replyId)
                          .delete();

                        commentDoc.get().then((doc) => {
                          if (doc.exists) {
                            commentDoc.update({
                              reply: doc.data().reply - 1,
                            });
                          }
                        });
                      }
                    }}
                  >
                    삭제하기
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
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
