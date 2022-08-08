import React, { useState, useRef, useEffect } from "react";
import { Button, Col, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { db, storage } from "./index.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Editor } from "@tinymce/tinymce-react";
import ReactLoading from "react-loading";

export default function Edit() {
  const uid = window.localStorage.getItem("uid");
  const auth = getAuth();
  const history = useHistory();
  const tinymcekey = process.env.REACT_APP_TINYMCE_KEY;

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [userId, setUserId] = useState("");
  const [editBtn, setEditBtn] = useState(false);
  const editorRef = useRef(null);

  const [charLimit, setCharLimit] = useState();
  const [titleLimit, setTitleLimit] = useState();
  const [isLoading, setIsLoading] = useState(false);

  const urlSearch = new URLSearchParams(window.location.search);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      if (user.uid == userId) {
        setEditBtn(true);
      } else {
        setEditBtn(false);
      }
    } else {
      setEditBtn(false);
      history.push("/");
    }
  });

  useEffect(() => {
    db.collection("post")
      .doc(urlSearch.get("docId"))
      .get()
      .then((result) => {
        setTitle(result.data().title);
        setText(result.data().content);
        setUserId(result.data().uid);
      });
  }, []);

  const handleUpdate = (value, editor) => {
    const length = editor.getContent({ format: "text" }).length;

    if (length > 20000) {
      setCharLimit(true);
    } else {
      setCharLimit(false);
      setText(value);
    }
  };

  useEffect(() => {
    if (title.length > 100) {
      setTitleLimit(true);
    } else {
      setTitleLimit(false);
    }
  }, [title]);

  return (
    <>
      <div className="editor">
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          {editBtn && (
            <Button
              className="rounded-pill"
              variant="outline-dark"
              size="sm"
              onClick={() => {
                if (window.confirm("저장하시겠습니까?")) {
                  title.length == 0
                    ? alert("제목을 입력하세요.")
                    : text.length == 0
                    ? alert("내용을 입력하세요.")
                    : titleLimit
                    ? alert("제목의 글자수는 최대 100자로 제한됩니다.")
                    : charLimit
                    ? alert("본문의 글자수는 최대 20,000자로 제한됩니다.")
                    : db
                        .collection("post")
                        .doc(urlSearch.get("docId"))
                        .update({
                          title: title,
                          content: text,
                        })
                        .then(() => {
                          history.push(
                            `/comments?docId=${urlSearch.get("docId")}`
                          );
                        }) &&
                      db
                        .collection("user-info")
                        .doc(uid)
                        .collection("posts")
                        .doc(urlSearch.get("docId"))
                        .update({
                          title: title,
                        });
                }
              }}
            >
              완료
            </Button>
          )}
        </div>
        <input
          placeholder="Title"
          value={title}
          style={{ width: "100%", maxWidth: "768px", margin: "10px 0 0 0" }}
          onChange={(e) => setTitle(e.target.value)}
        ></input>
        <Editor
          value={text}
          apiKey={tinymcekey}
          onInit={(evt, editor) => (editorRef.current = editor)}
          outputFormat="text"
          onEditorChange={handleUpdate}
          // onEditorChange={(newText) => setText(newText)}
          init={{
            width: "100%",
            min_height: 700,
            mode: "exact",
            language: "ko_KR",
            menubar: false,
            branding: false,
            statusbar: false,
            elementpath: false,
            contextmenu: false,
            default_link_target: "_blank",
            file_picker_types: "file image media",
            extended_valid_elements:
              "iframe[src|frameborder|allowfullscreen|style|scrolling|class|width|height|name|align]",
            extended_valid_elements: "a[href|target=_blank]",
            plugins: [
              "insertdatetime media table paste code help wordcount",
              "image",
              "link",
              "media",
              "autolink",
              "emoticons",
              "lists",
            ],
            toolbar:
              // "undo redo | formatselect | " +
              // "bold italic strikethrough underline forecolor backcolor | emoticons | numlist bullist |" +
              // "| image media link |",
              "bold italic strikethrough underline forecolor backcolor emoticons image media link ",
            lists_indent_on_tab: false,
            file_picker_callback: function(cb, value, meta) {
              var input = document.createElement("input");
              input.setAttribute("type", "file");
              input.setAttribute(
                "accept",
                ".jpg, .jpeg, .svg, .png, .gif, .tiff, .webp, .mp4, .m4v, .mov, .avi, .wmv"
              );
              input.onchange = function() {
                if (this.files[0].size > 1073741824) {
                  alert("1GB 이하의 파일만 첨부할 수 있습니다.");
                  this.value = "";
                } else {
                  var file = this.files[0];

                  var array = new Uint32Array(5);
                  window.crypto.getRandomValues(array);
                  var name = "";
                  {
                    array.map((a, i) => {
                      name += a.toString(36);
                    });
                  }

                  var upload = storage
                    .ref()
                    .child("image/" + name)
                    .put(file);

                  upload.then(() => {
                    upload.on(
                      "state_changed",
                      null,
                      (error) => {
                        console.error(error);
                      },
                      () => {
                        upload.snapshot.ref.getDownloadURL().then((url) => {
                          console.log(url);
                          cb(url);
                          setIsLoading(false);
                        });
                      }
                    );
                  });
                }
              };
              input.click();
            },
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
          }}
        />
      </div>
      {isLoading && (
        <div className="upload">
          <ReactLoading type="spin" color="#0d6efd" width="36px"></ReactLoading>
        </div>
      )}
    </>
  );
}
