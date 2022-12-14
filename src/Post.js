import { Timestamp } from "firebase/firestore";
import React, { useState, useRef, useEffect } from "react";
import { Button } from "react-bootstrap";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { db, storage } from "./index.js";
import { getAuth } from "firebase/auth";
import { Editor } from "@tinymce/tinymce-react";
import ReactLoading from "react-loading";

export default function Post() {
  const uid = window.localStorage.getItem("uid");
  const nickname = window.localStorage.getItem("nickname");
  const mbti = window.localStorage.getItem("MBTI");
  const auth = getAuth();
  const user = auth.currentUser;
  const history = useHistory();
  const tinymcekey = process.env.REACT_APP_TINYMCE_KEY;

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const editorRef = useRef(null);
  const [noInfo, setNoInfo] = useState();
  const [charLimit, setCharLimit] = useState();
  const [titleLimit, setTitleLimit] = useState();

  const [isLoading, setIsLoading] = useState(false);

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
          {user && (
            <Button
              className="rounded-pill"
              variant="outline-dark"
              size="sm"
              onClick={() => {
                const newDoc = db.collection("post").doc();

                if (noInfo) {
                  if (window.confirm("????????? ?????? ??? ????????? ???????????????.")) {
                    history.push("/user?uid=" + user.uid);
                  }
                } else {
                  title.length === 0
                    ? alert("????????? ???????????????.")
                    : text.length === 0
                    ? alert("????????? ???????????????.")
                    : titleLimit
                    ? alert("????????? ???????????? ?????? 100?????? ???????????????.")
                    : charLimit
                    ? alert("????????? ???????????? ?????? 20,000?????? ???????????????.")
                    : newDoc
                        .set({
                          title: title,
                          content: text,
                          uid: uid,
                          nickname: nickname,
                          mbti: mbti,
                          docId: newDoc.id,
                          likedUser: [],
                          likes: 0,
                          comments: 0,
                          totalScore: 0,
                          timeStamp: Timestamp.now(),
                        })
                        .then(() => {
                          history.push("/");
                        }) &&
                      db
                        .collection("user-info")
                        .doc(uid)
                        .collection("posts")
                        .doc(newDoc.id)
                        .set({
                          title: title,
                          docId: newDoc.id,
                          timeStamp: Timestamp.now(),
                        });
                }
              }}
            >
              ??????
            </Button>
          )}
        </div>
        <input
          placeholder="????????? ???????????????."
          style={{ width: "100%", maxWidth: "768px", margin: "8px 0 0 0" }}
          onChange={(e) => setTitle(e.target.value)}
        ></input>
        <Editor
          apiKey={tinymcekey}
          onInit={(evt, editor) => (editorRef.current = editor)}
          outputFormat="text"
          // onEditorChange={(newText) => setText(newText)}
          onEditorChange={handleUpdate}
          init={{
            width: "100%",
            min_height: 700,
            max_chars: 10,
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
              "iframe[src|frameborder|allowfullscreen|style|scrolling|class|width|height|name|align], a[href|target=_blank]",
            plugins: [
              "image",
              "link",
              "media",
              "emoticons",
              "lists",
              "autolink",
              "autoresize",
            ],
            toolbar:
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
                // var file = this.files[0];
                if (this.files[0].size > 1073741824) {
                  alert("1GB ????????? ????????? ????????? ??? ????????????.");
                  this.value = "";
                } else {
                  setIsLoading(true);
                  var file = this.files[0];

                  var array = new Uint32Array(5);
                  window.crypto.getRandomValues(array);
                  var name = "";

                  array.map((a, i) => {
                    name += a.toString(36);
                  });

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

                // var reader = new FileReader();
                // reader.onload = function() {
                //   var id = "blobid" + new Date().getTime();
                //   var blobCache = editorRef.current.editorUpload.blobCache;
                //   var base64 = reader.result.split(",")[1];
                //   var blobInfo = blobCache.create(id, file, base64);
                //   blobCache.add(blobInfo);

                //   /* call the callback and populate the Title field with the file name */
                //   cb(blobInfo.blobUri(), { title: file.name });
                // };

                // reader.readAsDataURL(file);

                // setFile(file);
              };
              input.click();
            },
            content_style:
              "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }" +
              "img {max-width: 100%; height: auto;}",
          }}
        ></Editor>
      </div>
      {isLoading && (
        <div className="upload">
          <ReactLoading type="spin" color="#0d6efd" width="36px"></ReactLoading>
        </div>
      )}
    </>
  );
}
