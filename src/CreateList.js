/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Dropdown } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import moment from "moment";
import "moment/locale/ko";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Link } from "react-router-dom";
import "./App.css";
import { db } from "./index.js";
import parse from "html-react-parser";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { FiHeart, FiMoreHorizontal, FiShare2 } from "react-icons/fi";
import { FaRegComment, FaUserCircle } from "react-icons/fa";

export default function CreateList(props) {
  const uid = window.localStorage.getItem("uid");
  const history = useHistory();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [like, setLike] = useState(false);
  const [cnt, setCnt] = useState();
  const [comment, setComment] = useState([]);
  const [noInfo, setNoInfo] = useState();
  const [time, setTime] = useState();
  const [badgeColor, setBadgeColor] = useState();
  const koreanTime = moment(props.timestamp * 1000).format("llll");

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
      setUser(user);
    } else {
      setUser(null);
    }
  });

  if (user != null) {
    db.collection("post")
      .where("likedUser", "array-contains", uid)
      .get()
      .then((result) => {
        result.forEach((a) => {
          if (a.data().docId == props.docId) {
            setLike(true);
          }
        });
      });
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

  const elementRef = useRef(null);
  const [cliHeight, setCliHeight] = useState();
  useEffect(() => {
    if (elementRef.current.clientHeight >= 500) {
      setCliHeight(true);
    }
  }, []);

  useEffect(() => {
    const min = 60;
    const hour = 60 * 60;
    const day = 60 * 60 * 24;
    const month = 60 * 60 * 24 * 30;
    const year = 60 * 60 * 24 * 365;

    const currentTime = new Date() / 1000;

    const timeGap = currentTime - props.timestamp;

    if (timeGap > year) {
      setTime(Math.floor(timeGap / year) + "년 전");
    } else if (timeGap > month) {
      setTime(Math.floor(timeGap / month) + "개월 전");
    } else if (timeGap > day) {
      setTime(Math.floor(timeGap / day) + "일 전");
    } else if (timeGap > hour) {
      setTime(Math.floor(timeGap / hour) + "시간 전");
    } else if (timeGap > min) {
      setTime(Math.floor(timeGap / min) + "분 전");
    } else {
      setTime("방금 전");
    }
  }, []);

  useEffect(() => {
    const palette = {
      ISTJ: "#1f55de",
      ISFJ: "#FFD124",
      ISTP: "#a7a7a7",
      ISFP: "#FFB4B4",
      INTJ: "#3AB4F2",
      INFJ: "#b2a4ff",
      INTP: "#009DAE",
      INFP: "#9900F0",
      ESTJ: "#935f2f",
      ESFJ: "#ffc45e",
      ESTP: "#1F4690",
      ESFP: "#F637EC",
      ENTJ: "#F32424",
      ENFJ: "#FF5F00",
      ENTP: "#545f5f",
      ENFP: "#019267",
    };

    Object.entries(palette).map(([key, value]) => {
      if (props.mbti == key) {
        setBadgeColor(value);
      }
    });
  }, []);

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      <Card
        style={{
          width: "100%",
          minWidth: "360px",
          maxWidth: "768px",
          margin: "8px 0px",
        }}
      >
        {/* <Card.Header className="d-flex justify-content-between" as="h5"> */}
        <Card.Header>
          <div
            style={{
              fontSize: "16px",
              marginBottom: "6px",
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
                <p className="badge" style={{ background: `${badgeColor}` }}>
                  {props.mbti}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Link className="nickname">{props.nickname}</Link>

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
                    {time}
                  </Link>
                </OverlayTrigger>
              </div>
            </div>
            {user != null && uid == props.uid && (
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
                    Edit
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
                          .delete()
                          .then(() => {
                            // location.reload();
                            // map돌릴때 key값을 고유한 값(ex. docID)을 매기니까 리로드 필요 없어짐
                            //key값을 index로 주면 delete할때 순서가 엉망이 됨
                          });
                      }
                    }}
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
          <h5 style={{ fontSize: "20px", fontWeight: "bold" }}>
            {props.title}
          </h5>
        </Card.Header>
        <Card.Body>
          <Card.Text
            className={cliHeight && "masking"}
            ref={elementRef}
            style={{
              maxHeight: "500px",
              overflow: "hidden",
            }}
          >
            {parse(props.content)}
          </Card.Text>
          {cliHeight && (
            <div className="read">
              <Link to={`/comments?docId=${props.docId}`} className="read-more">
                더보기
              </Link>
            </div>
          )}
        </Card.Body>
        <Card.Footer className="text-muted d-flex justify-content-evenly px-2 py-1">
          <div
            className="footer"
            style={{
              width: "90px",
              display: "flex",
              cursor: "pointer",
              height: "36px",
              margin: "5px 0",
              borderRadius: "3px",
            }}
            onClick={() => {
              {
                user != null
                  ? noInfo == false
                    ? like == false
                      ? db
                          .collection("post")
                          .doc(props.docId)
                          .update({
                            likes: cnt + 1,
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
                          })
                      : db
                          .collection("post")
                          .doc(props.docId)
                          .update({
                            likes: cnt - 1,
                            likedUser: arrayRemove(uid),
                          }) &&
                        db
                          .collection("user-info")
                          .doc(uid)
                          .collection("likes")
                          .doc(props.docId)
                          .delete() &&
                        setLike(false)
                    : history.push("/user?uid=" + user.uid)
                  : signInWithPopup(auth, provider)
                      .then()
                      .catch(() => {
                        console.log("로그인필요");
                      });
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
              <FiHeart
                size="22"
                color="#FF6C85"
                fill={like == true ? "#FF6C85" : "none"}
              ></FiHeart>

              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "20px",
                  color: "#FF6C85",
                  textAlign: "center",
                }}
              >
                {cnt}
              </span>
            </div>
          </div>
          {/* <div
            className="footer"
            style={{
              width: "90px",
              display: "flex",
              cursor: "pointer",
              height: "36px",
              margin: "5px 0",
              borderRadius: "3px",
            }}
            onClick={() => {
              history.push(`/comments?docId=${props.docId}`);
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
              <FaRegComment size="22" color="#777777"></FaRegComment>
              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "20px",
                  color: "#777777",
                  textAlign: "center",
                }}
              >
                {comment.length}
              </span>
            </div>
          </div> */}

          <Link className="footer" to={`/comments?docId=${props.docId}`}>
            <div
              style={{
                width: "100%",
                margin: "auto",
                display: "flex",
                justifyContent: "space-evenly",
              }}
            >
              <FaRegComment size="22" color="#777777"></FaRegComment>
              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "20px",
                  color: "#777777",
                  textAlign: "center",
                }}
              >
                {comment.length}
              </span>
            </div>
          </Link>

          <div
            className="footer"
            style={{
              width: "66px",
              display: "flex",
              cursor: "pointer",
              height: "36px",
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
              <FiShare2 size="21" color="#777777"></FiShare2>
            </div>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
}

{
  /* <div
  className="footer"
  style={{
    width: "90px",
    display: "flex",
    cursor: "pointer",
    height: "36px",
    margin: "5px 0",
    borderRadius: "3px",
  }}
  onClick={() => {
    // history.push(`/comments?docId=${props.docId}`);
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
    <FiShare2 size="22" color="#777777"></FiShare2>
  </div>
</div> */
}
