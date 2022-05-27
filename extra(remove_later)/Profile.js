import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { Route, Link } from "react-router-dom";
import { Col, Row, Button, Form, Nav } from "react-bootstrap";
import PostsTab from "./PostsTab.js";
import CommentsTab from "./CommentsTab.js";
import MyProfile from "./MyProfile.js";
import { db } from "./index.js";

export default function Profile() {
  const uid = window.localStorage.getItem("uid");
  const history = useHistory();
  const [nickname, setNickname] = useState();
  const [birthday, setBirthday] = useState();

  const [male, setMale] = useState();
  const [female, setFemale] = useState();

  const [gender, setGender] = useState("");

  const [mbti, setMbti] = useState();

  const [tab, setTab] = useState({
    myProfile: false,
    Posts: false,
    Comments: false,
  });

  db.collection("user-info")
    .doc(uid)
    .get()
    .then((result) => {
      setMbti(result.data().MBTI);
      setNickname(result.data().nickname);
      setBirthday(result.data().birthday);
      setGender(result.data().gender);
    });

  useEffect(() => {
    if (gender == "남") {
      setMale(true);
    } else if (gender == "여") {
      setFemale(true);
    }
  }, [gender]);

  // useEffect(() => {
  //   if (window.location.href.indexOf("myprofile") > -1) {
  //     setTab({ ...tab, myProfile: true });
  //   } else if (window.location.href.indexOf("posts") > -1) {
  //     setTab({ ...tab, Posts: true });
  //   } else if (window.location.href.indexOf("comments") > -1) {
  //     setTab({ ...tab, Comments: true });
  //   }
  // }, [tab]);
  // // console.log(tab);

  return (
    <div className="user">
      {/* <Link to={`/profile/${nickname}/posts`}>posts</Link> */}
      {/* <Nav
        // defaultActiveKey="link-0"

        style={{
          margin: "6px 0 6px 10px",
        }}
      >
        <Nav.Item>
          <Nav.Link
            className={
              "px-1 mx-1 " +
              (window.location.href.indexOf("myprofile") > -1 && " active")
            }
            // className="px-1 mx-1"
            // eventKey={
            //   window.location.href.indexOf("myprofile") > -1 && "link-0"
            // }
            onClick={() => {
              history.push(`/profile/${nickname}/myprofile`);
              setTab({ ...tab, myProfile: true });
            }}
          >
            My Profile
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
          className="px-1 mx-1"
            // className={
            //   "px-1 mx-1" +
            //   (window.location.href.indexOf("posts") > -1 && " active")
            // }
            onClick={() => {
              history.push(`/profile/${nickname}/posts`);
              // setTab({ ...tab, Posts: true });
            }}
          >
            Posts
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            className={
              "px-1 mx-1" +
              (window.location.href.indexOf("comments") > -1 ? " active" : "")
            }
            onClick={() => {
              history.push(`/profile/${nickname}/comments`);
              setTab({ ...tab, Comments: true });
            }}
          >
            Comments
          </Nav.Link>
        </Nav.Item>
      </Nav> */}

      <Route path={`/profile/${nickname}/myprofile`}>
        <MyProfile nickname></MyProfile>
      </Route>

      <Route path={`/profile/${nickname}/posts`}>
        <PostsTab nickname></PostsTab>
      </Route>

      <Route path={`/profile/${nickname}/comments`}>
        <CommentsTab></CommentsTab>
      </Route>

      {/* {tab == 0 && (
        <Form className="mt-0" style={{ width: "85%", margin: "auto" }}>
          <fieldset disabled>
            <Form.Group
              as={Row}
              className="mt-4"
              controlId="formPlaintextEmail"
            >
              <Form.Group
                as={Row}
                className="mt-4"
                controlId="formPlaintextEmail"
              >
                <Form.Label column sm="3">
                  닉네임
                </Form.Label>
                <Col sm="6" className="ps-3">
                  <Form.Control type="text" placeholder={nickname} />
                </Col>
              </Form.Group>

              <Form.Group
                as={Row}
                className="mt-3"
                controlId="formPlaintextEmail"
              >
                <Form.Label column sm="3">
                  성별
                </Form.Label>
                <Col sm="6" className="ps-4">
                  <Form.Check
                    style={{ margin: "10px 40px 10px 0" }}
                    inline
                    label="남"
                    value="남"
                    name="group1"
                    type="radio"
                    defaultChecked={male}
                  />
                  <Form.Check
                    style={{ margin: "10px 40px 10px 0" }}
                    inline
                    label="여"
                    value="여"
                    name="group1"
                    type="radio"
                    defaultChecked={female}
                  />
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                className="mt-3"
                controlId="formPlaintextEmail"
              >
                <Form.Label column sm="3">
                  생년월일
                </Form.Label>

                <Col sm="6" className="ps-3">
                  <Form.Control type="text" placeholder={birthday} />
                </Col>
              </Form.Group>
              <Form.Group
                as={Row}
                className="mt-4"
                controlId="formPlaintextEmail"
              >
                <Form.Label column sm="3">
                  MBTI
                </Form.Label>

                <Col sm="6" className="ps-3">
                  <Form.Control type="text" placeholder={mbti} />
                </Col>
              </Form.Group>
            </Form.Group>
          </fieldset>
          <Button
            className="rounded-pill float-end mt-5 me-2"
            variant="outline-dark"
            type="submit"
            onClick={() => {
              history.push("/user?uid=" + uid);
            }}
          >
            수정
          </Button>
        </Form>
      )} */}

      {/* {tab == 1 && (
        <Route path={`/profile/${nickname}/posts`}>
          <PostsTab></PostsTab>
        </Route>
      )} */}
      {/* {tab == 2 && <CommentsTab></CommentsTab>} */}
    </div>
  );
}
