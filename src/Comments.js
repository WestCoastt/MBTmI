/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Dropdown } from "react-bootstrap";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/Tooltip";
import moment from "moment";
import "moment/locale/ko";
import { db } from "./index.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import parse from "html-react-parser";
import { Editor } from "@tinymce/tinymce-react";
import { FiHeart, FiMoreHorizontal, FiShare2 } from "react-icons/fi";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { useHistory, Link } from "react-router-dom";

export default function Comments() {
  const uid = window.localStorage.getItem("uid");
  const urlSearch = new URLSearchParams(window.location.search);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const user = auth.currentUser;
  const tinymcekey = process.env.REACT_APP_TINYMCE_KEY;
  const history = useHistory();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [text, setText] = useState("");
  const editorRef = useRef(null);
  const [comment, setComment] = useState([]);
  const [nickname, setNickname] = useState("");
  const [mbti, setMbti] = useState("");
  const [badgeColor, setBadgeColor] = useState();
  const [noInfo, setNoInfo] = useState();
  const [like, setLike] = useState(false);
  const [cnt, setCnt] = useState();
  const [timeStamp, setTimeStamp] = useState();
  const [time, setTime] = useState();
  const koreanTime = moment(timeStamp * 1000).format("llll");
  const docId = urlSearch.get("docId");

  db.collection("post")
    .doc(docId)
    .get()
    .then((doc) => {
      setCnt(doc.data().likes);
    })
    .catch(() => {});

  useEffect(() => {
    db.collection("post")
      .doc(docId)
      .collection("comment")
      .orderBy("timeStamp")
      .onSnapshot((snapshot) => {
        const commentArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setComment(commentArr);
      });
  }, []);

  useEffect(() => {
    db.collection("post")
      .doc(docId)
      .get()
      .then((result) => {
        setTitle(result.data().title);
        setContent(result.data().content);
        setUserId(result.data().uid);
        setMbti(result.data().mbti);
        setTimeStamp(result.data().timeStamp.seconds);
      })
      .catch(() => {
        window.alert("삭제되었거나 존재하지 않는 게시물입니다.");
        history.goBack();
      });
  }, []);

  if (user != null) {
    db.collection("post")
      .where("likedUser", "array-contains", uid)
      .get()
      .then((result) => {
        result.forEach((a) => {
          if (a.data().docId == docId) {
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

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (noInfo == false) {
        db.collection("user-info")
          .doc(uid)
          .get()
          .then((result) => {
            setNickname(result.data().nickname);
          });
      }
    } else {
    }
  });

  useEffect(() => {
    const min = 60;
    const hour = 60 * 60;
    const day = 60 * 60 * 24;
    const month = 60 * 60 * 24 * 30;
    const year = 60 * 60 * 24 * 365;

    const currentTime = new Date() / 1000;

    const timeGap = currentTime - timeStamp;
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
  }, [timeStamp]);

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
      if (mbti == key) {
        setBadgeColor(value);
      }
    });
  }, [mbti]);

  return (
    <>
      <Card
        style={{
          width: "100%",
          minWidth: "360px",
          maxWidth: "768px",
          margin: "15px 0px",
        }}
      >
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
                  {mbti}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <Link className="nickname">{nickname}</Link>

                <OverlayTrigger
                  placement="right"
                  overlay={
                    <Tooltip id="button-tooltip-2">{koreanTime}</Tooltip>
                  }
                >
                  <Link to={`/comments?docId=${docId}`} className="timestamp">
                    {time}
                  </Link>
                </OverlayTrigger>
              </div>
            </div>
            {user != null && uid == userId && (
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
                      history.push(`/edit?docId=${docId}`);
                    }}
                  >
                    Edit
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => {
                      if (window.confirm("삭제하시겠습니까?")) {
                        db.collection("post")
                          .doc(docId)
                          .delete();
                        db.collection("user-info")
                          .doc(uid)
                          .collection("posts")
                          .doc(docId)
                          .delete()
                          .then(() => {
                            history.push("/");
                          });
                      }
                    }}
                  >
                    Delete
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}

            {/* <div
            style={{
              fontSize: "16px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex" }}>
              <FaUserCircle size="36" color="#a0aec0"></FaUserCircle>
              <Link className="nickname">{nickname}</Link>

              <OverlayTrigger
                placement="right"
                overlay={<Tooltip id="button-tooltip-2">{koreanTime}</Tooltip>}
              >
                <Link
                  to={`/comments?docId=$props.docId}`}
                  className="timestamp"
                >
                  {time}
                </Link>
              </OverlayTrigger>
            </div> */}
          </div>
          {title}
        </Card.Header>
        <Card.Body>
          <Card.Text>{parse(content)}</Card.Text>
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
                          .doc(docId)
                          .update({
                            likes: cnt + 1,
                            likedUser: arrayUnion(uid),
                          }) &&
                        db
                          .collection("user-info")
                          .doc(uid)
                          .collection("likes")
                          .doc(docId)
                          .set({
                            docId: docId,
                            title: title,
                            timeStamp: Timestamp.now(),
                          })
                      : db
                          .collection("post")
                          .doc(docId)
                          .update({
                            likes: cnt - 1,
                            likedUser: arrayRemove(uid),
                          }) &&
                        db
                          .collection("user-info")
                          .doc(uid)
                          .collection("likes")
                          .doc(docId)
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
          <div
            style={{
              width: "90px",
              display: "flex",
              cursor: "default",
              height: "36px",
              margin: "5px 0",
              borderRadius: "3px",
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
          </div>

          <div
            className="footer"
            style={{
              width: "66px",
              display: "flex",
              cursor: "pointer",
              height: "36px",
              margin: "5px 0",
              borderRadius: "3px",
            }}
            onClick={() => {
              if (navigator.share) {
                navigator
                  .share({
                    title: `${title}`,
                    url: `https://mbtmi-96d3c.firebaseapp.com/comments?docId=${urlSearch.get(
                      "docId"
                    )}`,
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
        {/* <Card.Footer></Card.Footer> */}
      </Card>

      <Card
        style={{
          width: "100%",
          minWidth: "360px",
          maxWidth: "768px",
          marginTop: "10px",
        }}
      >
        <Card.Header className="d-flex flex-column align-items-end px-0">
          <Editor
            apiKey={tinymcekey}
            value={text}
            onInit={(evt, editor) => (editorRef.current = editor)}
            outputFormat="text"
            onEditorChange={(newText) => setText(newText)}
            init={{
              // max_height: 180,
              height: 60,
              width: "100%",
              language: "ko_KR",
              placeholder: "댓글을 입력하세요.",
              menubar: false,
              branding: false,
              statusbar: false,
              contextmenu: false,
              default_link_target: "_blank",
              plugins: ["link", "emoticons", "autoresize", "autolink"],
              toolbar: "| emoticons link |",
              extended_valid_elements: "a[href|target=_blank]",
              autoresize_on_init: false,
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          ></Editor>
          <div
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "0 10px",
              display: "flex",
              justifyContent: "space-between",
              background: "none",
            }}
          >
            <span
              style={{
                lineHeight: "42px",
                fontSize: "16px",
                marginLeft: "10px",
              }}
            >
              댓글 {comment.length}
            </span>
            {user != null ? (
              <Button
                disabled={text.length == 0 && true}
                type="submit"
                id="comment"
                className="rounded-pill"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  const newDoc = db
                    .collection("post")
                    .doc(docId)
                    .collection("comment")
                    .doc();
                  {
                    noInfo == true
                      ? history.push("/user?uid=" + user.uid)
                      : newDoc.set({
                          uid: uid,
                          commentId: newDoc.id,
                          nickname: nickname,
                          comment: text,
                          timeStamp: Timestamp.now(),
                        });
                    db.collection("user-info")
                      .doc(uid)
                      .collection("comments")
                      .doc(newDoc.id)
                      .set({
                        comment: text,
                        commentId: newDoc.id,
                        docId: docId,
                        timeStamp: Timestamp.now(),
                      })
                      .then(() => {
                        setText("");
                      });
                  }
                }}
              >
                Comment
              </Button>
            ) : (
              <Button
                className="rounded-pill mx-1"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  signInWithPopup(auth, provider)
                    .then()
                    .catch(() => {
                      console.log("로그인필요");
                    });
                }}
              >
                로그인
              </Button>
            )}
          </div>
        </Card.Header>
      </Card>

      {comment.map((a, i) => (
        <Card
          key={a.data.commentId}
          style={{
            width: "100%",
            minWidth: "360px",
            maxWidth: "768px",
            margin: "3px 0px",
          }}
        >
          <Card.Body>
            <div
              style={{
                fontSize: "16px",
                marginBottom: "20px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex" }}>
                <FaUserCircle size="36" color="#a0aec0"></FaUserCircle>
                <Link className="nickname">{a.data.nickname}</Link>
              </div>

              {user != null && uid == a.data.uid && (
                <Dropdown>
                  <Dropdown.Toggle
                    size="sm"
                    variant="white"
                    style={{ lineHeight: "20px" }}
                    className="more shadow-none rounded-pill px-1 py-1"
                  >
                    <FiMoreHorizontal
                      size="23"
                      color="#6E6E6E"
                    ></FiMoreHorizontal>
                  </Dropdown.Toggle>

                  <Dropdown.Menu
                    align="end"
                    variant="dark"
                    style={{ minWidth: "120px", fontSize: "18px" }}
                  >
                    <Dropdown.Item onClick={() => {}}>Edit</Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => {
                        if (window.confirm("댓글을 삭제하시겠습니까?")) {
                          db.collection("post")
                            .doc(docId)
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
            </div>

            <div
              style={{
                fontSize: "16px",
                // border: "1px solid #b5d5ff",
                // borderRadius: "7.5px",
                // padding: "10px",
              }}
            >
              {parse(a.data.comment)}
            </div>
            {/* <FiHeart size="17" color="#FF6C85"></FiHeart>
            <FaRegComment size="17" color="#777777"></FaRegComment> */}
          </Card.Body>
        </Card>
      ))}
    </>
  );
}
