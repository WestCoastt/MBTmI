import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { db, storage } from "./index.js";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Editor } from "@tinymce/tinymce-react";

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

  return (
    <>
      <div className="editor">
        {editBtn && (
          <Button
            className="rounded-pill"
            variant="outline-dark"
            size="sm"
            onClick={() => {
              if (window.confirm("저장하시겠습니까?")) {
                db.collection("post")
                  .doc(urlSearch.get("docId"))
                  .update({
                    title: title,
                    content: text,
                  })
                  .then(() => {
                    history.push(`/comments?docId=${urlSearch.get("docId")}`);
                  });

                db.collection("user-info")
                  .doc(uid)
                  .collection("posts")
                  .doc(urlSearch.get("docId"))
                  .update({
                    title: title,
                  });
              }
            }}
          >
            Edit
          </Button>
        )}

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
          onEditorChange={(newText) => setText(newText)}
          init={{
            width: "100%",
            height: "100%",
            language: "ko_KR",
            menubar: false,
            branding: false,
            statusbar: false,
            automatic_uploads: true,
            file_picker_types: "file image media",
            extended_valid_elements:
              "iframe[src|frameborder|allowfullscreen|style|scrolling|class|width|height|name|align]",
            plugins: [
              "insertdatetime media table paste code help wordcount",
              "image",
              "link",
              "media",
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
    </>
  );
}
