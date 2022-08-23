import React, { useState, useRef } from "react";
import { useHistory, Link } from "react-router-dom";
import { db } from "./index.js";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import BadgeColor from "./BadgeColor.js";
import EditorInit from "./EditorInit.js";
import ReplyCard from "./ReplyCard.js";
import LoginModal from "./LoginModal";
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
import { FaRegComment, FaUserCircle } from "react-icons/fa";

export default function CommentCard(props) {
  const postDoc = props.postDoc;
  const uidDoc = props.uidDoc;
  const tinymcekey = props.editorKey;
  const history = useHistory();
  const editorRef = useRef(null);
  const [modalShow, setModalShow] = React.useState(false);
  const [edit, setEdit] = useState();
  const [editText, setEditText] = useState("");
  const [reply, setReply] = useState();
  const [replies, setReplies] = useState([]);

  const checkLike = (arr, color) => {
    if (arr && arr.includes(props.uid)) {
      return "#FF6C85";
    } else {
      return color;
    }
  };

  return (
    <>
      <LoginModal show={modalShow} onHide={() => setModalShow(false)} />
      <Container className="mt-1 comment">
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

            {props.data.mbti && (
              <p
                className="badge small"
                style={{ background: BadgeColor(props.data.mbti) }}
              >
                {props.data.mbti}
              </p>
            )}
          </div>
          {props.index === edit ? (
            <Container className="d-flex flex-column align-items-end my-1 px-1">
              <Editor
                apiKey={tinymcekey}
                value={editText}
                onInit={(evt, editor) => (editorRef.current = editor)}
                outputFormat="text"
                onEditorChange={(newText) => setEditText(newText)}
                init={EditorInit(true, "댓글을 입력하세요.")}
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
                    (editText.length === 0 || editText.length > 1000) && true
                  }
                  type="submit"
                  id="comment"
                  className="rounded-pill me-1"
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    db.collection("post")
                      .doc(props.docId)
                      .collection("comment")
                      .doc(props.data.commentId)
                      .update({
                        comment: editText,
                      });

                    uidDoc
                      .collection("comments")
                      .doc(props.data.commentId)
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
              {props.data.comment ? (
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
                          {props.data.nickname}
                        </Link>

                        <OverlayTrigger
                          placement={window.innerWidth < 576 ? "top" : "right"}
                          overlay={
                            <Tooltip id="button-tooltip-2">
                              {moment(
                                props.data.timeStamp.seconds * 1000
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
                            {times(props.data.timeStamp.seconds)}
                          </span>
                        </OverlayTrigger>
                      </div>
                    </div>

                    {props.user && props.uid === props.data.uid && (
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
                              setEditText(props.data.comment);
                              setEdit(props.index);
                            }}
                          >
                            수정하기
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => {
                              const doc = postDoc
                                .collection("comment")
                                .doc(props.data.commentId);
                              if (window.confirm("댓글을 삭제하시겠습니까?")) {
                                if (props.data.reply === 0) {
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
                                  .doc(props.data.commentId)
                                  .delete();
                                postDoc.update({
                                  comments: props.comments - 1,
                                  totalScore: props.totalScore - 0.6,
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
                    {parse(props.data.comment)}
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
                    props.user
                      ? props.noInfo === false
                        ? props.data.likedUser &&
                          props.data.likedUser.includes(props.uid) === false
                          ? postDoc
                              .collection("comment")
                              .doc(props.data.commentId)
                              .update({
                                likes: props.data.likes + 1,
                                likedUser: arrayUnion(props.uid),
                              })
                          : postDoc
                              .collection("comment")
                              .doc(props.data.commentId)
                              .update({
                                likes: props.data.likes - 1,
                                likedUser: arrayRemove(props.uid),
                              })
                        : history.push("/user?uid=" + props.user.uid)
                      : setModalShow(true);
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
                      color={checkLike(props.data.likedUser, "#777777")}
                      fill={checkLike(props.data.likedUser, "none")}
                    ></FiHeart>

                    <span
                      style={{
                        color: checkLike(props.data.likedUser, "#777777"),
                      }}
                    >
                      {props.data.likes}
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
                      reply !== null
                        ? reply === props.index
                          ? setReply()
                          : setReply(props.index)
                        : setReply(props.index);

                      db.collection("post")
                        .doc(props.docId)
                        .collection("comment")
                        .doc(props.data.commentId)
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
                    <FaRegComment size="14" color="#777777"></FaRegComment>
                    <span style={{ color: "#777777" }}>{props.data.reply}</span>
                  </div>
                </div>
              </Card.Footer>
            </Container>
          )}
        </div>
      </Container>
      {props.index === reply && (
        <ReplyCard
          replies={replies}
          data={props.data}
          uid={props.uid}
          docId={props.docId}
          postDoc={postDoc}
          uidDoc={uidDoc}
          editorKey={tinymcekey}
          user={props.user}
          noInfo={props.noInfo}
          commentNickname={props.commentNickname}
        />
      )}
    </>
  );
}
