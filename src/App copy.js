/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Navbar, Container } from "react-bootstrap";
import { Route } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./App.css";
import Post from "./Post";
import Edit from "./Edit";
import Search from "./Search";
import parse from "html-react-parser";
import { db } from "./index.js";
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import { arrayUnion, arrayRemove } from "firebase/firestore";
import GoogleButton from "react-google-button";
import UserInfo from "./UserInfo";
import { FiSearch, FiHeart } from "react-icons/fi";
import { FaRegUser, FaRegComment } from "react-icons/fa";

function App() {
  let history = useHistory();
  let [post, setPost] = useState([]);
  let [signUp, setSignUP] = useState(false);
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  let getClose = (send) => {
    setSignUP(send);
  };
  let [login, setLogin] = useState("로그인");
  let [signUpBtn, setSignUpBtn] = useState(true);
  let [create, setCreate] = useState(false);

  useEffect(() => {
    db.collection("post")
      .orderBy("timeStamp", "desc")
      .onSnapshot((snapshot) => {
        const postArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setPost(postArr);
      });
  }, []);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setLogin("로그아웃");
      setSignUP(false);
      setSignUpBtn(false);
      setCreate(true);
    } else {
      setLogin("로그인");
      setSignUpBtn(true);
      setCreate(false);
    }
  });

  const LogOut = () => {
    signOut(auth)
      .then(() => {
        console.log("로그아웃됨");
        history.push("/");
        location.reload();
      })
      .catch(() => {
        console.log("로그아웃 실패");
      });
  };

  const LogIn = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        // The signed-in user info.
        const user = result.user;
        // ...
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error);
        // ...
      });
  };

  return (
    <div className="main">
      {signUp == true && <SignUp getClose={getClose}></SignUp>}

      <Navbar
        style={{ minWidth: "380px" }}
        className="py-0"
        fixed="top"
        bg="dark"
        expand="lg"
      >
        <Container fluid>
          <Navbar.Brand className="text-light" href="/">
            MBT(m)I
          </Navbar.Brand>
          <div style={{ minWidth: "130px", display: "flex" }}>
            <Button
              className="rounded-circle mx-1 pb-2"
              variant="light"
              size="sm"
              onClick={() => {
                history.push("/search");
              }}
            >
              <FiSearch size="22"></FiSearch>
            </Button>
            <Button
              className="rounded-circle mx-1 pb-2"
              variant="light"
              size="sm"
              onClick={() => {
                history.push("/user");
              }}
            >
              <FaRegUser size="22"></FaRegUser>
            </Button>
            <Button
              className="rounded-pill mx-1"
              variant="light"
              size="sm"
              onClick={() => {
                login == "로그인" ? LogIn() : LogOut();
              }}
            >
              {login}
            </Button>
            {signUpBtn == true && (
              <Button
                className="rounded-pill mx-1"
                variant="outline-light"
                size="sm"
                onClick={() => {
                  setSignUP(true);
                }}
              >
                가입하기
              </Button>
            )}
          </div>
        </Container>
      </Navbar>
      <div className="board">
        <Route exact path="/">
          {create == true && (
            <Button
              variant="dark"
              onClick={() => {
                history.push("/post");
              }}
            >
              Create
            </Button>
          )}

          {post.map((a, i) => (
            <CreateList
              key={i}
              // post={post}
              title={a.data.title}
              content={a.data.content}
              uid={a.data.uid}
              docId={a.data.docId}
            ></CreateList>
          ))}
        </Route>
        <Route path="/post">
          <Post></Post>
        </Route>
        <Route path="/edit">
          <Edit></Edit>
        </Route>

        <Route path="/search">
          <Search></Search>
        </Route>
        <Route path="/user">
          <UserInfo></UserInfo>
        </Route>
      </div>
    </div>
  );
}

