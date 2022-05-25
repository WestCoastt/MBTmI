import React, { Component, useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Card, Button } from "react-bootstrap";
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
    // toggle to add extra line breaks when pasting HTML:
    matchVisual: false,
  },
};
/*
 * Quill editor formats
 * See https://quilljs.com/docs/formats/
 */
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

// const [value, setValue] = useState("");

export function Editor() {
  const [value, setValue] = useState("");
  return (
    <div>
      {/* <Button variant="outline-dark" size="sm">
        Submit
      </Button> */}
      <div className="post">
        {/* <Button
        variant="outline-dark"
        size="sm"
        onClick={() => {
          Submit();
        }}
      >
        Post
      </Button> */}
        <ReactQuill
          style={{ height: "350px", width: "640px", margin: "15px 0" }}
          theme="snow"
          modules={modules}
          formats={formats}
          value={value}
          onChange={setValue}
        />

        {/* <div>
        <Card style={{ height: "200px", width: "626px" }}>
          <Card.Header as="h5">Title</Card.Header>
          <Card.Body>
            <Card.Text>{parse(value)}</Card.Text>
          </Card.Body>
        </Card>
      </div> */}
      </div>
    </div>
  );
}

function Submit() {
  return (
    <div style={{ height: "200px", width: "626px", background: "blue" }}>
      <Card style={{ height: "200px", width: "626px" }}>
        <Card.Header as="h5">Title</Card.Header>
        <Card.Body>
          <Card.Text></Card.Text>
        </Card.Body>
      </Card>
    </div>
  );
}

Submit();
// export function Value() {
//   const [value, setValue] = useState("");
//   return <ReactQuill value={value} onChange={setValue} />;
// }

// const { value, onChange } = this.props;
// return (
//   <div className="post" style={{ height: "650px", width: "max-content" }}>
//     <QuillNoSSRWrapper modules={modules} placeholder='compose here' value={value} onChange={setValue} formats={formats} theme="snow"  />
//     <ReactQuill
//       style={{ height: "600px" }}
//       theme="snow"
//       modules={this.modules}
//       formats={this.formats}
//       value={value || ""}
//       onChange={(content, delta, source, editor) =>
//         onChange(editor.getHTML())
//       }
//     />
//   </div>
// );
