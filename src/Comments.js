/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import moment from "moment";
import "moment/locale/ko";
import { db } from "./index.js";
import LoginModal from "./LoginModal";
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
  const commentUserMbti = window.localStorage.getItem("MBTI");
  const urlSearch = new URLSearchParams(window.location.search);
  const provider = new GoogleAuthProvider();
  const auth = getAuth();
  const user = auth.currentUser;
  const tinymcekey = process.env.REACT_APP_TINYMCE_KEY;
  const history = useHistory();
  const [modalShow, setModalShow] = React.useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [userId, setUserId] = useState("");
  const [text, setText] = useState("");
  const editorRef = useRef(null);
  const [comment, setComment] = useState([]);
  const [nickname, setNickname] = useState("");
  const [commentNickname, setCommentNickname] = useState("");
  const [mbti, setMbti] = useState("");
  const [badgeColor, setBadgeColor] = useState();
  const [noInfo, setNoInfo] = useState();
  const [like, setLike] = useState(false);
  const [cnt, setCnt] = useState();
  const [comments, setComments] = useState();
  const [totalScore, setTotalScore] = useState();
  const [timeStamp, setTimeStamp] = useState();
  const [time, setTime] = useState();
  const koreanTime = moment(timeStamp * 1000).format("llll");
  const docId = urlSearch.get("docId");

  db.collection("post")
    .doc(docId)
    .get()
    .then((doc) => {
      setCnt(doc.data().likes);
      setComments(doc.data().comments);
      setTotalScore(doc.data().totalScore);
    });
  // .catch(() => {});

  useEffect(() => {
    db.collection("post")
      .doc(docId)
      .collection("comment")
      .orderBy("timeStamp", "asc")
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
        setNickname(result.data().nickname);
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
      setModalShow(false);
      if (noInfo == false) {
        db.collection("user-info")
          .doc(uid)
          .get()
          .then((result) => {
            setCommentNickname(result.data().nickname);
          });
      }
    } else {
    }
  });

  const min = 60;
  const hour = 60 * 60;
  const day = 60 * 60 * 24;
  const month = 60 * 60 * 24 * 30;
  const year = 60 * 60 * 24 * 365;

  const currentTime = new Date() / 1000;

  useEffect(() => {
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

  const palette = {
    ISTJ: "#1f55de",
    ISFJ: "#7DCE13",
    ISTP: "#a7a7a7",
    ISFP: "#FFB4B4",
    INTJ: "#3AB4F2",
    INFJ: "#b2a4ff",
    INTP: "#009DAE",
    INFP: "#9900F0",
    ESTJ: "#935f2f",
    ESFJ: "#FFD124",
    ESTP: "#1F4690",
    ESFP: "#F637EC",
    ENTJ: "#F32424",
    ENFJ: "#FF5F00",
    ENTP: "#545f5f",
    ENFP: "#019267",
  };
  useEffect(() => {
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
        <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
        <Card.Header
          className="pb-0"
          style={{ background: "inherit", border: "none" }}
        >
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
                  <span className="timestamp">{time}</span>
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
        </Card.Header>
        <Card.Body className="py-1">
          <h5>{title}</h5>
          <Card.Text style={{ margin: "0 3px" }}>{parse(content)}</Card.Text>
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
              {
                user != null
                  ? noInfo == false
                    ? like == false
                      ? db
                          .collection("post")
                          .doc(docId)
                          .update({
                            likes: cnt + 1,
                            totalScore: totalScore + 0.4,
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
                            totalScore: totalScore - 0.4,
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
                  : setModalShow(true);
                //  signInWithPopup(auth, provider)
                //     .then()
                //     .catch(() => {
                //       console.log("로그인필요");
                //     });
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
                size="18"
                color="#FF6C85"
                fill={like == true ? "#FF6C85" : "none"}
              ></FiHeart>
              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "16px",
                  color: "#FF6C85",
                  textAlign: "center",
                }}
              >
                {cnt}
              </span>
            </div>
          </div>

          <div className="footer" style={{ background: "none" }}>
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
                {/* {comment.length} */}
                {comments}
              </span>
            </div>
          </div>

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
              <FiShare2 size="18" color="#777777"></FiShare2>
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
              {/* 댓글 {comment.length} */}
              댓글 {comments}
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
                          nickname: commentNickname,
                          mbti: commentUserMbti,
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
                    db.collection("post")
                      .doc(docId)
                      .update({
                        comments: comments + 1,
                        totalScore: totalScore + 0.6,
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
                marginBottom: "4px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {/* <div style={{ display: "flex" }}>
                <FaUserCircle size="36" color="#a0aec0"></FaUserCircle>
                <Link className="nickname">{a.data.nickname}</Link>
                <span>{a.data.mbti}</span>
              </div> */}

              <div style={{ display: "flex" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <FaUserCircle
                    size="36"
                    color="#a0aec0"
                    style={{ margin: "0 7px" }}
                  ></FaUserCircle>

                  {Object.entries(palette).map(
                    ([key, value]) =>
                      a.data.mbti == key && (
                        <p
                          className="badge"
                          style={{
                            background: `${value}`,
                          }}
                        >
                          {a.data.mbti}
                        </p>
                      )
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Link className="nickname">{a.data.nickname}</Link>

                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="button-tooltip-2">
                        {moment(a.data.timeStamp.seconds * 1000).format("llll")}
                      </Tooltip>
                    }
                  >
                    <span className="timestamp">
                      {currentTime - a.data.timeStamp.seconds > year
                        ? Math.floor(
                            (currentTime - a.data.timeStamp.seconds) / year
                          ) + "년 전"
                        : currentTime - a.data.timeStamp.seconds > month
                        ? Math.floor(
                            (currentTime - a.data.timeStamp.seconds) / month
                          ) + "개월 전"
                        : currentTime - a.data.timeStamp.seconds > day
                        ? Math.floor(
                            (currentTime - a.data.timeStamp.seconds) / day
                          ) + "일 전"
                        : currentTime - a.data.timeStamp.seconds > hour
                        ? Math.floor(
                            (currentTime - a.data.timeStamp.seconds) / hour
                          ) + "시간 전"
                        : currentTime - a.data.timeStamp.seconds > min
                        ? Math.floor(
                            (currentTime - a.data.timeStamp.seconds) / min
                          ) + "분 전"
                        : "방금 전"}
                    </span>
                  </OverlayTrigger>
                </div>
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
                          db.collection("post")
                            .doc(docId)
                            .update({
                              comments: comments - 1,
                              totalScore: totalScore - 0.6,
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

            <div
              style={{
                margin: "0 3px",
              }}
            >
              {parse(a.data.comment)}
            </div>
          </Card.Body>
        </Card>
      ))}
    </>
  );
}

{
  /* <Card.Header
          className="pb-0"
          style={{ background: "inherit", border: "none" }}
        >
          <div
            style={{
              fontSize: "16px",
              // marginBottom: "6px",
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
           
        </Card.Header>
        <Card.Body className="py-1">
          <h5>{props.title}</h5>
          <Card.Text
            className={cliHeight && "masking"}
            ref={elementRef}
            style={{
              maxHeight: "500px",
              overflow: "hidden",
              margin: "0 3px",
            }}
          >
            {parse(props.content)}
          </Card.Text>
         
          )}
        </Card.Body>
        <Card.Footer
          className="text-muted d-flex justify-content-evenly px-2 py-0"
          style={{ background: "inherit" }}
        ></Card.Footer> */
}
