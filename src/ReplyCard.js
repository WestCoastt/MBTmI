import React, { useState, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { arrayUnion, arrayRemove, Timestamp } from "firebase/firestore";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import BadgeColor from "./BadgeColor.js";
import EditorInit from "./EditorInit.js";
import times from "./times.js";
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
import parse from "html-react-parser";
import { Editor } from "@tinymce/tinymce-react";
import { FiHeart, FiMoreHorizontal } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";

export default function ReplyCard(props) {
  const commentUserMbti = window.localStorage.getItem("MBTI");
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const history = useHistory();
  const postDoc = props.postDoc;
  const uidDoc = props.uidDoc;
  const tinymcekey = props.editorKey;
  const editorRef = useRef(null);
  const [modalShow, setModalShow] = React.useState(false);
  const [replyText, setReplyText] = useState("");
  const [reEdit, setReEdit] = useState();
  const [reEditText, setReEditText] = useState("");

  const checkLike = (arr, color) => {
    if (arr != null && arr.includes(props.uid)) {
      return "#FF6C85";
    } else {
      return color;
    }
  };

  return (
    <>
      {props.replies.map((r, i) => (
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
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  outputFormat="text"
                  onEditorChange={(newText) => setReEditText(newText)}
                  init={EditorInit(false, "답글을 입력하세요.")}
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
                      (reEditText.length == 0 || reEditText.length > 1000) &&
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
                        .doc(props.data.commentId)
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
                          placement={window.innerWidth < 576 ? "top" : "right"}
                          overlay={
                            <Tooltip id="button-tooltip-2">
                              {moment(r.data.timeStamp.seconds * 1000).format(
                                "llll"
                              )}
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

                    {props.user != null && props.uid == r.data.uid && (
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
                                .doc(props.data.commentId);
                              if (window.confirm("답글을 삭제하시겠습니까?")) {
                                commentDoc
                                  .collection("reply")
                                  .doc(r.data.replyId)
                                  .delete();
                                uidDoc
                                  .collection("replies")
                                  .doc(r.data.replyId)
                                  .delete();
                                commentDoc.update({
                                  reply: props.data.reply - 1,
                                });
                                if (props.data.reply == 1) {
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
                        .doc(props.data.commentId)
                        .collection("reply")
                        .doc(r.data.replyId);
                      {
                        props.user != null
                          ? props.noInfo == false
                            ? r.data.likedUser != null &&
                              r.data.likedUser.includes(props.uid) == false
                              ? replyDoc.update({
                                  likes: r.data.likes + 1,
                                  likedUser: arrayUnion(props.uid),
                                })
                              : replyDoc.update({
                                  likes: r.data.likes - 1,
                                  likedUser: arrayRemove(props.uid),
                                })
                            : history.push("/user?uid=" + props.user.uid)
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
                        color={checkLike(r.data.likedUser, "#777777")}
                        fill={checkLike(r.data.likedUser, "none")}
                      ></FiHeart>

                      <span
                        style={{
                          color: checkLike(r.data.likedUser, "#777777"),
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
            init={EditorInit(false, "답글을 입력하세요.")}
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
          {props.user ? (
            <div className="mt-2">
              <Button
                disabled={
                  (replyText.length == 0 || replyText.length > 1000) && true
                }
                type="submit"
                className="rounded-pill"
                variant="primary"
                size="sm"
                onClick={() => {
                  const newDoc = postDoc
                    .collection("comment")
                    .doc(props.data.commentId)
                    .collection("reply")
                    .doc();
                  {
                    props.noInfo == true
                      ? history.push("/user?uid=" + props.user.uid)
                      : newDoc.set({
                          uid: props.uid,
                          docId: props.docId,
                          commentId: props.data.commentId,
                          replyId: newDoc.id,
                          nickname: props.commentNickname,
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
                        commentId: props.data.commentId,
                        docId: props.docId,
                        timeStamp: Timestamp.now(),
                      })
                      .then(() => {
                        setReplyText("");
                      });
                    postDoc
                      .collection("comment")
                      .doc(props.data.commentId)
                      .update({
                        reply: props.data.reply + 1,
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
  );
}
