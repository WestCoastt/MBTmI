import Algoliasearch from "algoliasearch";
import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Form, FormControl, Button } from "react-bootstrap";
import { db } from "./index";
import CreateList from "./CreateList";
import { BsPencilSquare } from "react-icons/bs";

function Search(props) {
  const history = useHistory();
  const [search, setSearch] = useState("");
  const [result, setResult] = useState([]);

  const client = Algoliasearch(
    process.env.REACT_APP_ALGOLIA_APP_ID,
    process.env.REACT_APP_ALGOLIA_SEARCH_KEY
  );

  const index = client.initIndex("posts_content");

  const findData = async () => {
    try {
      const response = await index.search(search);

      const resultArr = response.hits.map((a) => a.objectID);
      // console.log(resultArr);
      db.collection("post")
        .where("docId", "in", resultArr)
        .onSnapshot((snapshot) => {
          const searchArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setResult(searchArr);
        });
    } catch (e) {
      console.log(e);
    }
  };

  const enterPress = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      history.push("/search?q=" + search);

      findData();
    }
  };

  return (
    // <Navbar className="py-0" fixed="top" bg="dark" expand="lg">
    //   <Form style={{ width: "100%" }}>
    //     <FormControl
    //       type="search"
    //       placeholder="Search"
    //       className="me-2 py-2"
    //       aria-label="Search"
    //       onChange={(e) => setSearch(e.target.value)}
    //       onKeyDown={enterPress}
    //     ></FormControl>
    //     {/* <button>검색</button> */}
    //   </Form>
    // </Navbar>
    <>
      <Form
        style={{
          width: "100%",
          maxWidth: "768px",
          // position: "fixed",
          // zIndex: "10",
          // left: "0",
          // right: "0",
          // top: "56px",
          // margin: "0 auto",
        }}
      >
        <FormControl
          style={{ fontSize: "16px" }}
          type="search"
          placeholder="Search"
          className="py-2"
          aria-label="Search"
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={enterPress}
        ></FormControl>
      </Form>

      {result.map((a, i) => (
        <CreateList
          key={a.data.docId}
          title={a.data.title}
          content={a.data.content}
          uid={a.data.uid}
          docId={a.data.docId}
        ></CreateList>
      ))}

      {props.create && (
        <Button
          variant="dark"
          size="sm"
          className="rounded-circle"
          style={{
            bottom: "15px",
            marginRight: "15px",
            width: "50px",
            height: "50px",
            position: "fixed",
            zIndex: "10",
            lineHeight: "18px",
          }}
          onClick={() => {
            history.push("/post");
          }}
        >
          <BsPencilSquare size="20"></BsPencilSquare>
        </Button>
      )}
    </>
  );
}

export default Search;
