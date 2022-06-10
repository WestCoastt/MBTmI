import React, { useEffect, useState } from "react";
import { ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { db } from "./index.js";
import parse from "html-react-parser";

export default function LikesTab() {
  const uid = window.localStorage.getItem("uid");

  const [likes, setLikes] = useState([]);

  useEffect(() => {
    db.collection("user-info")
      .doc(uid)
      .collection("likes")
      .orderBy("timeStamp")
      .onSnapshot((snapshot) => {
        const likeArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setLikes(likeArr);
      });
  }, []);

  return (
    <div className="user">
      <ListGroup variant="flush" style={{ marginTop: "10px" }}>
        {likes.map((a, i) => (
          <ListGroup.Item key={a.data.docId}>
            <Link to={`/comments?docId=${a.data.docId}`} className="tab-items">
              <span style={{ lineHeight: "36px", width: "70%" }}>
                {parse(a.data.title)}
              </span>
            </Link>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
}