const CreateList = (props) => {
  let history = useHistory();
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const [user, setUser] = useState(null);
  const [like, setLike] = useState(false);
  const [cnt, setCnt] = useState();

  db.collection("post")
    .doc(props.docId)
    .get()
    .then((doc) => {
      setCnt(doc.data().likes);
    });

  onAuthStateChanged(auth, (user) => {
    if (user) {
      setUser(auth.currentUser);
    } else {
      setUser(null);
    }
  });

  if (user != null) {
    db.collection("post")
      .where("likedUser", "array-contains", user.uid)
      .get()
      .then((result) => {
        result.forEach((a) => {
          if (a.data().docId == props.docId) {
            setLike(true);
          }
        });
      });
  }

  return (
    <div>
      <Card
        style={{
          width: "100%",
          minWidth: "360px",
          maxWidth: "768px",
          margin: "15px 0px",
        }}
      >
        <Card.Header className="d-flex justify-content-between" as="h5">
          {props.title}

          {user != null ? (
            user.uid == props.uid ? (
              <div style={{ minWidth: "150px" }}>
                <Button
                  className="rounded-pill mx-1"
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    history.push(`/edit?docId=${props.docId}`);
                  }}
                >
                  Edit
                </Button>
                <Button
                  className="rounded-pill mx-1"
                  variant="dark"
                  size="sm"
                  onClick={() => {
                    if (window.confirm("삭제하시겠습니까?")) {
                      db.collection("post")
                        .doc(props.docId)
                        .delete()
                        .then(() => {
                          location.reload();
                        });
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            ) : null
          ) : null}
        </Card.Header>
        <Card.Body>
          <Card.Text>{parse(props.content)}</Card.Text>
        </Card.Body>
        <Card.Footer className="text-muted d-flex px-2">
          <div style={{ width: "90px", display: "flex" }}>
            <Button
              className="shadow-none rounded-circle mx-0 px-2 pb-2"
              variant="light"
              size="sm"
              onClick={() => {
                {
                  user != null
                    ? like == false
                      ? db
                          .collection("post")
                          .doc(props.docId)
                          .update({
                            likes: cnt + 1,
                            likedUser: arrayUnion(user.uid),
                          })
                      : db
                          .collection("post")
                          .doc(props.docId)
                          .update({
                            likes: cnt - 1,
                            likedUser: arrayRemove(user.uid),
                          }) && setLike(false)
                    : signInWithPopup(auth, provider);
                }
              }}
            >
              {like == false ? (
                <FiHeart size="21" color="#FF6C85"></FiHeart>
              ) : (
                <FiHeart size="21" color="#FF6C85" fill="#FF6C85"></FiHeart>
              )}
            </Button>
            <span
              style={{ lineHeight: "42px", color: "#FF6C85", fontSize: "19px" }}
            >
              {cnt}
            </span>
          </div>
          <div style={{ width: "90px", display: "flex" }}>
            <Button
              className="shadow-none rounded-circle mx-0 px-2 pb-2"
              variant="light"
              size="sm"
              onClick={() => {}}
            >
              <FaRegComment size="22" color="#777777"></FaRegComment>
            </Button>
            <span
              style={{ lineHeight: "42px", color: "#777777", fontSize: "19px" }}
            >
              123
            </span>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

const SignUp = (props) => {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const sendClose = () => {
    props.getClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        maxWidth: "768px",
        maxHeight: "1000px",
        zIndex: "9",
        backgroundColor: "rgba(0,0,0, .4)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "384px",
          height: "500px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "8px",
        }}
      >
        <Button
          style={{ position: "absolute", right: "10px", top: "10px" }}
          variant="outline-dark"
          size="sm"
          onClick={() => {
            sendClose(false);
          }}
        >
          X
        </Button>
        <GoogleButton
          onClick={() => {
            signInWithPopup(auth, provider)
              .then((result) => {
                // This gives you a Google Access Token. You can use it to access the Google API.
                const credential = GoogleAuthProvider.credentialFromResult(
                  result
                );
                const token = credential.accessToken;
                // The signed-in user info.
                const user = result.user;
                // ...
              })
              .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                // The email of the user's account used.
                const email = error.email;
                // The AuthCredential type that was used.
                const credential = GoogleAuthProvider.credentialFromError(
                  error
                );
                // ...
              });
          }}
        >
          GOOGLE로 계속하기
        </GoogleButton>
      </div>
    </div>
  );
};

export default App;
