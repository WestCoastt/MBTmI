/* eslint no-restricted-globals: ["off"] */
import React, { useState, useEffect } from "react";
import { Button, Navbar, Container, Dropdown } from "react-bootstrap";
import { Switch, Route, Link } from "react-router-dom";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import "./App.css";
import Post from "./Post";
import Edit from "./Edit";
import CreateList from "./CreateList";
import Comments from "./Comments";
import Search from "./Search";
import Profile from "./Profile";
import UserInfo from "./UserInfo";
import Register from "./Register";
import Best from "./Best";
import { db } from "./index.js";
import {
  getAuth,
  signOut,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
} from "firebase/auth";
import ReactLoading from "react-loading";
import { FiSearch, FiMoreHorizontal } from "react-icons/fi";
import { FaUserCircle } from "react-icons/fa";
import { BsPencilSquare } from "react-icons/bs";
import NotFound from "./NotFound";

function App() {
  const uid = window.localStorage.getItem("uid");
  const [nickname, setNickname] = useState("");
  const history = useHistory();
  const [post, setPost] = useState([]);
  const [best, setBest] = useState([]);
  const auth = getAuth();
  const user = auth.currentUser;
  const provider = new GoogleAuthProvider();

  const [create, setCreate] = useState(false);

  const [newPost, setNewPost] = useState();
  const [notification, setNotification] = useState(false);

  const [lastVisible, setLastVisible] = useState(null);

  const [target, setTarget] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // const oneDay = new Date().getTime() - 24 * 3600 * 1000;

  useEffect(() => {
    db.collection("post")
      .orderBy("timeStamp", "desc")
      .limit(20)
      .onSnapshot((snapshot) => {
        const postArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setPost(postArr);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      });
    db.collection("newPost")
      .orderBy("timeStamp", "desc")
      .limit(1)
      .onSnapshot((snapshot) => {
        setNewPost(snapshot);
      });
    db.collection("post")
      .where("totalScore", ">=", 1)
      .orderBy("totalScore", "desc")
      // .startAt(new Date(oneDay))
      .limit(5)
      .onSnapshot((snapshot) => {
        const bestArr = snapshot.docs.map((doc) => ({
          data: doc.data(),
        }));
        setBest(bestArr);
      });
  }, []);

  useEffect(() => {
    if (scrollY >= 1500) {
      setNotification(true);
    }
  }, [newPost]);

  const onIntersect = async ([entry], observer) => {
    if (entry.isIntersecting) {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await db
        .collection("post")
        .orderBy("timeStamp", "desc")
        .startAfter(lastVisible)
        .limit(10)
        .onSnapshot((snapshot) => {
          const addArr = snapshot.docs.map((doc) => ({
            data: doc.data(),
          }));
          setPost([...post, ...addArr]);
          setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        });
      setIsLoading(false);
      observer.unobserve(entry.target);
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(onIntersect, {
      threshold: 0.7,
      rootMargin: "10px 0px",
    });
    if (target && post.length % 10 === 0 && lastVisible) {
      observer.observe(target);
    }
    return () => observer && observer.disconnect();
  }, [target, lastVisible, post]);

  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.localStorage.setItem("uid", user.uid);
      setCreate(true);
      db.collection("user-info")
        .doc(user.uid)
        .get()
        .then((result) => {
          if (result.exists) {
            setNickname(result.data().nickname);
            window.localStorage.setItem("nickname", result.data().nickname);
            window.localStorage.setItem("MBTI", result.data().MBTI);
          } else {
            setNickname(null);
          }
        })
        .catch(() => {
          setNickname(null);
          // history.push("/");
        });
    } else {
      setCreate(false);
      localStorage.clear();
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
      .then((result) => {})
      .catch(() => {
        console.log("로그인 실패");
      });
  };

  return (
    <>
      <Route path="/register">
        <Register></Register>
      </Route>
      <div className="main">
        <Navbar
          style={{ minWidth: "360px" }}
          className="py-0"
          fixed="top"
          bg="dark"
          expand="lg"
        >
          <Container fluid className="px-2" style={{ width: "768px" }}>
            <Navbar.Brand className="text-light mx-0">
              <Link to="/" style={{ textDecoration: "none", color: "white" }}>
                MBT(m)I
              </Link>
            </Navbar.Brand>

            <div
              style={{ minWidth: "108px", display: "flex", margin: "8px 0" }}
            >
              <Link
                style={{
                  margin: "auto",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "white",
                  color: "rgb(33, 37, 41)",
                  lineHeight: "36px",
                  textAlign: "center",
                }}
                to="/search"
              >
                <FiSearch size="22"></FiSearch>
              </Link>

              {uid ? (
                <Dropdown>
                  <Dropdown.Toggle
                    size="sm"
                    variant="light"
                    style={{ lineHeight: "20px" }}
                    className="shadow-none rounded-pill px-1 mx-1"
                  >
                    <FiMoreHorizontal size="28"></FiMoreHorizontal>
                  </Dropdown.Toggle>

                  <Dropdown.Menu align="end" variant="light">
                    {nickname === "" ? (
                      <div
                        style={{
                          height: "30px",
                          marginBottom: "8px",
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <ReactLoading
                          type="spin"
                          color="#0d6efd"
                          width="24px"
                        ></ReactLoading>
                      </div>
                    ) : (
                      <Dropdown.Item
                        as={Link}
                        to={nickname ? `/${nickname}` : `/user?uid=${uid}`}
                        style={{
                          display: "flex",
                        }}
                      >
                        <FaUserCircle size="44" color="#a0aec0"></FaUserCircle>
                        <div
                          style={{
                            fontSize: "16px",
                            display: "flex",
                            margin: "0 15px",
                            flexDirection: "column",
                          }}
                        >
                          <span>{nickname && nickname}</span>
                          {nickname ? (
                            <span style={{ color: "#777777" }}>
                              프로필 보기
                            </span>
                          ) : (
                            <span style={{ color: "#777777" }}>
                              프로필 설정하기
                            </span>
                          )}
                        </div>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      onClick={() => {
                        LogOut();
                      }}
                    >
                      로그아웃
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              ) : (
                <div style={{ padding: "2px 0", lineHeight: "32px" }}>
                  <Button
                    className="rounded-pill mx-1"
                    variant="light"
                    size="sm"
                    onClick={() => {
                      LogIn();
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    className="rounded-pill mx-1"
                    variant="outline-light"
                    size="sm"
                    onClick={() => {
                      history.push("/register");
                    }}
                  >
                    가입하기
                  </Button>
                </div>
              )}
            </div>
          </Container>
        </Navbar>

        {post.length === 0 ? (
          <div
            style={{
              marginTop: "80px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ReactLoading
              type="spin"
              color="#0d6efd"
              width="32px"
            ></ReactLoading>
          </div>
        ) : (
          <div className="board">
            <Switch>
              <Route exact path="/">
                <Best best={best}></Best>
                {notification && (
                  <Container className="d-flex justify-content-center">
                    <Button
                      className="rounded-pill"
                      style={{
                        position: "fixed",
                        top: "70px",
                        zIndex: "10",
                        fontSize: "inherit",
                      }}
                      onClick={() => {
                        window.scrollTo(0, 0);
                        setNotification(false);
                      }}
                    >
                      새 게시물
                    </Button>
                  </Container>
                )}
                {create && (
                  <Button
                    variant="primary"
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
                {post.map((a, i) => (
                  <CreateList
                    key={a.data.docId}
                    title={a.data.title}
                    content={a.data.content}
                    uid={a.data.uid}
                    docId={a.data.docId}
                    likes={a.data.likes}
                    likedUser={a.data.likedUser}
                    nickname={a.data.nickname}
                    timestamp={a.data.timeStamp.seconds}
                    mbti={a.data.mbti}
                  ></CreateList>
                ))}
                {isLoading && (
                  <div
                    style={{
                      width: "100%",
                      height: "100px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <ReactLoading
                      type="spin"
                      color="#0d6efd"
                      width="36px"
                    ></ReactLoading>
                  </div>
                )}
                <div ref={setTarget}></div>
              </Route>
              <Route path="/post">
                <Post></Post>
              </Route>
              <Route path="/edit">
                <Edit></Edit>
              </Route>

              <Route path="/search">
                <Search create={create}></Search>
              </Route>
              {user && (
                <Route path="/user">
                  <UserInfo nickname={nickname}></UserInfo>
                </Route>
              )}
              {nickname && (
                <Route path={`/${nickname}/`}>
                  <Profile></Profile>
                </Route>
              )}
              <Route path="/comments">
                <Comments></Comments>
              </Route>

              <NotFound path="/404-not-found"></NotFound>
              <Route path="*">
                <NotFound></NotFound>
              </Route>
            </Switch>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
