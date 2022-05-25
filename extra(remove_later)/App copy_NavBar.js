import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Nav,
  Navbar,
  NavDropdown,
  Form,
  FormControl,
  Container,
} from "react-bootstrap";
import { Link, Route, Switch } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import logo from "./logo.svg";
import "./App.css";
import Post from "./Post";
import parse from "html-react-parser";
import { render } from "react-dom";

function App() {
  let [list, addList] = useState([]);
  let [counter, setCounter] = useState(0);
  let listArr = [...list];
  let history = useHistory();
  let Item = localStorage.getItem("post");
  let post = JSON.parse(Item);

  useEffect(() => {
    setCounter(counter + 1);
    listArr.push(counter);
    addList(listArr);
  }, []);

  return (
    <div className="main">
      <Navbar className="py-0" fixed="top" bg="dark" expand="lg">
        <Container fluid>
          <Navbar.Brand className="text-light" href="#">
            MBT(m)I
          </Navbar.Brand>
          <div style={{ width: "25%", display: "flex" }}>
            <Form style={{ width: "100%", margin: "auto" }}>
              <FormControl
                id="search"
                type="search"
                placeholder="Search"
                className="me-2 py-1"
                aria-label="Search"
                size="sm"
              ></FormControl>
            </Form>
          </div>
          <div style={{ minWidth: "190px", display: "flex" }}>
            <Button className="rounded-pill mx-1" variant="light" size="sm">
              로그인
            </Button>
            <Button
              className="rounded-pill mx-1"
              variant="outline-light"
              size="sm"
            >
              가입하기
            </Button>
          </div>
        </Container>
        {/* <Container fluid>
          <div style={{ width: "50%", maxWidth: "600px", display: "flex" }}>
            <Navbar.Brand className="text-light" href="#">
              MBT(m)I
            </Navbar.Brand>
            <Form style={{ width: "100%", margin: "auto" }}>
              <FormControl
                id="search"
                type="search"
                placeholder="Search"
                className="me-2 py-1"
                aria-label="Search"
              ></FormControl>
            </Form>
          </div>
          <div style={{ display: "flex" }}>
            <Button className="rounded-pill mx-1" variant="light" size="sm">
              로그인
            </Button>
            <Button
              className="rounded-pill mx-1"
              variant="outline-light"
              size="sm"
            >
              가입하기
            </Button>
          </div>
        </Container> */}
      </Navbar>
      <div className="board">
        <Route exact path="/">
          <Button
            variant="dark"
            onClick={() => {
              history.push("/post");
            }}
          >
            Create
          </Button>

          {localStorage.length > 0 && (
            <CreateList
              list={list}
              title={post.title}
              content={parse(post.content)}
            ></CreateList>
          )}
        </Route>
        <Route path="/post">
          <Post></Post>
        </Route>
      </div>
    </div>
  );
}

const CreateList = (props) => {
  return (
    <div>
      {props.list.map((a, i) => (
        <div key={i}>
          <Card
            style={{
              width: "100%",
              minWidth: "375px",
              maxWidth: "768px",
              margin: "15px 0px",
            }}
          >
            <Card.Header className="d-flex justify-content-between" as="h5">
              {props.title}
              <Button
                className="rounded-pill"
                variant="dark"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("post");
                  window.location.reload();
                }}
              >
                Delete
              </Button>
            </Card.Header>
            <Card.Body>
              <Card.Text>{props.content}</Card.Text>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default App;
