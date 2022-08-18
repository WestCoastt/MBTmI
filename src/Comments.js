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
import BadgeColor from "./BadgeColor.js";
import CommentCard from "./CommentCard.js";
import EditorInit from "./EditorInit.js";
import times from "./times.js";
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
import { useLocation, useHistory, Link } from "react-router-dom";
import { Redirect } from "react-router-dom/cjs/react-router-dom.min.js";

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

  const [text, setText] = useState("");
  const editorRef = useRef(null);
  const [comment, setComment] = useState([]);
  const [commentNickname, setCommentNickname] = useState("");
  const [noInfo, setNoInfo] = useState();
  const [comments, setComments] = useState();
  const [totalScore, setTotalScore] = useState();
  const docId = urlSearch.get("docId");
  const [result, setResult] = useState();
  const [postDoc, setPostDoc] = useState();
  const [uidDoc, setUidDoc] = useState();

  if (docId == "" || window.location.search.includes("?docId=") == false) {
    return <Redirect to={"/404-not-found"} />;
  }

  useEffect(() => {
    if (docId && uid) {
      setPostDoc(db.collection("post").doc(docId));
      setUidDoc(db.collection("user-info").doc(uid));
    }
  }, []);

  db.collection("post")
    .doc(docId)
    .get()
    .then((doc) => {
      if (doc.exists) {
        setComments(doc.data().comments);
        setTotalScore(doc.data().totalScore);
      }
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
    db.collection("post")
      .doc(docId)
      .onSnapshot((result) => {
        if (result.exists) {
          setResult(result.data());
        } else {
          window.alert("삭제되었거나 존재하지 않는 게시물입니다.");
          history.goBack();
        }
      });
  }, []);

  if (user) {
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

  const checkLike = (arr, color) => {
    if (arr != null && arr.includes(uid)) {
      return "#FF6C85";
    } else {
      return color;
    }
  };

  return (
    <>
      {result && (
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
                  <p
                    className="badge"
                    style={{ background: BadgeColor(result.mbti) }}
                  >
                    {result.mbti}
                  </p>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Link to="" className="nickname">
                    {result.nickname}
                  </Link>

                  <OverlayTrigger
                    placement="right"
                    overlay={
                      <Tooltip id="button-tooltip-2">
                        {moment(result.timeStamp.seconds * 1000).format("llll")}
                      </Tooltip>
                    }
                  >
                    <span className="timestamp">
                      {times(result.timeStamp.seconds)}
                    </span>
                  </OverlayTrigger>
                </div>
              </div>
              {user != null && uid == result.uid && (
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
                          postDoc.delete();
                          uidDoc
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
            <h5>{result.title}</h5>
            <Card.Text style={{ margin: "0 3px" }}>
              {parse(result.content)}
            </Card.Text>
          </Card.Body>
          <Card.Footer
            className="text-muted d-flex justify-content-evenly px-2 py-0"
            style={{ background: "inherit", height: "38px" }}
          >
            <div
              className="footer"
              onClick={() => {
                if (user) {
                  if (noInfo) {
                    if (window.confirm("닉네임 설정 후 이용이 가능합니다.")) {
                      history.push("/user?uid=" + user.uid);
                    }
                  } else {
                    result.likedUser && result.likedUser.includes(uid)
                      ? postDoc.update({
                          likes: result.likes - 1,
                          totalScore: totalScore - 0.4,
                          likedUser: arrayRemove(uid),
                        }) &&
                        uidDoc
                          .collection("likes")
                          .doc(docId)
                          .delete()
                      : postDoc.update({
                          likes: result.likes + 1,
                          totalScore: totalScore + 0.4,
                          likedUser: arrayUnion(uid),
                        }) &&
                        uidDoc
                          .collection("likes")
                          .doc(docId)
                          .set({
                            docId: docId,
                            title: result.title,
                            timeStamp: Timestamp.now(),
                          });
                  }
                } else {
                  setModalShow(true);
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
                  color={checkLike(result.likedUser, "#777777")}
                  fill={checkLike(result.likedUser, "none")}
                ></FiHeart>
                <span
                  style={{
                    maxWidth: "48px",
                    lineHeight: "16px",
                    color: checkLike(result.likedUser, "#777777"),
                    textAlign: "center",
                  }}
                >
                  {result.likes}
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
                      title: `${result.title}`,
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
        </Card>
      )}

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
            init={EditorInit(true, "댓글을 입력하세요.")}
          ></Editor>
          {text.length > 1000 && (
            <p style={{ fontSize: "14px", margin: "0 16px 0 0", color: "red" }}>
              댓글의 글자수는 최대 1,000자로 제한됩니다.
            </p>
          )}
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
              댓글 {comments}
            </span>
            {user ? (
              <Button
                disabled={(text.length == 0 || text.length > 1000) && true}
                type="submit"
                id="comment"
                className="rounded-pill"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  const newDoc = postDoc.collection("comment").doc();
                  if (noInfo) {
                    if (window.confirm("닉네임 설정 후 이용이 가능합니다.")) {
                      history.push("/user?uid=" + user.uid);
                    }
                  } else {
                    newDoc.set({
                      uid: uid,
                      docId: docId,
                      commentId: newDoc.id,
                      nickname: commentNickname,
                      mbti: commentUserMbti,
                      comment: text,
                      likedUser: [],
                      likes: 0,
                      reply: 0,
                      timeStamp: Timestamp.now(),
                    });
                    uidDoc
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
                    postDoc.update({
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
            <div key={a.data.commentId}>
              <CommentCard
                data={a.data}
                uid={uid}
                docId={docId}
                index={i}
                user={user}
                comments={comments}
                totalScore={totalScore}
                noInfo={noInfo}
                postDoc={postDoc}
                uidDoc={uidDoc}
                editorKey={tinymcekey}
                commentNickname={commentNickname}
              />
              {/* <Container className="mt-1 comment">
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

                    {a.data.mbti && (
                      <p
                        className="badge small"
                        style={{ background: BadgeColor(a.data.mbti) }}
                      >
                        {a.data.mbti}
                      </p>
                    )}
                  </div>
                  {i == edit ? (
                    <Container className="d-flex flex-column align-items-end my-1 px-1">
                      <Editor
                        apiKey={tinymcekey}
                        value={editText}
                        onInit={(evt, editor) => (editorRef.current = editor)}
                        outputFormat="text"
                        onEditorChange={(newText) => setEditText(newText)}
                        init={editorInit(true, "댓글을 입력하세요.")}
                      ></Editor>
                      {editText.length > 1000 && (
                        <p
                          style={{
                            fontSize: "14px",
                            margin: "0",
                            color: "red",
                          }}
                        >
                          댓글의 글자수는 최대 1,000자로 제한됩니다.
                        </p>
                      )}
                      <div className="mt-2">
                        <Button
                          disabled={
                            (editText.length == 0 || editText.length > 1000) &&
                            true
                          }
                          type="submit"
                          id="comment"
                          className="rounded-pill me-1"
                          variant="primary"
                          size="sm"
                          onClick={() => {
                            postDoc
                              .collection("comment")
                              .doc(a.data.commentId)
                              .update({
                                comment: editText,
                              });

                            uidDoc
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
                                    {times(a.data.timeStamp.seconds)}
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
                                      const doc = postDoc
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
                                        uidDoc
                                          .collection("comments")
                                          .doc(a.data.commentId)
                                          .delete();
                                        postDoc.update({
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
                                    ? postDoc
                                        .collection("comment")
                                        .doc(a.data.commentId)
                                        .update({
                                          likes: a.data.likes + 1,
                                          likedUser: arrayUnion(uid),
                                        })
                                    : postDoc
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
                              postDoc
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
              </Container> */}

              {/* {i == reply && (
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

                          {r.data.mbti && (
                            <p
                              className="badge small"
                              style={{ background: BadgeColor(r.data.mbti) }}
                            >
                              {r.data.mbti}
                            </p>
                          )}
                        </div>

                        {i == reEdit ? (
                          <Container className="d-flex flex-column align-items-end my-1 px-1">
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
                              init={editorInit(false, "답글을 입력하세요.")}
                            ></Editor>
                            {reEditText.length > 1000 && (
                              <p
                                style={{
                                  fontSize: "14px",
                                  margin: "0",
                                  color: "red",
                                }}
                              >
                                답글의 글자수는 최대 1,000자로 제한됩니다.
                              </p>
                            )}
                            <div className="mt-2">
                              <Button
                                disabled={
                                  (reEditText.length == 0 ||
                                    reEditText.length > 1000) &&
                                  true
                                }
                                type="submit"
                                id="comment"
                                className="rounded-pill me-1"
                                variant="primary"
                                size="sm"
                                onClick={() => {
                                  postDoc
                                    .collection("comment")
                                    .doc(a.data.commentId)
                                    .collection("reply")
                                    .doc(r.data.replyId)
                                    .update({
                                      reply: reEditText,
                                    });
                                  uidDoc
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
                                        {times(r.data.timeStamp.seconds)}
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
                                          const commentDoc = postDoc
                                            .collection("comment")
                                            .doc(a.data.commentId);
                                          if (
                                            window.confirm(
                                              "답글을 삭제하시겠습니까?"
                                            )
                                          ) {
                                            commentDoc
                                              .collection("reply")
                                              .doc(r.data.replyId)
                                              .delete();
                                            uidDoc
                                              .collection("replies")
                                              .doc(r.data.replyId)
                                              .delete();
                                            commentDoc.update({
                                              reply: a.data.reply - 1,
                                            });
                                            if (a.data.reply == 1) {
                                              commentDoc.delete();
                                            }
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
                                  const replyDoc = postDoc
                                    .collection("comment")
                                    .doc(a.data.commentId)
                                    .collection("reply")
                                    .doc(r.data.replyId);
                                  {
                                    user != null
                                      ? noInfo == false
                                        ? r.data.likedUser != null &&
                                          r.data.likedUser.includes(uid) ==
                                            false
                                          ? replyDoc.update({
                                              likes: r.data.likes + 1,
                                              likedUser: arrayUnion(uid),
                                            })
                                          : replyDoc.update({
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
                        init={editorInit(false, "답글을 입력하세요.")}
                      ></Editor>
                      {replyText.length > 1000 && (
                        <p
                          style={{
                            fontSize: "14px",
                            margin: "0",
                            color: "red",
                          }}
                        >
                          답글의 글자수는 최대 1,000자로 제한됩니다.
                        </p>
                      )}
                      {user ? (
                        <div className="mt-2">
                          <Button
                            disabled={
                              (replyText.length == 0 ||
                                replyText.length > 1000) &&
                              true
                            }
                            type="submit"
                            className="rounded-pill"
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              const newDoc = postDoc
                                .collection("comment")
                                .doc(a.data.commentId)
                                .collection("reply")
                                .doc();
                              {
                                noInfo == true
                                  ? history.push("/user?uid=" + user.uid)
                                  : newDoc.set({
                                      uid: uid,
                                      docId: docId,
                                      commentId: a.data.commentId,
                                      replyId: newDoc.id,
                                      nickname: commentNickname,
                                      mbti: commentUserMbti,
                                      reply: replyText,
                                      likedUser: [],
                                      likes: 0,
                                      timeStamp: Timestamp.now(),
                                    });
                                uidDoc
                                  .collection("replies")
                                  .doc(newDoc.id)
                                  .set({
                                    reply: replyText,
                                    replyId: newDoc.id,
                                    commentId: a.data.commentId,
                                    docId: docId,
                                    timeStamp: Timestamp.now(),
                                  })
                                  .then(() => {
                                    setReplyText("");
                                  });
                                postDoc
                                  .collection("comment")
                                  .doc(a.data.commentId)
                                  .update({
                                    reply: a.data.reply + 1,
                                  });
                              }
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
              )} */}
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
