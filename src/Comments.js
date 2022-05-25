/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Dropdown } from "react-bootstrap";
import { db } from "./index.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import parse from "html-react-parser";
import { Editor } from "@tinymce/tinymce-react";
import { FiHeart, FiMoreHorizontal } from "react-icons/fi";
import { FaRegComment, FaUserCircle } from "react-icons/fa";
import { useHistory } from "react-router-dom";

export default function Comments(props) {
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
  const [noInfo, setNoInfo] = useState();

  useEffect(() => {
    db.collection("post")
      .doc(urlSearch.get("docId"))
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
      .doc(urlSearch.get("docId"))
      .get()
      .then((result) => {
        setTitle(result.data().title);
        setContent(result.data().content);
        setUserId(result.data().uid);
      });
  }, []);

  if (user != null) {
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
        <Card.Header className="d-flex justify-content-between" as="h5">
          {title}

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
                    history.push(`/edit?docId=${urlSearch.get("docId")}`);
                  }}
                >
                  Edit
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    if (window.confirm("삭제하시겠습니까?")) {
                      db.collection("post")
                        .doc(urlSearch.get("docId"))
                        .delete();
                      db.collection("user-info")
                        .doc(uid)
                        .collection("posts")
                        .doc(urlSearch.get("docId"))
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
        </Card.Header>
        <Card.Body>
          <Card.Text>{parse(content)}</Card.Text>
        </Card.Body>
        <Card.Footer></Card.Footer>
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
              height: 180,
              width: "100%",
              language: "ko_KR",
              menubar: false,
              branding: false,
              statusbar: false,
              plugins: ["link", "emoticons", "autoresize"],
              toolbar: "| emoticons link |",
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
                type="submit"
                className="rounded-pill"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  const newDoc = db
                    .collection("post")
                    .doc(urlSearch.get("docId"))
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
                        docId: urlSearch.get("docId"),
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
                <p style={{ margin: "0 10px", lineHeight: "32px" }}>
                  {a.data.nickname}
                </p>
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
                            .doc(urlSearch.get("docId"))
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
            <FiHeart size="17" color="#FF6C85"></FiHeart>
            <FaRegComment size="17" color="#777777"></FaRegComment>
          </Card.Body>
        </Card>
      ))}
    </>
  );
}

// <Card.Footer key={i} style={{ fontSize: "16px" }}>
//       <div
//         style={{
//           width: "100%",
//           margin: "10px 0",
//           lineHeight: "34px",
//           display: "flex",
//           justifyContent: "space-between",
//           background: "none",
//         }}
//       >
//         {a.data.nickname}

//         {user != null ? (
//           user.uid == a.data.uid ? (
//             <Dropdown>
//               <Dropdown.Toggle
//                 id="dropdown-basic"
//                 size="sm"
//                 variant="light"
//                 style={{ lineHeight: "20px" }}
//                 className="shadow-none rounded-pill px-1 py-1"
//               >
//                 <FiMoreHorizontal size="23"></FiMoreHorizontal>
//               </Dropdown.Toggle>

//               <Dropdown.Menu
//                 align="end"
//                 variant="dark"
//                 style={{ minWidth: "120px", fontSize: "18px" }}
//               >
//                 <Dropdown.Item onClick={() => {}}>Edit</Dropdown.Item>
//                 <Dropdown.Item
//                   onClick={() => {
//                     db.collection("post")
//                       .doc(urlSearch.get("docId"))
//                       .collection("comment")
//                       .doc(a.data.commentId)
//                       .delete();
//                   }}
//                 >
//                   Delete
//                 </Dropdown.Item>
//               </Dropdown.Menu>
//             </Dropdown>
//           ) : null
//         ) : null}
//       </div>
//       {parse(a.data.comment)}
//       <FiHeart size="17" color="#FF6C85"></FiHeart>
//       <FaRegComment size="17" color="#777777"></FaRegComment>
//     </Card.Footer>

// 댓글 카드 footer 변경전
{
  /* <Card.Footer className="d-flex flex-column align-items-end px-0">
          <Editor
            apiKey={tinymcekey}
            onInit={(evt, editor) => (editorRef.current = editor)}
            outputFormat="text"
            onEditorChange={(newText) => setText(newText)}
            init={{
              height: 180,
              width: "100%",
              language: "ko_KR",
              menubar: false,
              branding: false,
              statusbar: false,
              file_picker_types: "file image media",
              plugins: ["image", "link", "emoticons", "autoresize"],
              toolbar: "| emoticons image link |",
              autoresize_on_init: false,
              images_upload_url: "postAcceptor.php",
              images_upload_handler: function(blobInfo, success, failure) {
              },
              content_style:
                "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
            }}
          ></Editor>
          <div
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "0 20px",
              display: "flex",
              justifyContent: "space-between",
              background: "none",
            }}
          >
            <span style={{ lineHeight: "42px", fontSize: "16px" }}>
              댓글 {comment.length}
            </span>

            {user != null ? (
              <Button
                className="rounded-pill"
                variant="outline-dark"
                size="sm"
                onClick={() => {
                  const newDoc = db
                    .collection("post")
                    .doc(urlSearch.get("docId"))
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
                        docId: urlSearch.get("docId"),
                        timeStamp: Timestamp.now(),
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
        </Card.Footer> */
}
