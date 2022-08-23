import React, { useEffect, useState } from "react";
import { Container, ListGroup, Pagination } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";

export default function LikesTab() {
  const uid = window.localStorage.getItem("uid");

  const [likes, setLikes] = useState([]);
  const [lastVisible, setLastVisible] = useState();
  const [pages, setPages] = useState();
  const [currentPage, setCurrentPage] = useState();

  const likeList = db
    .collection("user-info")
    .doc(uid)
    .collection("likes")
    .orderBy("timeStamp");

  useEffect(() => {
    likeList.limit(10).onSnapshot((snapshot) => {
      const likeArr = snapshot.docs.map((doc) => ({
        data: doc.data(),
      }));
      setLikes(likeArr);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
    });
    likeList.onSnapshot((snapshot) => {
      setPages(Math.ceil(snapshot.docs.length / 10));
      if (snapshot.docs.length !== 0) {
        setCurrentPage(1);
      }
    });
  }, []);

  function prevPage() {
    if (currentPage > 2) {
      likeList
        .endBefore(lastVisible)
        .limitToLast(10)
        .onSnapshot((snapshot) => {
          const prevArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setLikes(prevArr);
          setLastVisible(snapshot.docs[0]);
        });
    } else if (currentPage === 2) {
      likeList.limit(10).onSnapshot((snapshot) => {
        const likeArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setLikes(likeArr);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      });
    }
  }

  function nextPage() {
    if (currentPage !== pages) {
      likeList
        .startAfter(lastVisible)
        .limit(10)
        .onSnapshot((snapshot) => {
          const nextArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setLikes(nextArr);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        });
    }
  }

  return (
    <div className="user">
      <ListGroup variant="flush" style={{ marginTop: "10px", height: "500px" }}>
        {likes.map((a, i) => (
          <ListGroup.Item key={a.data.docId}>
            <Link
              to={`/comments?docId=${a.data.docId}`}
              className="tab-items"
              style={{ width: "100%" }}
            >
              <span className="likes" style={{ lineHeight: "36px" }}>
                <p>{a.data.title}</p>
              </span>
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
      <Container className="d-flex justify-content-center mt-4">
        <Pagination>
          <Pagination.Prev
            onClick={() => {
              currentPage > 1 && setCurrentPage(currentPage - 1);
              prevPage();
            }}
          />
          <Pagination.Item disabled>
            {pages && currentPage + " / " + pages}
          </Pagination.Item>
          <Pagination.Next
            onClick={() => {
              currentPage < pages && setCurrentPage(currentPage + 1);
              nextPage();
            }}
          />
        </Pagination>
      </Container>
    </div>
  );
}
