/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import { Card, Dropdown, OverlayTrigger, Tooltip } from "react-bootstrap";
import moment from "moment";
import "moment/locale/ko";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Link } from "react-router-dom";
import "./App.css";
import { db } from "./index.js";
import LoginModal from "./LoginModal";
import BadgeColor from "./BadgeColor";
import times from "./times.js";
import parse from "html-react-parser";
import { getAuth } from "firebase/auth";
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { FiHeart, FiMoreHorizontal, FiShare2 } from "react-icons/fi";
import { FaRegComment, FaUserCircle } from "react-icons/fa";

export default function CreateList(props) {
  const uid = window.localStorage.getItem("uid");
  const history = useHistory();
  const auth = getAuth();
  const user = auth.currentUser;
  const [totalScore, setTotalScore] = useState();
  const [comments, setComments] = useState();
  const [noInfo, setNoInfo] = useState();
  const [modalShow, setModalShow] = React.useState(false);
  const koreanTime = moment(props.timestamp * 1000).format("llll");

  db.collection("post")
    .doc(props.docId)
    .get()
    .then((doc) => {
      setComments(doc.data().comments);
      setTotalScore(doc.data().totalScore);
    });

  useEffect(() => {
    if (user) {
      setModalShow(false);
      db.collection("user-info")
        .doc(uid)
        .get()
        .then((docSnapshot) => {
          if (docSnapshot.exists) {
            setNoInfo(false);
          } else {
            setNoInfo(true);
          }
        });
    }
  }, [user]);

  const elementRef = useRef(null);
  const [cliHeight, setCliHeight] = useState();
  useEffect(() => {
    if (elementRef.current.clientHeight >= 500) {
      setCliHeight(true);
    }
  }, []);

  const checkLike = (color) => {
    if (props.likedUser && props.likedUser.includes(uid)) {
      return "#FF6C85";
    } else {
      return color;
    }
  };

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
      <Card
        style={{
          width: "100%",
          minWidth: "360px",
          maxWidth: "768px",
          margin: "8px 0px",
        }}
      >
        <Card.Header
          className="pb-0"
          style={{ background: "inherit", border: "none" }}
        >
          <div
            style={{
              fontSize: "16px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <FaUserCircle
                  size="36"
                  color="#a0aec0"
                  style={{ margin: "0 7px" }}
                ></FaUserCircle>
                <p
                  className="badge"
                  style={{ background: BadgeColor(props.mbti) }}
                >
                  {props.mbti}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Link to="" className="nickname">
                  {props.nickname}
                </Link>

                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id="button-tooltip-2">{koreanTime}</Tooltip>
                  }
                >
                  <Link
                    to={`/comments?docId=${props.docId}`}
                    className="timestamp"
                  >
                    {times(props.timestamp)}
                  </Link>
                </OverlayTrigger>
              </div>
            </div>
            {user && uid === props.uid && (
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
                  <Dropdown.Item as={Link} to={`/edit?docId=${props.docId}`}>
                    수정하기
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (window.confirm("삭제하시겠습니까?")) {
                        db.collection("post")
                          .doc(props.docId)
                          .delete();
                        db.collection("user-info")
                          .doc(uid)
                          .collection("posts")
                          .doc(props.docId)
                          .delete();
                      }
                    }}
                  >
                    삭제하기
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
        </Card.Header>
        <Card.Body className="py-1">
          <h5 className="title">{props.title}</h5>
          <div
            className={cliHeight && "masking"}
            ref={elementRef}
            style={{
              maxHeight: "500px",
              overflow: "hidden",
              margin: "0 3px",
            }}
          >
            {parse(props.content)}
          </div>
          {cliHeight && (
            <div className="read">
              <Link to={`/comments?docId=${props.docId}`} className="read-more">
                더보기
              </Link>
            </div>
          )}
        </Card.Body>
        <Card.Footer
          className="text-muted d-flex justify-content-evenly px-2 py-0"
          style={{ background: "inherit", height: "38px" }}
        >
          <div
            className="footer"
            style={{
              width: "90px",
              display: "flex",
              cursor: "pointer",
              height: "32px",
              borderRadius: "3px",
            }}
            onClick={() => {
              if (user) {
                if (noInfo) {
                  if (window.confirm("닉네임 설정 후 이용이 가능합니다.")) {
                    history.push("/user?uid=" + user.uid);
                  }
                } else {
                  props.likedUser && props.likedUser.includes(uid)
                    ? db
                        .collection("post")
                        .doc(props.docId)
                        .update({
                          likes: props.likes - 1,
                          totalScore: totalScore - 0.4,
                          likedUser: arrayRemove(uid),
                        }) &&
                      db
                        .collection("user-info")
                        .doc(uid)
                        .collection("likes")
                        .doc(props.docId)
                        .delete()
                    : db
                        .collection("post")
                        .doc(props.docId)
                        .update({
                          likes: props.likes + 1,
                          totalScore: totalScore + 0.4,
                          likedUser: arrayUnion(uid),
                        }) &&
                      db
                        .collection("user-info")
                        .doc(uid)
                        .collection("likes")
                        .doc(props.docId)
                        .set({
                          docId: props.docId,
                          title: props.title,
                          timeStamp: Timestamp.now(),
                        });
                }
              } else setModalShow(true);
            }}
          >
            <div
              style={{
                width: "100%",
                margin: "auto",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <FiHeart
                size="18"
                color={checkLike("#777777")}
                fill={checkLike("none")}
              ></FiHeart>

              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "16px",
                  color: checkLike("#777777"),
                  textAlign: "center",
                }}
              >
                {props.likes}
              </span>
            </div>
          </div>
          <Link className="footer" to={`/comments?docId=${props.docId}`}>
            <div
              style={{
                width: "100%",
                margin: "auto",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <FaRegComment size="18" color="#777777"></FaRegComment>
              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "16px",
                  color: "#777777",
                  textAlign: "center",
                }}
              >
                {comments}
              </span>
            </div>
          </Link>

          <div
            className="footer"
            style={{
              width: "66px",
              display: "flex",
              cursor: "pointer",
              height: "32px",
              borderRadius: "3px",
            }}
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: `${props.title}`,
                    // text: "공유하기 테스트입니다",
                    url: `https://mbtmi-96d3c.firebaseapp.com/comments?docId=${props.docId}`,
                  })
                  .then(() => {
                    console.log("성공");
                  })
                  .catch((e) => {
                    console.log("실패");
                  });
              } else {
                alert("공유하기가 지원되지 않는 환경입니다.");
              }
            }}
          >
            <div
              style={{
                width: "100%",
                margin: "auto",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <FiShare2 size="18" color="#777777"></FiShare2>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}
