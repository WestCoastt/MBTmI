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
import { useHistory, Link } from "react-router-dom";
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

  if (docId === "" || window.location.search.includes("?docId=") === false) {
    return <Redirect to={"/404-not-found"} />;
  }

  useEffect(() => {
    if (docId) {
      setPostDoc(db.collection("post").doc(docId));
    }
    if (uid) {
      setUidDoc(db.collection("user-info").doc(uid));
    }
  }, [docId, uid]);

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

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (noInfo === false) {
        db.collection("user-info")
          .doc(uid)
          .get()
          .then((result) => {
            setCommentNickname(result.data().nickname);
          });
      }
    }
  });

  const checkLike = (arr, color) => {
    if (arr && arr.includes(uid)) {
      return "#FF6C85";
    } else {
      return color;
    }
  };

  return (
    <>
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
      {result && (
        <Card
          style={{
            width: "100%",
            minWidth: "360px",
            maxWidth: "768px",
            margin: "15px 0px",
          }}
        >
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
              {user && uid === result.uid && (
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
            <div style={{ margin: "0 3px" }}>{parse(result.content)}</div>
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
                disabled={(text.length === 0 || text.length > 1000) && true}
                type="submit"
                id="comment"
                className="rounded-pill"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  if (noInfo) {
                    if (window.confirm("닉네임 설정 후 이용이 가능합니다.")) {
                      history.push("/user?uid=" + user.uid);
                    }
                  } else {
                    const newDoc = postDoc.collection("comment").doc();
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
            </div>
          ))}
        </Card>
      )}
    </>
  );
}
