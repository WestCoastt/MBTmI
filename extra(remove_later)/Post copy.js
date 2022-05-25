import React, { useState } from "react";
import { Card, Button } from "react-bootstrap";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import parse from "html-react-parser";

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
  let [list, addList] = useState([]);
  let [counter, setCounter] = useState(0);
  let listArr = [...list];

  return (
    <div className="editor">
      <Button
        variant="outline-dark"
        size="sm"
        onClick={() => {
          setCounter(counter + 1);
          listArr.push(counter);
          addList(listArr);
          console.log(parse(value));
        }}
      >
        Post
      </Button>
      <input
        placeholder="Title"
        style={{ width: "640px" }}
        onChange={(event) => setTitle(event.target.value)}
      ></input>
      <div className="post">
        <ReactQuill
          style={{ height: "350px", width: "640px", margin: "10px 0" }}
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={setValue}
        />
      </div>
      {/* <textarea
          type="text"
          placeholder="게시글 내용을 작성해주세요."
          style={{ height: "350px", width: "640px", margin: "10px 0 0 0" }}
          onChange={(e) => setValue(e.target.value)}
        ></textarea> */}

      <CreateList title={title} list={list} value={parse(value)}></CreateList>
    </div>
  );
}

const CreateList = (props) => {
  return (
    <div>
      {props.list.map((a, i) => (
        <div key={i}>
          <Card style={{ width: "640px", margin: "15px 0px" }}>
            <Card.Header as="h5">{props.title}</Card.Header>
            <Card.Body>
              <Card.Text>{props.value}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default Post;
