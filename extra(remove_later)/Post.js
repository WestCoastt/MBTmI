import { Timestamp } from "firebase/firestore";
import React, { useState } from "react";
import { Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { db } from "./index.js";
import { getAuth } from "firebase/auth";

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ size: [] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [
      { list: "ordered" },
      { list: "bullet" },
      { indent: "-1" },
      { indent: "+1" },
    ],
    ["link", "image", "video"],
    ["clean"],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  "header",
  "font",
  "size",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "video",
];

function Post() {
  const [value, setValue] = useState("");
  const [title, setTitle] = useState("");
  let history = useHistory();
  let text = value.replace(
    /<(\/)?([a-zA-Z]*)(\s[a-zA-Z]*=[^>]*)?(\s)*(\/)?>/gi,
    ""
  );
  const auth = getAuth();
  const user = auth.currentUser;

  return (
    <div className="editor">
      <Button
        className="rounded-pill"
        variant="outline-dark"
        size="sm"
        onClick={() => {
          const newDoc = db.collection("post").doc();
          newDoc.set({
            title: title,
            content: text,
            uid: user.uid,
            docId: newDoc.id,
            timeStamp: Timestamp.now(),
          });

          history.push("/");
        }}
      >
        Post
      </Button>
      <input
        placeholder="Title"
        style={{ width: "100%", maxWidth: "768px", margin: "10px 0 0 0" }}
        onChange={(e) => setTitle(e.target.value)}
      ></input>
      <div className="post">
        <ReactQuill
          style={{
            height: "350px",
            width: "100%",
            maxWidth: "768px",
            margin: "10px 0",
          }}
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={setValue}
        />
      </div>
    </div>
  );
}
export default Post;
