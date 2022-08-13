/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Button,
  Dropdown,
  OverlayTrigger,
  Tooltip,
  Container,
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
import { useId } from "react";

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
  const [edit, setEdit] = useState();
  const [editText, setEditText] = useState("");
  const [reply, setReply] = useState();
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState([]);
  const [reEdit, setReEdit] = useState();
  const [reEditText, setReEditText] = useState("");

  db.collection("post")
    .doc(docId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        setCnt(doc.data().likes);
        setComments(doc.data().comments);
        setTotalScore(doc.data().totalScore);
      }
      // setCnt(doc.data().likes);
      // setComments(doc.data().comments);
      // setTotalScore(doc.data().totalScore);
    });

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

  const checkLike = (arr, color) => {
    if (arr != null && arr.includes(uid)) {
      return "#FF6C85";
    } else {
      return color;
    }
  };

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
                <Link to="" className="nickname">
                  {nickname}
                </Link>

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
                    수정하기
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
                    삭제하기
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            )}
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
                color={like == true ? "#FF6C85" : "#777777"}
                fill={like == true ? "#FF6C85" : "none"}
              ></FiHeart>
              <span
                style={{
                  maxWidth: "48px",
                  lineHeight: "16px",
                  color: like == true ? "#FF6C85" : "#777777",
                  textAlign: "center",
                }}
              >
                {cnt}
              </span>
            </div>
          </div>

          <div
            className="footer"
            style={{ background: "none", cursor: "default" }}
          >
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
            style={{ width: "66px" }}
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
            {user ? (
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
                          likedUser: [],
                          likes: 0,
                          reply: 0,
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
                댓글 달기
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

      {comment.length > 0 && (
        <Card
          style={{
            width: "100%",
            minWidth: "360px",
            maxWidth: "768px",
            margin: "3px 0px",
            padding: "15px 0px 10px 0px",
          }}
        >
          {comment.map((a, i) => (
            <>
              <Container key={a.data.commentId} className="mt-1 comment">
                <div style={{ display: "flex" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: "6px",
                    }}
                  >
                    <FaUserCircle
                      size="32"
                      color="#a0aec0"
                      style={{ margin: "0 7px" }}
                    ></FaUserCircle>

                    {a.data.mbti &&
                      Object.entries(palette).map(
                        ([key, value]) =>
                          a.data.mbti == key && (
                            <p
                              key={a.data.commentId}
                              className="badge"
                              style={{
                                background: `${value}`,
                                width: "40px",
                                fontSize: "11px",
                                marginLeft: "3px",
                              }}
                            >
                              {a.data.mbti}
                            </p>
                          )
                      )}
                  </div>
                  {i == edit ? (
                    <Container
                      key={a.data.commentId}
                      className="d-flex flex-column align-items-end my-1 px-1"
                    >
                      <Editor
                        apiKey={tinymcekey}
                        value={editText}
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        outputFormat="text"
                        onEditorChange={(newText) => setEditText(newText)}
                        init={{
                          // max_height: 180,
                          height: 10,
                          width: "100%",
                          language: "ko_KR",
                          placeholder: "댓글을 입력하세요.",
                          menubar: false,
                          branding: false,
                          statusbar: false,
                          contextmenu: false,
                          default_link_target: "_blank",
                          plugins: [
                            "link",
                            "emoticons",
                            "autoresize",
                            "autolink",
                          ],
                          toolbar: "| emoticons link |",
                          extended_valid_elements: "a[href|target=_blank]",
                          autoresize_on_init: false,
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                      ></Editor>
                      <div className="mt-2">
                        <Button
                          disabled={editText.length == 0 && true}
                          type="submit"
                          id="comment"
                          className="rounded-pill me-1"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            db.collection("post")
                              .doc(docId)
                              .collection("comment")
                              .doc(a.data.commentId)
                              .update({
                                comment: editText,
                              });

                            db.collection("user-info")
                              .doc(uid)
                              .collection("comments")
                              .doc(a.data.commentId)
                              .update({
                                comment: editText,
                              });
                            setEdit();
                          }}
                        >
                          완료
                        </Button>
                        <Button
                          type="submit"
                          id="comment"
                          className="rounded-pill"
                          variant="outline-dark"
                          size="sm"
                          onClick={() => {
                            setEdit();
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </Container>
                  ) : (
                    <Container className="px-0">
                      {a.data.comment ? (
                        <Card.Body
                          className="mx-1 pt-0 pb-1 px-2"
                          style={{ background: "#E9EBEE", borderRadius: "5px" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <div style={{ display: "flex" }}>
                              <div
                                style={{
                                  display: "flex",
                                }}
                              >
                                <Link
                                  to=""
                                  className="nickname"
                                  style={{
                                    fontSize: "14px",
                                    marginLeft: "2px",
                                    lineHeight: "30px",
                                  }}
                                >
                                  {a.data.nickname}
                                </Link>

                                <OverlayTrigger
                                  placement={
                                    window.innerWidth < 576 ? "top" : "right"
                                  }
                                  overlay={
                                    <Tooltip id="button-tooltip-2">
                                      {moment(
                                        a.data.timeStamp.seconds * 1000
                                      ).format("llll")}
                                    </Tooltip>
                                  }
                                >
                                  <span
                                    className="timestamp mx-2"
                                    style={{
                                      fontSize: "12px",
                                      lineHeight: "36px",
                                    }}
                                  >
                                    {currentTime - a.data.timeStamp.seconds >
                                    year
                                      ? Math.floor(
                                          (currentTime -
                                            a.data.timeStamp.seconds) /
                                            year
                                        ) + "년 전"
                                      : currentTime - a.data.timeStamp.seconds >
                                        month
                                      ? Math.floor(
                                          (currentTime -
                                            a.data.timeStamp.seconds) /
                                            month
                                        ) + "개월 전"
                                      : currentTime - a.data.timeStamp.seconds >
                                        day
                                      ? Math.floor(
                                          (currentTime -
                                            a.data.timeStamp.seconds) /
                                            day
                                        ) + "일 전"
                                      : currentTime - a.data.timeStamp.seconds >
                                        hour
                                      ? Math.floor(
                                          (currentTime -
                                            a.data.timeStamp.seconds) /
                                            hour
                                        ) + "시간 전"
                                      : currentTime - a.data.timeStamp.seconds >
                                        min
                                      ? Math.floor(
                                          (currentTime -
                                            a.data.timeStamp.seconds) /
                                            min
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
                                  style={{
                                    minWidth: "120px",
                                    fontSize: "18px",
                                  }}
                                >
                                  <Dropdown.Item
                                    onClick={() => {
                                      setEditText(a.data.comment);
                                      setEdit(i);
                                    }}
                                  >
                                    수정하기
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    onClick={() => {
                                      const doc = db
                                        .collection("post")
                                        .doc(docId)
                                        .collection("comment")
                                        .doc(a.data.commentId);
                                      if (
                                        window.confirm(
                                          "댓글을 삭제하시겠습니까?"
                                        )
                                      ) {
                                        if (a.data.reply == 0) {
                                          doc.delete();
                                        } else {
                                          doc.update({
                                            comment: null,
                                            mbti: null,
                                            nickname: null,
                                            uid: null,
                                          });
                                        }
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
                                    삭제하기
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            )}
                          </div>

                          <div
                            className="comment-content"
                            style={{
                              margin: "0 3px",
                            }}
                          >
                            {parse(a.data.comment)}
                          </div>
                        </Card.Body>
                      ) : (
                        <Card.Body
                          className="mx-1 px-2 py-2"
                          style={{ background: "#E9EBEE", borderRadius: "5px" }}
                        >
                          <p style={{ color: "gray", margin: "0" }}>
                            작성자에 의해 삭제된 댓글입니다.
                          </p>
                        </Card.Body>
                      )}
                      <Card.Footer
                        className="text-muted d-flex justify-content-start px-0 py-0 mt-0 mb-0"
                        style={{
                          background: "inherit",
                          height: "30px",
                          border: "none",
                        }}
                      >
                        <div
                          className="comment-footer"
                          style={{
                            display: "flex",
                            cursor: "pointer",
                            borderRadius: "3px",
                          }}
                          onClick={() => {
                            {
                              user != null
                                ? noInfo == false
                                  ? a.data.likedUser != null &&
                                    a.data.likedUser.includes(uid) == false
                                    ? db
                                        .collection("post")
                                        .doc(docId)
                                        .collection("comment")
                                        .doc(a.data.commentId)
                                        .update({
                                          likes: a.data.likes + 1,
                                          likedUser: arrayUnion(uid),
                                        })
                                    : db
                                        .collection("post")
                                        .doc(docId)
                                        .collection("comment")
                                        .doc(a.data.commentId)
                                        .update({
                                          likes: a.data.likes - 1,
                                          likedUser: arrayRemove(uid),
                                        })
                                  : history.push("/user?uid=" + user.uid)
                                : setModalShow(true);
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
                              size="14"
                              color={checkLike(a.data.likedUser, "#777777")}
                              fill={checkLike(a.data.likedUser, "none")}
                            ></FiHeart>

                            <span
                              style={{
                                color: checkLike(a.data.likedUser, "#777777"),
                              }}
                            >
                              {a.data.likes}
                            </span>
                          </div>
                        </div>
                        <div className="comment-footer" to={`/`}>
                          <div
                            style={{
                              width: "100%",
                              margin: "auto",
                              display: "flex",
                              justifyContent: "space-evenly",
                            }}
                            onClick={() => {
                              {
                                reply != null
                                  ? reply == i
                                    ? setReply()
                                    : setReply(i)
                                  : setReply(i);
                              }
                              db.collection("post")
                                .doc(docId)
                                .collection("comment")
                                .doc(a.data.commentId)
                                .collection("reply")
                                .orderBy("timeStamp", "asc")
                                .onSnapshot((snapshot) => {
                                  const replyArr = snapshot.docs.map((doc) => ({
                                    data: doc.data(),
                                  }));
                                  setReplies(replyArr);
                                });
                            }}
                          >
                            <FaRegComment
                              size="14"
                              color="#777777"
                            ></FaRegComment>
                            <span style={{ color: "#777777" }}>
                              {a.data.reply}
                            </span>
                          </div>
                        </div>
                      </Card.Footer>
                    </Container>
                  )}
                </div>
              </Container>

              {i == reply && (
                <>
                  {replies.map((r, i) => (
                    <Container key={r.data.replyId} className="reply mt-1">
                      <div style={{ display: "flex" }}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            marginTop: "6px",
                          }}
                        >
                          <FaUserCircle
                            size="32"
                            color="#a0aec0"
                            style={{ margin: "0 7px" }}
                          ></FaUserCircle>

                          {Object.entries(palette).map(
                            ([key, value]) =>
                              r.data.mbti == key && (
                                <p
                                  key={r.data.replyId}
                                  className="badge"
                                  style={{
                                    background: `${value}`,
                                    width: "40px",
                                    fontSize: "11px",
                                    marginLeft: "3px",
                                  }}
                                >
                                  {r.data.mbti}
                                </p>
                              )
                          )}
                        </div>

                        {i == reEdit ? (
                          <Container
                            key={r.data.replyId}
                            className="d-flex flex-column align-items-end my-1 px-1"
                          >
                            <Editor
                              apiKey={tinymcekey}
                              value={reEditText}
                              onInit={(evt, editor) =>
                                (editorRef.current = editor)
                              }
                              outputFormat="text"
                              onEditorChange={(newText) =>
                                setReEditText(newText)
                              }
                              init={{
                                // max_height: 180,
                                height: 10,
                                width: "100%",
                                language: "ko_KR",
                                placeholder: "댓글을 입력하세요.",
                                menubar: false,
                                branding: false,
                                statusbar: false,
                                contextmenu: false,
                                default_link_target: "_blank",
                                plugins: [
                                  "link",
                                  "emoticons",
                                  "autoresize",
                                  "autolink",
                                ],
                                toolbar: "| emoticons link |",
                                extended_valid_elements:
                                  "a[href|target=_blank]",
                                autoresize_on_init: false,
                                content_style:
                                  "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                              }}
                            ></Editor>
                            <div className="mt-2">
                              <Button
                                disabled={reEditText.length == 0 && true}
                                type="submit"
                                id="comment"
                                className="rounded-pill me-1"
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  db.collection("post")
                                    .doc(docId)
                                    .collection("comment")
                                    .doc(a.data.commentId)
                                    .collection("reply")
                                    .doc(r.data.replyId)
                                    .update({
                                      reply: reEditText,
                                    });
                                  db.collection("user-info")
                                    .doc(uid)
                                    .collection("replies")
                                    .doc(r.data.replyId)
                                    .update({
                                      reply: reEditText,
                                    });
                                  setReEdit();
                                }}
                              >
                                완료
                              </Button>
                              <Button
                                type="submit"
                                id="comment"
                                className="rounded-pill"
                                variant="outline-dark"
                                size="sm"
                                onClick={() => {
                                  setReEdit();
                                }}
                              >
                                취소
                              </Button>
                            </div>
                          </Container>
                        ) : (
                          <Container className="px-0">
                            <Card.Body
                              className="mx-1 pt-0 pb-1 px-2"
                              style={{
                                background: "#E9EBEE",
                                borderRadius: "5px",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div style={{ display: "flex" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                    }}
                                  >
                                    <Link
                                      to=""
                                      className="nickname"
                                      style={{
                                        fontSize: "14px",
                                        marginLeft: "2px",
                                        lineHeight: "30px",
                                      }}
                                    >
                                      {r.data.nickname}
                                    </Link>

                                    <OverlayTrigger
                                      placement={
                                        window.innerWidth < 576
                                          ? "top"
                                          : "right"
                                      }
                                      overlay={
                                        <Tooltip id="button-tooltip-2">
                                          {moment(
                                            r.data.timeStamp.seconds * 1000
                                          ).format("llll")}
                                        </Tooltip>
                                      }
                                    >
                                      <span
                                        className="timestamp mx-2"
                                        style={{
                                          fontSize: "12px",
                                          lineHeight: "36px",
                                        }}
                                      >
                                        {currentTime -
                                          r.data.timeStamp.seconds >
                                        year
                                          ? Math.floor(
                                              (currentTime -
                                                r.data.timeStamp.seconds) /
                                                year
                                            ) + "년 전"
                                          : currentTime -
                                              r.data.timeStamp.seconds >
                                            month
                                          ? Math.floor(
                                              (currentTime -
                                                r.data.timeStamp.seconds) /
                                                month
                                            ) + "개월 전"
                                          : currentTime -
                                              r.data.timeStamp.seconds >
                                            day
                                          ? Math.floor(
                                              (currentTime -
                                                r.data.timeStamp.seconds) /
                                                day
                                            ) + "일 전"
                                          : currentTime -
                                              r.data.timeStamp.seconds >
                                            hour
                                          ? Math.floor(
                                              (currentTime -
                                                r.data.timeStamp.seconds) /
                                                hour
                                            ) + "시간 전"
                                          : currentTime -
                                              r.data.timeStamp.seconds >
                                            min
                                          ? Math.floor(
                                              (currentTime -
                                                r.data.timeStamp.seconds) /
                                                min
                                            ) + "분 전"
                                          : "방금 전"}
                                      </span>
                                    </OverlayTrigger>
                                  </div>
                                </div>

                                {user != null && uid == r.data.uid && (
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
                                      style={{
                                        minWidth: "120px",
                                        fontSize: "18px",
                                      }}
                                    >
                                      <Dropdown.Item
                                        onClick={() => {
                                          setReEditText(r.data.reply);
                                          setReEdit(i);
                                        }}
                                      >
                                        수정하기
                                      </Dropdown.Item>
                                      <Dropdown.Item
                                        onClick={() => {
                                          if (
                                            window.confirm(
                                              "답글을 삭제하시겠습니까?"
                                            )
                                          ) {
                                            db.collection("post")
                                              .doc(docId)
                                              .collection("comment")
                                              .doc(a.data.commentId)
                                              .collection("reply")
                                              .doc(r.data.replyId)
                                              .delete();
                                            db.collection("user-info")
                                              .doc(uid)
                                              .collection("replies")
                                              .doc(r.data.replyId)
                                              .delete();
                                            db.collection("post")
                                              .doc(docId)
                                              .collection("comment")
                                              .doc(a.data.commentId)
                                              .update({
                                                reply: a.data.reply - 1,
                                              });
                                          }
                                        }}
                                      >
                                        삭제하기
                                      </Dropdown.Item>
                                    </Dropdown.Menu>
                                  </Dropdown>
                                )}
                              </div>

                              <div
                                className="comment-content"
                                style={{
                                  margin: "0 3px",
                                }}
                              >
                                {parse(r.data.reply)}
                              </div>
                            </Card.Body>
                            <Card.Footer
                              className="text-muted d-flex justify-content-start px-0 py-0 mt-0 mb-0"
                              style={{
                                background: "inherit",
                                height: "30px",
                                border: "none",
                              }}
                            >
                              <div
                                className="comment-footer"
                                style={{
                                  display: "flex",
                                  cursor: "pointer",
                                  borderRadius: "3px",
                                }}
                                onClick={() => {
                                  {
                                    user != null
                                      ? noInfo == false
                                        ? r.data.likedUser != null &&
                                          r.data.likedUser.includes(uid) ==
                                            false
                                          ? db
                                              .collection("post")
                                              .doc(docId)
                                              .collection("comment")
                                              .doc(a.data.commentId)
                                              .collection("reply")
                                              .doc(r.data.replyId)
                                              .update({
                                                likes: r.data.likes + 1,
                                                likedUser: arrayUnion(uid),
                                              })
                                          : db
                                              .collection("post")
                                              .doc(docId)
                                              .collection("comment")
                                              .doc(a.data.commentId)
                                              .collection("reply")
                                              .doc(r.data.replyId)
                                              .update({
                                                likes: r.data.likes - 1,
                                                likedUser: arrayRemove(uid),
                                              })
                                        : history.push("/user?uid=" + user.uid)
                                      : setModalShow(true);
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
                                    size="14"
                                    color={checkLike(
                                      r.data.likedUser,
                                      "#777777"
                                    )}
                                    fill={checkLike(r.data.likedUser, "none")}
                                  ></FiHeart>

                                  <span
                                    style={{
                                      color: checkLike(
                                        r.data.likedUser,
                                        "#777777"
                                      ),
                                    }}
                                  >
                                    {r.data.likes}
                                  </span>
                                </div>
                              </div>
                            </Card.Footer>
                          </Container>
                        )}
                      </div>
                    </Container>
                  ))}
                  {reEdit == null && (
                    <Container className="d-flex flex-column align-items-end my-2 pe-3 reply-editor">
                      <Editor
                        apiKey={tinymcekey}
                        value={replyText}
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        outputFormat="text"
                        onEditorChange={(newText) => setReplyText(newText)}
                        init={{
                          // max_height: 180,
                          height: 10,
                          width: "100%",
                          language: "ko_KR",
                          placeholder: "답글을 입력하세요.",
                          menubar: false,
                          toolbar: false,
                          branding: false,
                          statusbar: false,
                          contextmenu: false,
                          default_link_target: "_blank",
                          plugins: ["link", "autoresize", "autolink"],
                          extended_valid_elements: "a[href|target=_blank]",
                          autoresize_on_init: false,
                          content_style:
                            "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                        }}
                      ></Editor>
                      {user ? (
                        <div className="mt-2">
                          <Button
                            disabled={replyText.length == 0 && true}
                            type="submit"
                            // id="comment"
                            className="rounded-pill"
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const newDoc = db
                                .collection("post")
                                .doc(docId)
                                .collection("comment")
                                .doc(a.data.commentId)
                                .collection("reply")
                                .doc();
                              {
                                noInfo == true
                                  ? history.push("/user?uid=" + user.uid)
                                  : newDoc.set({
                                      uid: uid,
                                      replyId: newDoc.id,
                                      nickname: commentNickname,
                                      mbti: commentUserMbti,
                                      reply: replyText,
                                      likedUser: [],
                                      likes: 0,
                                      timeStamp: Timestamp.now(),
                                    });
                                db.collection("user-info")
                                  .doc(uid)
                                  .collection("replies")
                                  .doc(newDoc.id)
                                  .set({
                                    reply: replyText,
                                    replyId: newDoc.id,
                                    docId: docId,
                                    timeStamp: Timestamp.now(),
                                  })
                                  .then(() => {
                                    setReplyText("");
                                  });
                                db.collection("post")
                                  .doc(docId)
                                  .collection("comment")
                                  .doc(a.data.commentId)
                                  .update({
                                    reply: a.data.reply + 1,
                                  });
                              }
                              // setReply();
                            }}
                          >
                            등록
                          </Button>
                        </div>
                      ) : (
                        <Button
                          className="rounded-pill mx-1 mt-1"
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
                    </Container>
                  )}
                </>
              )}
              {/* </>
            )} */}
            </>
          ))}
        </Card>
      )}
    </>
  );
}

// {
//   const newDoc = db
//                     .collection("post")
//                     .doc(docId)
//                     .collection("comment")
//                     .doc(a.data.commentId)
//                     .collection("reply")
//                     .doc()

//                   {
//                     noInfo == true
//                       ? history.push("/user?uid=" + user.uid)
//                       : newDoc.set({
//                           uid: uid,
//                           commentId: newDoc.id,
//                           nickname: commentNickname,
//                           mbti: commentUserMbti,
//                           comment: text,
//                           likedUser: [],
//                           likes: 0,
//                           timeStamp: Timestamp.now(),

// }

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
